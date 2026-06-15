export interface TimeCalculation {
  normalHours: number;
  extraHours: number;
  normalPay: number;
  extraPay: number;
  totalPay: number;
  hoursMissed?: number;
  discountPay?: number;
  basePay?: number;
}

const NORMAL_START_HOUR = 11;
const NORMAL_START_MINUTE = 30;
const NORMAL_END_HOUR = 15;
const NORMAL_END_MINUTE = 0;
const NORMAL_DURATION_HOURS = 3.5;

export function calculateHoursAndPay(
  checkIn: Date,
  checkOut: Date,
  normalRate: number,
  extraRate: number
): TimeCalculation {
  const totalMinutes = Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60));
  const totalHours = totalMinutes / 60;

  const normalStart = new Date(checkIn);
  normalStart.setHours(NORMAL_START_HOUR, NORMAL_START_MINUTE, 0, 0);

  const normalEnd = new Date(checkIn);
  normalEnd.setHours(NORMAL_END_HOUR, NORMAL_END_MINUTE, 0, 0);

  const workedStart = checkIn.getTime();
  const workedEnd = checkOut.getTime();

  const normalRangeStart = normalStart.getTime();
  const normalRangeEnd = normalEnd.getTime();

  const overlapStart = Math.max(workedStart, normalRangeStart);
  const overlapEnd = Math.min(workedEnd, normalRangeEnd);

  let normalHours = 0;
  let extraHours = 0;

  if (overlapStart < overlapEnd) {
    const overlapMinutes = Math.floor((overlapEnd - overlapStart) / (1000 * 60));
    normalHours = overlapMinutes / 60;

    if (normalHours >= NORMAL_DURATION_HOURS) {
      extraHours = totalHours - normalHours;
    } else {
      normalHours = 0;
      extraHours = totalHours;
    }
  } else {
    extraHours = totalHours;
  }

  const normalPay = normalHours * normalRate;
  const extraPay = extraHours * extraRate;
  const totalPay = normalPay + extraPay;

  return {
    normalHours: Math.round(normalHours * 100) / 100,
    extraHours: Math.round(extraHours * 100) / 100,
    normalPay: Math.round(normalPay * 100) / 100,
    extraPay: Math.round(extraPay * 100) / 100,
    totalPay: Math.round(totalPay * 100) / 100,
  };
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export function getWeekRange(): { start: string; end: string } {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
}

function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

export function calculateMonthlyEmployeePay(
  checkIn: Date,
  checkOut: Date,
  monthlySalary: number,
  dailyHoursRequired: number,
  shiftStart: string,
  shiftEnd: string,
  extraRate: number
): TimeCalculation {
  const totalMinutes = Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60));
  const totalHours = totalMinutes / 60;

  const workingDaysPerMonth = 22;
  const dailyBasePay = monthlySalary / workingDaysPerMonth;

  const startTime = parseTimeString(shiftStart);
  const endTime = parseTimeString(shiftEnd);

  const shiftStartDate = new Date(checkIn);
  shiftStartDate.setHours(startTime.hours, startTime.minutes, 0, 0);

  const shiftEndDate = new Date(checkIn);
  shiftEndDate.setHours(endTime.hours, endTime.minutes, 0, 0);

  const workedStart = checkIn.getTime();
  const workedEnd = checkOut.getTime();
  const shiftStartTime = shiftStartDate.getTime();
  const shiftEndTime = shiftEndDate.getTime();

  const overlapStart = Math.max(workedStart, shiftStartTime);
  const overlapEnd = Math.min(workedEnd, shiftEndTime);

  let normalHours = 0;
  if (overlapStart < overlapEnd) {
    const overlapMinutes = Math.floor((overlapEnd - overlapStart) / (1000 * 60));
    normalHours = overlapMinutes / 60;
  }

  const hoursMissed = Math.max(0, dailyHoursRequired - normalHours);
  const extraHours = Math.max(0, totalHours - dailyHoursRequired);

  const discountPay = (hoursMissed / dailyHoursRequired) * dailyBasePay;
  const basePay = dailyBasePay - discountPay;
  const extraPay = extraHours * extraRate;
  const totalPay = basePay + extraPay;

  return {
    normalHours: Math.round(normalHours * 100) / 100,
    extraHours: Math.round(extraHours * 100) / 100,
    normalPay: Math.round(basePay * 100) / 100,
    extraPay: Math.round(extraPay * 100) / 100,
    totalPay: Math.round(totalPay * 100) / 100,
    hoursMissed: Math.round(hoursMissed * 100) / 100,
    discountPay: Math.round(discountPay * 100) / 100,
    basePay: Math.round(dailyBasePay * 100) / 100,
  };
}
