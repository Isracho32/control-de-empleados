import { useState } from 'react';
import { Users, Clock, FileText } from 'lucide-react';
import { EmployeeList } from './components/EmployeeList';
import { TimeTracker } from './components/TimeTracker';
import { WeeklyReport } from './components/WeeklyReport';

type Tab = 'employees' | 'tracker' | 'reports';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('tracker');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistema de Control de Empleados
          </h1>
          <p className="text-gray-600">
            Gestión de horarios, asistencia y reportes semanales
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'tracker'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Clock size={20} />
              Control de Asistencia
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'employees'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Users size={20} />
              Empleados
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'reports'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FileText size={20} />
              Reportes
            </button>
          </div>
        </div>

        <div key={refreshKey}>
          {activeTab === 'tracker' && <TimeTracker onRecordUpdate={handleRefresh} />}
          {activeTab === 'employees' && <EmployeeList onRefresh={handleRefresh} />}
          {activeTab === 'reports' && <WeeklyReport />}
        </div>
      </div>
    </div>
  );
}

export default App;
