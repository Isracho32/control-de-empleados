import { useState, useEffect } from 'react';
import { FileText, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Employee, TimeRecord } from '../lib/types';
import { getWeekRange, formatDate } from '../lib/timeCalculations';

interface EmployeeReport {
  employee: Employee;
  records: TimeRecord[];
  totalNormalHours: number;
  totalExtraHours: number;
  totalNormalPay: number;
  totalExtraPay: number;
  totalPay: number;
  totalHoursMissed: number;
  totalDiscountPay: number;
}

export function WeeklyReport() {
  const [reports, setReports] = useState<EmployeeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(getWeekRange());

  const fetchWeeklyReport = async () => {
    setLoading(true);

    const [employeesResult, recordsResult] = await Promise.all([
      supabase.from('employees').select('*').order('name'),
      supabase
        .from('time_records')
        .select('*')
        .gte('date', dateRange.start)
        .lte('date', dateRange.end)
        .order('date'),
    ]);

    if (employeesResult.error || recordsResult.error) {
      console.error('Error fetching report data');
      setLoading(false);
      return;
    }

    const employees = employeesResult.data || [];
    const records = recordsResult.data || [];

    const employeeReports: EmployeeReport[] = employees.map((employee) => {
      const employeeRecords = records.filter((r: any) => r.employee_id === employee.id);

      const totalNormalHours = employeeRecords.reduce(
        (sum: number, r: any) => sum + (r.normal_hours || 0),
        0
      );
      const totalExtraHours = employeeRecords.reduce(
        (sum: number, r: any) => sum + (r.extra_hours || 0),
        0
      );
      const totalNormalPay = employeeRecords.reduce(
        (sum: number, r: any) => sum + (r.normal_pay || 0),
        0
      );
      const totalExtraPay = employeeRecords.reduce((sum: number, r: any) => sum + (r.extra_pay || 0), 0);
      const totalPay = employeeRecords.reduce((sum: number, r: any) => sum + (r.total_pay || 0), 0);
      const totalHoursMissed = employeeRecords.reduce(
        (sum: number, r: any) => sum + (r.hours_missed || 0),
        0
      );
      const totalDiscountPay = employeeRecords.reduce(
        (sum: number, r: any) => sum + (r.discount_pay || 0),
        0
      );

      return {
        employee,
        records: employeeRecords,
        totalNormalHours,
        totalExtraHours,
        totalNormalPay,
        totalExtraPay,
        totalPay,
        totalHoursMissed,
        totalDiscountPay,
      };
    });

    setReports(employeeReports);
    setLoading(false);
  };

  useEffect(() => {
    fetchWeeklyReport();
  }, [dateRange]);

  const handlePreviousWeek = () => {
    const start = new Date(dateRange.start);
    start.setDate(start.getDate() - 7);
    const end = new Date(dateRange.end);
    end.setDate(end.getDate() - 7);

    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    });
  };

  const handleNextWeek = () => {
    const start = new Date(dateRange.start);
    start.setDate(start.getDate() + 7);
    const end = new Date(dateRange.end);
    end.setDate(end.getDate() + 7);

    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    });
  };

  const handleCurrentWeek = () => {
    setDateRange(getWeekRange());
  };

  const grandTotal = reports.reduce((sum, r) => sum + r.totalPay, 0);

  if (loading) {
    return <div className="text-center py-8">Cargando reporte...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText size={28} />
            Reporte Semanal
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousWeek}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              ← Anterior
            </button>
            <button
              onClick={handleCurrentWeek}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Semana Actual
            </button>
            <button
              onClick={handleNextWeek}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              Siguiente →
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={18} />
          <span>
            {formatDate(new Date(dateRange.start))} - {formatDate(new Date(dateRange.end))}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {reports.map((report) => (
          <div key={report.employee.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{report.employee.name}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        report.employee.employee_type === 'monthly'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {report.employee.employee_type === 'monthly' ? 'Mensual' : 'Por Hora'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{report.employee.position}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-700">
                    Bs {report.totalPay.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">Total Semanal</div>
                  {report.employee.employee_type === 'monthly' && (report.totalHoursMissed || 0) > 0 && (
                    <div className="text-xs text-red-600 mt-1">
                      Descuentos: -Bs {(report.totalDiscountPay || 0).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {report.records.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        Fecha
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        Entrada
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        Salida
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                        Hrs Trabajadas
                      </th>
                      {report.employee.employee_type === 'monthly' && (
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                          Hrs Faltantes
                        </th>
                      )}
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                        Hrs Extra
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                        Pago
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {report.records.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">
                          {formatDate(new Date(record.date))}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {new Date(record.check_in).toLocaleTimeString('es-BO', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {record.check_out
                            ? new Date(record.check_out).toLocaleTimeString('es-BO', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm text-right">
                          {(record.normal_hours || 0).toFixed(2)}
                        </td>
                        {report.employee.employee_type === 'monthly' && (
                          <td className="px-4 py-2 text-sm text-right">
                            {(record.hours_missed || 0) > 0 ? (
                              <span className="text-red-600">{(record.hours_missed || 0).toFixed(2)}</span>
                            ) : (
                              '-'
                            )}
                          </td>
                        )}
                        <td className="px-4 py-2 text-sm text-right">
                          {(record.extra_hours || 0) > 0 ? (
                            <span className="text-green-600">{(record.extra_hours || 0).toFixed(2)}</span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-right font-semibold">
                          Bs {(record.total_pay || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold">
                      <td colSpan={3} className="px-4 py-2 text-sm">
                        Totales
                      </td>
                      <td className="px-4 py-2 text-sm text-right">
                        {report.totalNormalHours.toFixed(2)}
                      </td>
                      {report.employee.employee_type === 'monthly' && (
                        <td className="px-4 py-2 text-sm text-right text-red-600">
                          {report.totalHoursMissed > 0 ? report.totalHoursMissed.toFixed(2) : '-'}
                        </td>
                      )}
                      <td className="px-4 py-2 text-sm text-right text-green-600">
                        {report.totalExtraHours > 0 ? report.totalExtraHours.toFixed(2) : '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-right text-blue-700">
                        Bs {report.totalPay.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                Sin registros esta semana
              </div>
            )}
          </div>
        ))}

        {reports.length > 0 && (
          <div className="border-t-2 border-gray-300 pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span className="text-gray-800">Total General:</span>
              <span className="text-blue-700">Bs {grandTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        {reports.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay datos para mostrar en esta semana.
          </div>
        )}
      </div>
    </div>
  );
}
