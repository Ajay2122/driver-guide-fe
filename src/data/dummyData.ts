import { Driver, DailyLog, DutyStatus, GPSCoordinate } from '../types';

export const dummyDrivers: Driver[] = [
  {
    id: '1',
    name: 'John Smith',
    licenseNumber: 'DL-12345678',
    homeTerminal: 'Los Angeles Terminal',
    mainOfficeAddress: '123 Main St, Los Angeles, CA 90001'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    licenseNumber: 'DL-87654321',
    homeTerminal: 'Houston Terminal',
    mainOfficeAddress: '456 Oak Ave, Houston, TX 77001'
  },
  {
    id: '3',
    name: 'Mike Davis',
    licenseNumber: 'DL-55667788',
    homeTerminal: 'Chicago Terminal',
    mainOfficeAddress: '789 Elm St, Chicago, IL 60601'
  },
  {
    id: '4',
    name: 'Emily Chen',
    licenseNumber: 'DL-99887766',
    homeTerminal: 'New York Terminal',
    mainOfficeAddress: '321 Park Blvd, New York, NY 10001'
  }
];

// GPS route generator - simulates common trucking routes
const generateRouteCoordinates = (pattern: number): GPSCoordinate[] => {
  const routes = [
    // Route 1: Los Angeles to San Francisco (I-5 North)
    [
      { lat: 34.0522, lng: -118.2437 }, // Los Angeles Terminal
      { lat: 34.9592, lng: -118.4454 }, // Santa Clarita
      { lat: 35.3733, lng: -119.0187 }, // Bakersfield
      { lat: 36.7378, lng: -119.7871 }, // Fresno
      { lat: 37.7749, lng: -122.4194 }  // San Francisco
    ],
    // Route 2: Houston to Dallas (I-45 North)
    [
      { lat: 29.7604, lng: -95.3698 },  // Houston Terminal
      { lat: 30.6280, lng: -96.3344 },  // College Station
      { lat: 31.5497, lng: -97.1467 },  // Waco
      { lat: 32.7767, lng: -96.7970 }   // Dallas
    ],
    // Route 3: Chicago to St. Louis (I-55 South)
    [
      { lat: 41.8781, lng: -87.6298 },  // Chicago Terminal
      { lat: 41.0681, lng: -88.1487 },  // Joliet
      { lat: 39.8045, lng: -89.6440 },  // Springfield
      { lat: 38.6270, lng: -90.1994 }   // St. Louis
    ]
  ];

  return routes[pattern % routes.length];
};

