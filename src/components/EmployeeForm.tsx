import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Employee } from '../lib/types';

interface EmployeeFormProps {
  employee: Employee | null;
  onClose: () => void;
}

export function EmployeeForm({ employee, onClose }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    position: 'Empleado',
    employee_type: 'hourly' as 'hourly' | 'monthly',
    hourly_rate_normal: 30,
    hourly_rate_extra: 45,
    monthly_salary: 5000,
    daily_hours_required: 8,
    shift_start: '08:00:00',
    shift_end: '16:00:00',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        position: employee.position,
        employee_type: (employee.employee_type || 'hourly') as 'hourly' | 'monthly',
        hourly_rate_normal: employee.hourly_rate_normal,
        hourly_rate_extra: employee.hourly_rate_extra,
        monthly_salary: employee.monthly_salary || 5000,
        daily_hours_required: employee.daily_hours_required || 8,
        shift_start: employee.shift_start || '08:00:00',
        shift_end: employee.shift_end || '16:00:00',
        is_active: employee.is_active ?? true,
      });
    }
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (employee) {
      const { error } = await supabase
        .from('employees')
        .update(formData as any)
        .eq('id', employee.id);

      if (error) {
        console.error('Error updating employee:', error);
        alert('Error al actualizar empleado');
      } else {
        onClose();
      }
    } else {
      const { error } = await supabase
        .from('employees')
        .insert([formData as any]);

      if (error) {
        console.error('Error creating employee:', error);
        alert('Error al crear empleado');
      } else {
        onClose();
      }
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">
            {employee ? 'Editar Empleado' : 'Nuevo Empleado'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cargo
            </label>
            <input
              type="text"
              required
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Vendedor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Empleado
            </label>
            <select
              value={formData.employee_type}
              onChange={(e) => setFormData({ ...formData, employee_type: e.target.value as 'hourly' | 'monthly' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="hourly">Por Hora (11:30 - 15:00)</option>
              <option value="monthly">Mensual (8:00 - 16:00)</option>
            </select>
          </div>

          {formData.employee_type === 'monthly' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sueldo Mensual (Bs)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.monthly_salary}
                  onChange={(e) => setFormData({ ...formData, monthly_salary: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horas Requeridas por Día
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="24"
                  step="0.5"
                  value={formData.daily_hours_required}
                  onChange={(e) => setFormData({ ...formData, daily_hours_required: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora de Entrada
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.shift_start.substring(0, 5)}
                    onChange={(e) => setFormData({ ...formData, shift_start: e.target.value + ':00' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora de Salida
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.shift_end.substring(0, 5)}
                    onChange={(e) => setFormData({ ...formData, shift_end: e.target.value + ':00' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tarifa Hora Extra (Bs)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.hourly_rate_extra}
                  onChange={(e) => setFormData({ ...formData, hourly_rate_extra: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tarifa Hora Normal (Bs)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.hourly_rate_normal}
                  onChange={(e) => setFormData({ ...formData, hourly_rate_normal: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tarifa Hora Extra (Bs)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.hourly_rate_extra}
                  onChange={(e) => setFormData({ ...formData, hourly_rate_extra: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Empleado Activo
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
