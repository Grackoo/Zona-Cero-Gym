import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  ChevronDown
} from 'lucide-react';

interface FinancialData {
  ingresosVentas: number;
  costoVentas: number;
  gastosOperacion: number;
  efectivoCajas: number;
  ingresosTarjeta: number;
  ingresosTransferencia: number;
  inventariosCosto: number;
  cuentasPorPagar: number;
}

const mockFinancialDataByPeriod: Record<string, Record<string, FinancialData>> = {
  'mensual': {
    'consolidado': {
      ingresosVentas: 45231.89,
      costoVentas: 12450.00,
      gastosOperacion: 8500.00,
      efectivoCajas: 15820.00,
      ingresosTarjeta: 18450.00,
      ingresosTransferencia: 10961.89,
      inventariosCosto: 1670.00,
      cuentasPorPagar: 0.00,
    },
    'matriz': {
      ingresosVentas: 28500.00,
      costoVentas: 7800.00,
      gastosOperacion: 5200.00,
      efectivoCajas: 9500.00,
      ingresosTarjeta: 12000.00,
      ingresosTransferencia: 7000.00,
      inventariosCosto: 1100.00,
      cuentasPorPagar: 0.00,
    },
    'norte': {
      ingresosVentas: 16731.89,
      costoVentas: 4650.00,
      gastosOperacion: 3300.00,
      efectivoCajas: 6320.00,
      ingresosTarjeta: 6450.00,
      ingresosTransferencia: 3961.89,
      inventariosCosto: 570.00,
      cuentasPorPagar: 0.00,
    }
  },
  'diario': {
    'consolidado': {
      ingresosVentas: 1850.00,
      costoVentas: 420.00,
      gastosOperacion: 280.00,
      efectivoCajas: 650.00,
      ingresosTarjeta: 800.00,
      ingresosTransferencia: 400.00,
      inventariosCosto: 1670.00,
      cuentasPorPagar: 0.00,
    },
    'matriz': {
      ingresosVentas: 1200.00,
      costoVentas: 260.00,
      gastosOperacion: 180.00,
      efectivoCajas: 400.00,
      ingresosTarjeta: 550.00,
      ingresosTransferencia: 250.00,
      inventariosCosto: 1100.00,
      cuentasPorPagar: 0.00,
    },
    'norte': {
      ingresosVentas: 650.00,
      costoVentas: 160.00,
      gastosOperacion: 100.00,
      efectivoCajas: 250.00,
      ingresosTarjeta: 250.00,
      ingresosTransferencia: 150.00,
      inventariosCosto: 570.00,
      cuentasPorPagar: 0.00,
    }
  },
  'semanal': {
    'consolidado': {
      ingresosVentas: 11450.00,
      costoVentas: 3100.00,
      gastosOperacion: 2100.00,
      efectivoCajas: 4200.00,
      ingresosTarjeta: 4800.00,
      ingresosTransferencia: 2450.00,
      inventariosCosto: 1670.00,
      cuentasPorPagar: 0.00,
    },
    'matriz': {
      ingresosVentas: 7200.00,
      costoVentas: 1950.00,
      gastosOperacion: 1300.00,
      efectivoCajas: 2600.00,
      ingresosTarjeta: 3100.00,
      ingresosTransferencia: 1500.00,
      inventariosCosto: 1100.00,
      cuentasPorPagar: 0.00,
    },
    'norte': {
      ingresosVentas: 4250.00,
      costoVentas: 1150.00,
      gastosOperacion: 800.00,
      efectivoCajas: 1600.00,
      ingresosTarjeta: 1700.00,
      ingresosTransferencia: 950.00,
      inventariosCosto: 570.00,
      cuentasPorPagar: 0.00,
    }
  },
  'trimestral': {
    'consolidado': {
      ingresosVentas: 138900.00,
      costoVentas: 37500.00,
      gastosOperacion: 25800.00,
      efectivoCajas: 48500.00,
      ingresosTarjeta: 55400.00,
      ingresosTransferencia: 35000.00,
      inventariosCosto: 1670.00,
      cuentasPorPagar: 1200.00,
    },
    'matriz': {
      ingresosVentas: 88500.00,
      costoVentas: 23800.00,
      gastosOperacion: 16200.00,
      efectivoCajas: 31000.00,
      ingresosTarjeta: 35500.00,
      ingresosTransferencia: 22000.00,
      inventariosCosto: 1100.00,
      cuentasPorPagar: 800.00,
    },
    'norte': {
      ingresosVentas: 50400.00,
      costoVentas: 13700.00,
      gastosOperacion: 9600.00,
      efectivoCajas: 17500.00,
      ingresosTarjeta: 19900.00,
      ingresosTransferencia: 13000.00,
      inventariosCosto: 570.00,
      cuentasPorPagar: 400.00,
    }
  },
  'anual': {
    'consolidado': {
      ingresosVentas: 542780.00,
      costoVentas: 149400.00,
      gastosOperacion: 102000.00,
      efectivoCajas: 192000.00,
      ingresosTarjeta: 218780.00,
      ingresosTransferencia: 132000.00,
      inventariosCosto: 1670.00,
      cuentasPorPagar: 3500.00,
    },
    'matriz': {
      ingresosVentas: 345000.00,
      costoVentas: 95000.00,
      gastosOperacion: 65000.00,
      efectivoCajas: 122000.00,
      ingresosTarjeta: 139000.00,
      ingresosTransferencia: 84000.00,
      inventariosCosto: 1100.00,
      cuentasPorPagar: 2200.00,
    },
    'norte': {
      ingresosVentas: 197780.00,
      costoVentas: 54400.00,
      gastosOperacion: 37000.00,
      efectivoCajas: 70000.00,
      ingresosTarjeta: 79780.00,
      ingresosTransferencia: 48000.00,
      inventariosCosto: 570.00,
      cuentasPorPagar: 1300.00,
    }
  }
};

