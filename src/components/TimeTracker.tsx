import { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Employee, TimeRecord } from '../lib/types';
import { calculateHoursAndPay, calculateMonthlyEmployeePay, formatTime, getTodayDateString } from '../lib/timeCalculations';

interface TimeTrackerProps {
  onRecordUpdate?: () => void;
}

export function TimeTracker({ onRecordUpdate }: TimeTrackerProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [todayRecords, setTodayRecords] = useState<TimeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const [employeesResult, recordsResult] = await Promise.all([
      supabase.from('employees').select('*').eq('is_active', true).order('name'),
      supabase.from('time_records').select('*').eq('date', getTodayDateString()),
    ]);

    if (employeesResult.error) {
      console.error('Error fetching employees:', employeesResult.error);
    } else {
      setEmployees(employeesResult.data || []);
    }

    if (recordsResult.error) {
      console.error('Error fetching records:', recordsResult.error);
    } else {
      setTodayRecords(recordsResult.data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async (employee: Employee) => {
    const now = new Date();
    const { error } = await supabase.from('time_records').insert([
      {
        employee_id: employee.id,
        date: getTodayDateString(),
        check_in: now.toISOString(),
      } as any,
    ]);

    if (error) {
      console.error('Error checking in:', error);
      alert('Error al registrar entrada');
    } else {
      fetchData();
      onRecordUpdate?.();
    }
  };

  const handleCheckOut = async (record: TimeRecord, employee: Employee) => {
    const now = new Date();
    const checkIn = new Date(record.check_in);

    let calculation;
    if (employee.employee_type === 'monthly') {
      calculation = calculateMonthlyEmployeePay(
        checkIn,
        now,
        employee.monthly_salary || 5000,
        employee.daily_hours_required || 8,
        employee.shift_start || '08:00:00',
        employee.shift_end || '16:00:00',
        employee.hourly_rate_extra
      );
    } else {
      calculation = calculateHoursAndPay(
        checkIn,
        now,
        employee.hourly_rate_normal,
        employee.hourly_rate_extra
      );
    }

    const updateData: any = {
      check_out: now.toISOString(),
      normal_hours: calculation.normalHours,
      extra_hours: calculation.extraHours,
      normal_pay: calculation.normalPay,
      extra_pay: calculation.extraPay,
      total_pay: calculation.totalPay,
    };

    if (employee.employee_type === 'monthly') {
      updateData.hours_missed = calculation.hoursMissed || 0;
      updateData.discount_pay = calculation.discountPay || 0;
      updateData.base_pay = calculation.basePay || 0;
    }

    const { error } = await supabase
      .from('time_records')
      .update(updateData)
      .eq('id', record.id);

    if (error) {
      console.error('Error checking out:', error);
      alert('Error al registrar salida');
    } else {
      fetchData();
      onRecordUpdate?.();
    }
  };

  const getEmployeeRecord = (employeeId: string): TimeRecord | undefined => {
    return todayRecords.find((r) => r.employee_id === employeeId);
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Control de Asistencia</h2>
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
            <Clock size={24} />
            {formatTime(currentTime)}
          </div>
        </div>
        <div className="text-sm text-gray-600 mt-2 space-y-1">
          <p>Por Hora: 11:30 - 15:00 (3.5 horas)</p>
          <p>Mensual: 8:00 - 16:00 (8 horas)</p>
        </div>
      </div>

      <div className="p-6">
        {employees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay empleados activos. Agregue empleados para comenzar.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {employees.map((employee) => {
              const record = getEmployeeRecord(employee.id);
              const hasCheckedIn = !!record;
              const hasCheckedOut = record?.check_out !== null;

              return (
                <div
                  key={employee.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          employee.employee_type === 'monthly'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {employee.employee_type === 'monthly' ? 'Mensual' : 'Por Hora'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{employee.position}</p>
                  </div>

                  {!hasCheckedIn ? (
                    <button
                      onClick={() => handleCheckIn(employee)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <LogIn size={20} />
                      Marcar Entrada
                    </button>
                  ) : hasCheckedOut ? (
                    <div className="space-y-2">
                      <div className="bg-gray-100 rounded p-3">
                        <div className="text-xs text-gray-600">Entrada</div>
                        <div className="font-semibold">
                          {formatTime(new Date(record.check_in))}
                        </div>
                      </div>
                      <div className="bg-gray-100 rounded p-3">
                        <div className="text-xs text-gray-600">Salida</div>
                        <div className="font-semibold">
                          {formatTime(new Date(record.check_out!))}
                        </div>
                      </div>
                      {employee.employee_type === 'monthly' && (record.hours_missed || 0) > 0 && (
                        <div className="bg-red-50 rounded p-3">
                          <div className="text-xs text-red-600">Horas Faltantes</div>
                          <div className="font-semibold text-red-700">
                            {(record.hours_missed || 0).toFixed(2)} hrs (-Bs {(record.discount_pay || 0).toFixed(2)})
                          </div>
                        </div>
                      )}
                      {(record.extra_hours || 0) > 0 && (
                        <div className="bg-green-50 rounded p-3">
                          <div className="text-xs text-green-600">Horas Extra</div>
                          <div className="font-semibold text-green-700">
                            {(record.extra_hours || 0).toFixed(2)} hrs (+Bs {(record.extra_pay || 0).toFixed(2)})
                          </div>
                        </div>
                      )}
                      <div className="bg-blue-50 rounded p-3">
                        <div className="text-xs text-gray-600">Total</div>
                        <div className="font-bold text-blue-700">
                          Bs {(record.total_pay || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-green-50 rounded p-3">
                        <div className="text-xs text-gray-600">Entrada</div>
                        <div className="font-semibold text-green-700">
                          {formatTime(new Date(record.check_in))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCheckOut(record, employee)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                      >
                        <LogOut size={20} />
                        Marcar Salida
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
