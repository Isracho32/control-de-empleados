/*
  # Agregar Soporte para Empleados Mensuales
  
  1. Modificaciones a la Tabla Employees
    - `employee_type` (text) - Tipo de empleado: 'hourly' (por hora) o 'monthly' (mensual)
    - `monthly_salary` (numeric) - Sueldo mensual fijo para empleados mensuales
    - `daily_hours_required` (numeric) - Horas requeridas por día (8 para mensuales)
    - `shift_start` (time) - Hora de inicio de turno
    - `shift_end` (time) - Hora de fin de turno
    
  2. Lógica de Empleados Mensuales
    - Horario: 8:00 - 16:00 (8 horas diarias)
    - Sueldo mensual fijo
    - Horas extras se pagan con tarifa extra
    - Horas no cumplidas se descuentan según proporción del sueldo
    
  3. Cálculo de Pagos
    - Para empleados mensuales:
      * Pago base = sueldo_mensual / días_laborables_del_mes
      * Si trabaja menos de 8 horas: descuento proporcional
      * Si trabaja más de 8 horas: pago extra adicional
    - Para empleados por hora (existentes):
      * Mantiene la lógica actual (11:30-15:00)
*/

-- Agregar nuevas columnas a la tabla employees
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'employee_type'
  ) THEN
    ALTER TABLE employees ADD COLUMN employee_type text DEFAULT 'hourly' CHECK (employee_type IN ('hourly', 'monthly'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'monthly_salary'
  ) THEN
    ALTER TABLE employees ADD COLUMN monthly_salary numeric(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'daily_hours_required'
  ) THEN
    ALTER TABLE employees ADD COLUMN daily_hours_required numeric(4,2) DEFAULT 3.5;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'shift_start'
  ) THEN
    ALTER TABLE employees ADD COLUMN shift_start time DEFAULT '11:30:00';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'shift_end'
  ) THEN
    ALTER TABLE employees ADD COLUMN shift_end time DEFAULT '15:00:00';
  END IF;
END $$;

-- Agregar columnas adicionales a time_records para descuentos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_records' AND column_name = 'hours_missed'
  ) THEN
    ALTER TABLE time_records ADD COLUMN hours_missed numeric(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_records' AND column_name = 'discount_pay'
  ) THEN
    ALTER TABLE time_records ADD COLUMN discount_pay numeric(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_records' AND column_name = 'base_pay'
  ) THEN
    ALTER TABLE time_records ADD COLUMN base_pay numeric(10,2) DEFAULT 0;
  END IF;
END $$;