export function FinancialStatements() {
  const [period, setPeriod] = useState<string>('mensual');
  const [branch, setBranch] = useState<string>('consolidado');

  const activeData = (mockFinancialDataByPeriod[period] && mockFinancialDataByPeriod[period][branch]) 
    ? mockFinancialDataByPeriod[period][branch] 
    : mockFinancialDataByPeriod['mensual']['consolidado'];

  // Calculations for Estado de Resultados
  const utilidadBruta = activeData.ingresosVentas - activeData.costoVentas;
  const utilidadNeta = utilidadBruta - activeData.gastosOperacion;

  // Calculations for Estado de Situación Financiera
  const totalActivo = activeData.efectivoCajas + activeData.ingresosTarjeta + activeData.ingresosTransferencia + activeData.inventariosCosto;
  const totalPasivo = activeData.cuentasPorPagar;
  const capitalContable = totalActivo - totalPasivo;

  const formatCurrency = (val: number, isNegative = false) => {
    const formatted = Math.abs(val).toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (isNegative && val > 0) {
      return `-$${formatted}`;
    }
    return `$${formatted}`;
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card matching system dark theme */}
      <div className="bg-cero-panel rounded-2xl p-6 border border-cero-border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#1e293b] rounded-xl text-cero-lime border border-cero-border shrink-0">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Reportes Financieros
            </h1>
            <p className="text-sm text-cero-text-muted mt-0.5">
              Determinación de utilidad y estados financieros formales.
            </p>
          </div>
        </div>

        {/* Filter Controls & PDF Button */}
        <div className="flex flex-wrap items-end gap-3 print:hidden">
          {/* PERIODO */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-cero-text-muted uppercase tracking-wider mb-1 font-mono">
              PERIODO
            </label>
            <div className="relative">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="appearance-none bg-[#1e293b] hover:bg-[#283548] transition-colors border border-cero-border text-white text-sm font-semibold rounded-xl pl-3.5 pr-8 py-2.5 focus:outline-none focus:border-cero-lime cursor-pointer shadow-sm"
              >
                <option value="diario" className="bg-[#10161c] text-white">Diario (Hoy)</option>
                <option value="semanal" className="bg-[#10161c] text-white">Semanal (7 días)</option>
                <option value="mensual" className="bg-[#10161c] text-white">Mensual (30 días)</option>
                <option value="trimestral" className="bg-[#10161c] text-white">Trimestral (90 días)</option>
                <option value="anual" className="bg-[#10161c] text-white">Anual (2026)</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-cero-text-muted pointer-events-none" />
            </div>
          </div>

          {/* SUCURSAL */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-cero-text-muted uppercase tracking-wider mb-1 font-mono">
              SUCURSAL
            </label>
            <div className="relative">
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="appearance-none bg-[#1e293b] hover:bg-[#283548] transition-colors border border-cero-border text-white text-sm font-semibold rounded-xl pl-3.5 pr-8 py-2.5 focus:outline-none focus:border-cero-lime cursor-pointer shadow-sm"
              >
                <option value="consolidado" className="bg-[#10161c] text-white">Consolidado (Todas)</option>
                <option value="matriz" className="bg-[#10161c] text-white">Sucursal Central (Matriz)</option>
                <option value="norte" className="bg-[#10161c] text-white">Sucursal Zona Norte</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-cero-text-muted pointer-events-none" />
            </div>
          </div>

          {/* PDF Button */}
          <button
            onClick={handlePrintPDF}
            className="bg-cero-lime hover:bg-cero-lime-hover text-black text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
            title="Exportar o imprimir a PDF"
          >
            <Download size={16} />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Main Dual Cards Grid in System Dark Theme */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1: ESTADO DE RESULTADOS */}
        <div className="bg-cero-panel rounded-2xl p-7 border border-cero-border shadow-lg flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Estado de Resultados
                </h2>
                <p className="text-xs text-cero-text-muted mt-0.5">
                  Periodo seleccionado
                </p>
              </div>
              <span className="px-2.5 py-1 bg-[#1e293b] text-cero-text-muted font-bold font-mono text-xs rounded-md tracking-wider border border-cero-border">
                ER
              </span>
            </div>

            {/* Financial Rows */}
            <div className="space-y-4 text-sm font-medium">
              {/* Ingresos por Ventas */}
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-300">Ingresos por Ventas</span>
                <span className="text-white font-semibold">{formatCurrency(activeData.ingresosVentas)}</span>
              </div>

              {/* [-] Costo de Ventas (COGS) */}
              <div className="flex justify-between items-center py-1">
                <span className="text-rose-400 font-medium">[-] Costo de Ventas (COGS)</span>
                <span className="text-rose-400 font-medium">
                  {activeData.costoVentas > 0 ? formatCurrency(activeData.costoVentas, true) : '-$0.00'}
                </span>
              </div>

              {/* (=) Utilidad Bruta */}
              <div className="flex justify-between items-center py-1 font-bold text-white border-t border-cero-border/60 pt-3">
                <span>(=) Utilidad Bruta</span>
                <span>{formatCurrency(utilidadBruta)}</span>
              </div>

              {/* [-] Gastos de Operación */}
              <div className="flex justify-between items-center py-1">
                <span className="text-rose-400 font-medium">[-] Gastos de Operación</span>
                <span className="text-rose-400 font-medium">
                  {activeData.gastosOperacion > 0 ? formatCurrency(activeData.gastosOperacion, true) : '-$0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* (=) Utilidad Neta del Ejercicio - Box Highlight */}
          <div className="mt-8 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-4 flex justify-between items-center">
            <span className="text-emerald-400 font-bold text-sm tracking-tight">
              (=) Utilidad Neta del Ejercicio
            </span>
            <span className="text-emerald-400 font-bold text-lg">
              {formatCurrency(utilidadNeta)}
            </span>
          </div>
        </div>

        {/* CARD 2: ESTADO DE SITUACIÓN FINANCIERA */}
        <div className="bg-cero-panel rounded-2xl p-7 border border-cero-border shadow-lg flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Estado de Situación Financiera
                </h2>
                <p className="text-xs text-cero-text-muted mt-0.5">
                  Balance General
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 font-bold text-xs rounded-full tracking-wider border border-emerald-500/20 flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 size={13} className="text-emerald-400" />
                CUADRADO
              </span>
            </div>

            {/* Content Sections */}
            <div className="space-y-4 text-sm font-medium">
              
              {/* ACTIVO CIRCULANTE */}
              <div>
                <div className="text-[11px] font-bold text-cero-text-muted uppercase tracking-wider mb-2 font-mono">
                  ACTIVO CIRCULANTE
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Efectivo Equivalente (Cajas)</span>
                    <span className="text-white font-semibold">{formatCurrency(activeData.efectivoCajas)}</span>
                  </div>

                  <div className="flex justify-between items-center text-cero-text-muted text-xs pl-4">
                    <span className="flex items-center gap-1.5">
                      <span className="text-cero-border font-mono">└</span> Ingresos por Tarjeta (Bancos)
                    </span>
                    <span className="text-gray-300 font-medium">{formatCurrency(activeData.ingresosTarjeta)}</span>
                  </div>

                  <div className="flex justify-between items-center text-cero-text-muted text-xs pl-4">
                    <span className="flex items-center gap-1.5">
                      <span className="text-cero-border font-mono">└</span> Ingresos por Transferencia (Bancos)
                    </span>
                    <span className="text-gray-300 font-medium">{formatCurrency(activeData.ingresosTransferencia)}</span>
                  </div>

                  <div className="flex justify-between items-center text-gray-300 pt-1">
                    <span>Inventarios (Valuación a Costo)</span>
                    <span className="text-white font-semibold">{formatCurrency(activeData.inventariosCosto)}</span>
                  </div>
                </div>
              </div>

              {/* Total Activo */}
              <div className="flex justify-between items-center py-2 border-t border-cero-border/60 font-bold text-white text-base">
                <span>Total Activo</span>
                <span>{formatCurrency(totalActivo)}</span>
              </div>

              {/* PASIVO */}
              <div className="pt-1">
                <div className="text-[11px] font-bold text-cero-text-muted uppercase tracking-wider mb-2 font-mono">
                  PASIVO
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span>Cuentas por Pagar (Proveedores)</span>
                  <span className="text-white font-semibold">{formatCurrency(activeData.cuentasPorPagar)}</span>
                </div>
              </div>

              {/* Total Pasivo */}
              <div className="flex justify-between items-center py-1 font-bold text-rose-400 text-base">
                <span>Total Pasivo</span>
                <span>{formatCurrency(totalPasivo)}</span>
              </div>

              {/* PATRIMONIO / CAPITAL */}
              <div className="pt-1">
                <div className="text-[11px] font-bold text-cero-text-muted uppercase tracking-wider mb-2 font-mono">
                  PATRIMONIO / CAPITAL
                </div>
                <div className="flex justify-between items-center text-gray-200 font-semibold">
                  <span>Capital Contable</span>
                  <span className="text-white font-bold">{formatCurrency(capitalContable)}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Footer Validation Status */}
          <div className="mt-4 pt-3 border-t border-cero-border/60 flex items-center justify-between text-xs text-cero-text-muted">
            <span>Ecuación Contable: Activo = Pasivo + Capital</span>
            <span className="font-mono text-emerald-400 font-bold">
              {formatCurrency(totalActivo)} = {formatCurrency(totalPasivo + capitalContable)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
