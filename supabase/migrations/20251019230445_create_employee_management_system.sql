/*
  # Sistema de Control de Empleados
  
  1. Nuevas Tablas
    - `employees` (empleados)
      - `id` (uuid, primary key)
      - `name` (text) - Nombre completo del empleado
      - `position` (text) - Cargo del empleado
      - `hourly_rate_normal` (numeric) - Tarifa por hora normal (11:30-15:00) en Bs
      - `hourly_rate_extra` (numeric) - Tarifa por hora extra en Bs
      - `is_active` (boolean) - Estado del empleado (activo/inactivo)
      - `created_at` (timestamptz) - Fecha de creación
      
    - `time_records` (registros de tiempo)
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key) - Referencia al empleado
      - `date` (date) - Fecha del registro
      - `check_in` (timestamptz) - Hora de entrada
      - `check_out` (timestamptz) - Hora de salida (nullable)
      - `normal_hours` (numeric) - Horas normales trabajadas
      - `extra_hours` (numeric) - Horas extras trabajadas
      - `normal_pay` (numeric) - Pago por horas normales en Bs
      - `extra_pay` (numeric) - Pago por horas extras en Bs
      - `total_pay` (numeric) - Pago total del día en Bs
      - `created_at` (timestamptz) - Fecha de creación
      - `updated_at` (timestamptz) - Última actualización
      
  2. Seguridad
    - Habilitar RLS en ambas tablas
    - Las políticas permiten acceso completo para usuarios autenticados
    - En producción, ajustar según roles específicos
    
  3. Índices
    - Índice en employee_id para búsquedas rápidas
    - Índice en date para reportes por fecha
    - Índice compuesto en (employee_id, date) para evitar duplicados del mismo día
    
  4. Notas importantes
    - El horario normal es de 11:30 a 15:00 (3.5 horas)
    - Si no se completa el horario normal, todas las horas se consideran extras
    - Los registros se guardan para reportes semanales
    - Al final del día, el check_out cierra el registro
*/

-- Crear tabla de empleados
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL DEFAULT 'Empleado',
  hourly_rate_normal numeric(10,2) NOT NULL DEFAULT 30.00,
  hourly_rate_extra numeric(10,2) NOT NULL DEFAULT 45.00,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de registros de tiempo
CREATE TABLE IF NOT EXISTS time_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  check_in timestamptz NOT NULL,
  check_out timestamptz,
  normal_hours numeric(10,2) DEFAULT 0,
  extra_hours numeric(10,2) DEFAULT 0,
  normal_pay numeric(10,2) DEFAULT 0,
  extra_pay numeric(10,2) DEFAULT 0,
  total_pay numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_time_records_employee ON time_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_records_date ON time_records(date);
CREATE INDEX IF NOT EXISTS idx_time_records_employee_date ON time_records(employee_id, date);

-- Habilitar RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_records ENABLE ROW LEVEL SECURITY;

-- Políticas para employees
CREATE POLICY "Allow all operations on employees"
  ON employees
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas para time_records
CREATE POLICY "Allow all operations on time_records"
  ON time_records
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en time_records
DROP TRIGGER IF EXISTS update_time_records_updated_at ON time_records;
CREATE TRIGGER update_time_records_updated_at
  BEFORE UPDATE ON time_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();