const generateDutyStatuses = (day: number): DutyStatus[] => {
  const routeCoords = generateRouteCoordinates(day);
  
  const patterns = [
    // Pattern 1: Regular day shift
    [
      { status: 'off-duty' as const, startHour: 0, startMinute: 0, endHour: 6, endMinute: 0, coordinates: routeCoords[0] },
      { status: 'on-duty' as const, startHour: 6, startMinute: 0, endHour: 7, endMinute: 0, location: 'Terminal', coordinates: routeCoords[0] },
      { status: 'driving' as const, startHour: 7, startMinute: 0, endHour: 12, endMinute: 0, location: 'I-95 North', coordinates: routeCoords[1] },
      { status: 'on-duty' as const, startHour: 12, startMinute: 0, endHour: 12, endMinute: 30, location: 'Rest Stop', coordinates: routeCoords[2] },
      { status: 'driving' as const, startHour: 12, startMinute: 30, endHour: 17, endMinute: 30, location: 'I-95 North', coordinates: routeCoords[3] },
      { status: 'on-duty' as const, startHour: 17, startMinute: 30, endHour: 18, endMinute: 0, location: 'Delivery', coordinates: routeCoords[4] },
      { status: 'off-duty' as const, startHour: 18, startMinute: 0, endHour: 24, endMinute: 0, coordinates: routeCoords[4] }
    ],
    // Pattern 2: Night shift with sleeper berth
    [
      { status: 'sleeper' as const, startHour: 0, startMinute: 0, endHour: 8, endMinute: 0, coordinates: routeCoords[0] },
      { status: 'on-duty' as const, startHour: 8, startMinute: 0, endHour: 9, endMinute: 0, location: 'Terminal', coordinates: routeCoords[0] },
      { status: 'driving' as const, startHour: 9, startMinute: 0, endHour: 14, endMinute: 0, location: 'Highway 101', coordinates: routeCoords[1] },
      { status: 'on-duty' as const, startHour: 14, startMinute: 0, endHour: 14, endMinute: 30, location: 'Fuel Stop', coordinates: routeCoords[2] },
      { status: 'driving' as const, startHour: 14, startMinute: 30, endHour: 20, endMinute: 0, location: 'I-10 West', coordinates: routeCoords[3] },
      { status: 'sleeper' as const, startHour: 20, startMinute: 0, endHour: 24, endMinute: 0, coordinates: routeCoords[3] }
    ],
    // Pattern 3: Split shift
    [
      { status: 'off-duty' as const, startHour: 0, startMinute: 0, endHour: 5, endMinute: 0, coordinates: routeCoords[0] },
      { status: 'on-duty' as const, startHour: 5, startMinute: 0, endHour: 6, endMinute: 0, location: 'Terminal', coordinates: routeCoords[0] },
      { status: 'driving' as const, startHour: 6, startMinute: 0, endHour: 11, endMinute: 0, location: 'Route 66', coordinates: routeCoords[1] },
      { status: 'sleeper' as const, startHour: 11, startMinute: 0, endHour: 14, endMinute: 0, coordinates: routeCoords[2] },
      { status: 'on-duty' as const, startHour: 14, startMinute: 0, endHour: 14, endMinute: 30, location: 'Loading', coordinates: routeCoords[2] },
      { status: 'driving' as const, startHour: 14, startMinute: 30, endHour: 19, endMinute: 30, location: 'I-40 East', coordinates: routeCoords[3] },
      { status: 'off-duty' as const, startHour: 19, startMinute: 30, endHour: 24, endMinute: 0, coordinates: routeCoords[4] }
    ]
  ];

  return patterns[day % patterns.length];
};

const calculateHours = (dutyStatuses: DutyStatus[]) => {
  const hours = {
    offDuty: 0,
    sleeper: 0,
    driving: 0,
    onDuty: 0,
    total: 24
  };

  dutyStatuses.forEach(status => {
    const duration = (status.endHour - status.startHour) + 
                    ((status.endMinute - status.startMinute) / 60);
    
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

export const dummyLogs: DailyLog[] = [];

// Generate logs for the past 14 days for each driver
dummyDrivers.forEach((driver, driverIndex) => {
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    const dutyStatuses = generateDutyStatuses(i + driverIndex);
    const hours = calculateHours(dutyStatuses);
    
    dummyLogs.push({
      id: `log-${driver.id}-${i}`,
      driverId: driver.id,
      driver: driver,
      date: dateString,
      dutyStatuses: dutyStatuses,
      remarks: i === 0 ? 'Normal operations. Traffic was moderate.' : 
               i === 1 ? 'Delayed due to weather conditions.' :
               i === 2 ? 'Early delivery completed.' :
               'Standard delivery route.',
      shippingDocuments: `DOC-${Math.floor(Math.random() * 100000)}`,
      coDriverName: driverIndex % 2 === 0 ? 'Co-Driver Smith' : '',
      vehicleNumbers: `TRK-${1000 + driverIndex}${i}`,
      totalMiles: 450 + Math.floor(Math.random() * 200),
      totalMilesToday: 250 + Math.floor(Math.random() * 100),
      totalMilesYesterday: 200 + Math.floor(Math.random() * 100),
      hours: hours,
      created: date.toISOString(),
      updated: date.toISOString()
    });
  }
});

export const getDriverById = (id: string): Driver | undefined => {
  return dummyDrivers.find(driver => driver.id === id);
};

export const getLogsByDriverId = (driverId: string): DailyLog[] => {
  return dummyLogs.filter(log => log.driverId === driverId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getRecentLogs = (limit: number = 10): DailyLog[] => {
  return [...dummyLogs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};





