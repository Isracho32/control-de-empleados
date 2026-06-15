import { useState, useEffect } from 'react';
import { Pencil, Trash2, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Employee } from '../lib/types';
import { EmployeeForm } from './EmployeeForm';

interface EmployeeListProps {
  onRefresh?: () => void;
}

export function EmployeeList({ onRefresh }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching employees:', error);
    } else {
      setEmployees(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este empleado?')) return;

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting employee:', error);
      alert('Error al eliminar empleado');
    } else {
      fetchEmployees();
      onRefresh?.();
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEmployee(null);
    fetchEmployees();
    onRefresh?.();
  };

  if (loading) {
    return <div className="text-center py-8">Cargando empleados...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Empleados</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <UserPlus size={20} />
          Nuevo Empleado
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cargo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pago
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {employee.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{employee.position}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employee.employee_type === 'monthly'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {employee.employee_type === 'monthly' ? 'Mensual' : 'Por Hora'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {employee.employee_type === 'monthly' ? (
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        Bs {(employee.monthly_salary || 0).toFixed(2)}/mes
                      </div>
                      <div className="text-gray-500 text-xs">
                        Extra: Bs {employee.hourly_rate_extra.toFixed(2)}/hr
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm">
                      <div className="text-gray-900">
                        Normal: Bs {employee.hourly_rate_normal.toFixed(2)}/hr
                      </div>
                      <div className="text-gray-500 text-xs">
                        Extra: Bs {employee.hourly_rate_extra.toFixed(2)}/hr
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employee.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {employee.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {employees.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay empleados registrados. Agregue uno para comenzar.
          </div>
        )}
      </div>

      {showForm && (
        <EmployeeForm
          employee={editingEmployee}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
