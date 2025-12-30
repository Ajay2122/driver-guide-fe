export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  homeTerminal: string;
  mainOfficeAddress: string;
}

export interface GPSCoordinate {
  lat: number;
  lng: number;
  timestamp?: string;
}

export interface DutyStatus {
  status: 'off-duty' | 'sleeper' | 'driving' | 'on-duty';
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  location?: string;
  coordinates?: GPSCoordinate;
}

export interface DailyLog {
  id: string;
  driverId: string;
  driver: Driver;
  date: string;
  dutyStatuses: DutyStatus[];
  remarks: string;
  shippingDocuments: string;
  coDriverName: string;
  vehicleNumbers: string;
  totalMiles: number;
  totalMilesToday: number;
  totalMilesYesterday: number;
  hours: {
    offDuty: number;
    sleeper: number;
    driving: number;
    onDuty: number;
    total: number;
  };
  created: string;
  updated: string;
}

export interface HoursCalculation {
  offDuty: number;
  sleeper: number;
  driving: number;
  onDuty: number;
  total: number;
}





