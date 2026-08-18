-- ==============================================================================
-- SEED DE DATOS INICIALES: ZONA CERO GYM
-- Ejecutar en Supabase SQL Editor si deseas precargar miembros, entrenadores y saldos
-- ==============================================================================

-- 1. Insertar entrenadores / staff
INSERT INTO public.staff (name, role, phone, email, status)
VALUES 
    ('Coach Valeria Mendez', 'Entrenadora Senior & Nutrición', '+52 55 1122 3344', 'valeria@zonacero.com', 'Activo'),
    ('Coach Marcos Rios', 'Especialista en Acondicionamiento & HIIT', '+52 55 5566 7788', 'marcos@zonacero.com', 'Activo')
ON CONFLICT DO NOTHING;

-- 2. Insertar miembros de prueba
INSERT INTO public.members (id, full_name, phone, plan_type, status, avatar_url, access_token, member_pin, birth_date, fitness_goal, created_at)
VALUES 
    ('a1111111-1111-1111-1111-111111111101', 'Carlos Mendoza', '+52 55 1234 5678', 'Mensual Premium', 'Activo', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250&h=250', 'carlos-mendoza-token-77', '1234', '1998-04-12', 'hipertrofia', now() - interval '90 days'),
    ('a1111111-1111-1111-1111-111111111102', 'Elia Hernandez', '+52 55 9876 5432', 'Anual Premium', 'Activo', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250&h=250', 'elia-hernandez-token-88', '4321', '2001-09-24', 'perdida_grasa', now() - interval '60 days'),
    ('a1111111-1111-1111-1111-111111111103', 'Maria Lopez', '+52 55 4567 8901', 'Mensual Básico', 'Activo', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250&h=250', 'maria-lopez-token-99', '2026', '1989-11-03', 'salud_general', now() - interval '45 days'),
    ('a1111111-1111-1111-1111-111111111104', 'Elena Rodriguez', '+52 55 2345 6789', 'Anual Estándar', 'Activo', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=250&h=250', 'elena-rodriguez-token-11', '8888', '1995-07-19', 'mantenimiento', now() - interval '120 days'),
    ('a1111111-1111-1111-1111-111111111105', 'Sarah Jenkins', '+52 55 8765 4321', 'Anual Premium', 'Activo', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250&h=250', 'sarah-jenkins-token-22', '9999', '1992-03-15', 'hipertrofia', now() - interval '150 days'),
    ('a1111111-1111-1111-1111-111111111106', 'Roberto Valdés', '+52 55 6789 0123', 'Mensual Básico', 'Activo', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250&h=250', 'roberto-valdes-token-33', '5555', '1982-12-05', 'perdida_grasa', now() - interval '30 days')
ON CONFLICT (id) DO NOTHING;

-- 3. Asignar saldos iniciales en billeteras
INSERT INTO public.member_wallets (member_id, balance)
VALUES 
    ('a1111111-1111-1111-1111-111111111101', 45.00),
    ('a1111111-1111-1111-1111-111111111102', 60.00),
    ('a1111111-1111-1111-1111-111111111103', 15.00),
    ('a1111111-1111-1111-1111-111111111104', 25.00),
    ('a1111111-1111-1111-1111-111111111105', 80.00),
    ('a1111111-1111-1111-1111-111111111106', 10.00)
ON CONFLICT (member_id) DO UPDATE SET balance = EXCLUDED.balance;

-- 4. Insertar historial de mediciones biométricas
INSERT INTO public.member_biometrics_history (member_id, weight, body_fat_percentage, muscle_mass_kg, notes, measured_at)
VALUES 
    ('a1111111-1111-1111-1111-111111111101', 84.5, 19.2, 41.0, 'Evaluación inicial. Buena masa muscular base.', now() - interval '90 days'),
    ('a1111111-1111-1111-1111-111111111101', 83.2, 17.8, 41.8, 'Disminución de grasa visceral y aumento de fuerza en press militar.', now() - interval '60 days'),
    ('a1111111-1111-1111-1111-111111111101', 82.0, 16.1, 42.5, 'Excelente recomposición corporal. Mantener superávit limpio.', now() - interval '30 days'),
    ('a1111111-1111-1111-1111-111111111101', 81.3, 14.8, 43.1, 'Objetivo de hipertrofia cumpliéndose con alta definición.', now() - interval '5 days'),
    ('a1111111-1111-1111-1111-111111111102', 68.0, 28.5, 27.2, 'Inicio plan déficit calórico guiado.', now() - interval '60 days'),
    ('a1111111-1111-1111-1111-111111111102', 66.2, 26.0, 27.5, 'Buena respuesta cardiovascular.', now() - interval '30 days'),
    ('a1111111-1111-1111-1111-111111111102', 64.5, 23.4, 28.0, 'Gran consistencia en asistencia. -4kg totales de grasa.', now() - interval '7 days')
ON CONFLICT DO NOTHING;

-- 5. Insertar logs de asistencia de ejemplo
INSERT INTO public.attendance_logs (member_id, type, status, similarity, reason, created_at)
VALUES 
    ('a1111111-1111-1111-1111-111111111101', 'Entrada', 'Permitido', 98.4, 'Membresía Activa - Coincidencia Facial 98.4%', now() - interval '2 hours'),
    ('a1111111-1111-1111-1111-111111111102', 'Entrada', 'Permitido', 99.1, 'Membresía Activa - Coincidencia Facial 99.1%', now() - interval '3 hours'),
    ('a1111111-1111-1111-1111-111111111106', 'Entrada', 'Permitido', 97.2, 'Membresía Activa - Coincidencia Facial 97.2%', now() - interval '3 days')
ON CONFLICT DO NOTHING;
