import { DutyStatus, HoursCalculation } from '../types';

export const calculateHoursFromStatuses = (dutyStatuses: DutyStatus[]): HoursCalculation => {
  const hours: HoursCalculation = {
    offDuty: 0,
    sleeper: 0,
    driving: 0,
    onDuty: 0,
    total: 24
  };

  dutyStatuses.forEach(status => {
    const duration = calculateDuration(
      status.startHour,
      status.startMinute,
      status.endHour,
      status.endMinute
    );

    switch (status.status) {
      case 'off-duty':
        hours.offDuty += duration;
        break;
      case 'sleeper':
        hours.sleeper += duration;
        break;
      case 'driving':
        hours.driving += duration;
        break;
      case 'on-duty':
        hours.onDuty += duration;
        break;
    }
  });

  return hours;
};

export const calculateDuration = (
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number
): number => {
  const startMinutes = startHour * 60 + startMinute;
  let endMinutes = endHour * 60 + endMinute;

  // Handle crossing midnight
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  return (endMinutes - startMinutes) / 60;
};

export const formatDuration = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

export const isValidDutyStatus = (status: DutyStatus): boolean => {
  // Check if times are valid
  if (status.startHour < 0 || status.startHour > 24) return false;
  if (status.endHour < 0 || status.endHour > 24) return false;
  if (status.startMinute < 0 || status.startMinute > 59) return false;
  if (status.endMinute < 0 || status.endMinute > 59) return false;

  // Check if duration is positive
  const duration = calculateDuration(
    status.startHour,
    status.startMinute,
    status.endHour,
    status.endMinute
  );

  return duration > 0;
};

export const checkHOSCompliance = (hours: HoursCalculation): {
  isCompliant: boolean;
  violations: string[];
} => {
  const violations: string[] = [];

  // 11-Hour Driving Limit
  if (hours.driving > 11) {
    violations.push(`Driving time (${hours.driving.toFixed(1)}h) exceeds 11-hour limit`);
  }

  // 14-Hour Driving Window (On-duty + Driving)
  const onDutyTime = hours.onDuty + hours.driving;
  if (onDutyTime > 14) {
    violations.push(`On-duty time (${onDutyTime.toFixed(1)}h) exceeds 14-hour window`);
  }

  // 10-Hour Off-duty requirement (Off-duty + Sleeper should be at least 10)
  const restTime = hours.offDuty + hours.sleeper;
  if (restTime < 10) {
    violations.push(`Rest time (${restTime.toFixed(1)}h) is less than required 10 hours`);
  }

  return {
    isCompliant: violations.length === 0,
    violations
  };
};





