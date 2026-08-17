-- ==============================================================================
-- MIGRACIÓN SUPABASE: ZONA CERO GYM - RETENCIÓN, GAMIFICACIÓN Y PORTAL DEL MIEMBRO
-- Fecha: 2026-08-16
-- ==============================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Asegurar existencia de tabla `members` y extender con nuevos campos
DO $$ 
BEGIN
    -- Si la tabla members no existiese, se crea la estructura base
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'members') THEN
        CREATE TABLE public.members (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            full_name TEXT NOT NULL,
            phone TEXT,
            plan_type TEXT DEFAULT 'Mensual Premium',
            status TEXT DEFAULT 'Activo' CHECK (status IN ('Activo', 'Vencido', 'Congelado', 'Active', 'Overdue', 'Frozen')),
            avatar_url TEXT,
            whatsapp_connected BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );
    END IF;
END $$;

-- Modificar tabla `members` agregando las columnas requeridas si no existen
ALTER TABLE public.members
    ADD COLUMN IF NOT EXISTS access_token UUID DEFAULT gen_random_uuid() NOT NULL,
    ADD COLUMN IF NOT EXISTS member_pin VARCHAR(6) DEFAULT '1234',
    ADD COLUMN IF NOT EXISTS birth_date DATE,
    ADD COLUMN IF NOT EXISTS fitness_goal TEXT DEFAULT 'salud_general' 
        CHECK (fitness_goal IN ('perdida_grasa', 'hipertrofia', 'mantenimiento', 'salud_general'));

-- Asegurar restricción UNIQUE para access_token
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'members_access_token_key'
    ) THEN
        ALTER TABLE public.members ADD CONSTRAINT members_access_token_key UNIQUE (access_token);
    END IF;
END $$;

-- 3. Tabla `member_wallets`
CREATE TABLE IF NOT EXISTS public.member_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    balance NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT member_wallets_member_id_key UNIQUE (member_id)
);

-- 4. Tabla `wallet_transactions`
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('checkin_reward', 'pos_redemption', 'manual_adjustment')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabla `staff` (si no existe) para vincular mediciones
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Entrenador',
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'Activo',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabla `member_biometrics_history`
CREATE TABLE IF NOT EXISTS public.member_biometrics_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    weight NUMERIC(5,2) NOT NULL,
    body_fat_percentage NUMERIC(4,1),
    muscle_mass_kg NUMERIC(5,2),
    notes TEXT,
    measured_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Tabla `attendance_logs` (si no existe para soporte de retención)
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'Entrada' CHECK (type IN ('Entrada', 'Salida')),
    status TEXT NOT NULL DEFAULT 'Permitido' CHECK (status IN ('Permitido', 'Denegado')),
    similarity NUMERIC(5,2) DEFAULT 98.0,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Índices para consultas de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_members_access_token ON public.members(access_token);
CREATE INDEX IF NOT EXISTS idx_wallets_member_id ON public.member_wallets(member_id);
CREATE INDEX IF NOT EXISTS idx_transactions_member_id ON public.wallet_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_biometrics_member_id ON public.member_biometrics_history(member_id);
CREATE INDEX IF NOT EXISTS idx_biometrics_measured_at ON public.member_biometrics_history(measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_member_id_created ON public.attendance_logs(member_id, created_at DESC);

-- 9. Función RPC Atómica: increment_wallet_balance
CREATE OR REPLACE FUNCTION public.increment_wallet_balance(
    p_member_id UUID,
    p_amount NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_balance NUMERIC;
BEGIN
    -- Asegurar o insertar billetera con balance inicial
    INSERT INTO public.member_wallets (member_id, balance, updated_at)
    VALUES (p_member_id, GREATEST(0, p_amount), now())
    ON CONFLICT (member_id) DO UPDATE
    SET 
        balance = CASE 
            WHEN public.member_wallets.balance + p_amount < 0 THEN 
                RAISE_EXCEPTION('Saldo insuficiente en la billetera')
            ELSE 
                public.member_wallets.balance + p_amount 
        END,
        updated_at = now()
    RETURNING balance INTO v_new_balance;

    RETURN v_new_balance;
EXCEPTION
    WHEN check_violation THEN
        RAISE EXCEPTION 'Operación cancelada: El saldo no puede ser negativo.';
END;
$$;

-- 10. Función RPC para obtener miembros en riesgo de inactividad (>= 3 días)
CREATE OR REPLACE FUNCTION public.get_inactive_members_risk(p_days_threshold INT DEFAULT 3)
RETURNS TABLE (
    member_id UUID,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    plan_type TEXT,
    last_attendance TIMESTAMPTZ,
    days_inactive INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH latest_checkins AS (
        SELECT 
            al.member_id,
            MAX(al.created_at) AS last_checkin
        FROM public.attendance_logs al
        WHERE al.status = 'Permitido' AND al.type = 'Entrada'
        GROUP BY al.member_id
    )
    SELECT 
        m.id AS member_id,
        m.full_name,
        m.phone,
        m.avatar_url,
        m.plan_type,
        COALESCE(lc.last_checkin, m.created_at) AS last_attendance,
        EXTRACT(DAY FROM (now() - COALESCE(lc.last_checkin, m.created_at)))::INT AS days_inactive
    FROM public.members m
    LEFT JOIN latest_checkins lc ON lc.member_id = m.id
    WHERE m.status IN ('Activo', 'Active')
      AND (lc.last_checkin IS NULL OR lc.last_checkin <= (now() - (p_days_threshold || ' days')::INTERVAL))
    ORDER BY days_inactive DESC;
END;
$$;

-- 11. Habilitar RLS (Row Level Security) y Políticas de Acceso
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_biometrics_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura/escritura pública (o según autenticación supabase)
CREATE POLICY "Public Read Members by Token" ON public.members FOR SELECT USING (true);
CREATE POLICY "Allow All Wallets" ON public.member_wallets FOR ALL USING (true);
CREATE POLICY "Allow All Transactions" ON public.wallet_transactions FOR ALL USING (true);
CREATE POLICY "Allow All Biometrics" ON public.member_biometrics_history FOR ALL USING (true);
CREATE POLICY "Allow All Attendance" ON public.attendance_logs FOR ALL USING (true);

-- 12. Trigger para auto-crear la wallet cuando se registra un miembro
CREATE OR REPLACE FUNCTION public.handle_new_member_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.member_wallets (member_id, balance)
    VALUES (NEW.id, 0.00)
    ON CONFLICT (member_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_member_created_wallet ON public.members;
CREATE TRIGGER on_member_created_wallet
    AFTER INSERT ON public.members
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_member_wallet();
