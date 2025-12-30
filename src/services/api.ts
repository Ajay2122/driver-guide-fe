import { Driver, DailyLog } from '../types';
import { dummyDrivers, dummyLogs, getDriverById, getLogsByDriverId, getRecentLogs } from '../data/dummyData';

// Simulate API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

class DriverLogAPI {
  // Drivers API
  async getAllDrivers(): Promise<ApiResponse<Driver[]>> {
    await delay(300);
    return {
      data: dummyDrivers,
      status: 200,
      message: 'Drivers fetched successfully'
    };
  }

  async getDriver(id: string): Promise<ApiResponse<Driver | null>> {
    await delay(300);
    const driver = getDriverById(id);
    return {
      data: driver || null,
      status: driver ? 200 : 404,
      message: driver ? 'Driver fetched successfully' : 'Driver not found'
    };
  }

  async createDriver(driver: Omit<Driver, 'id'>): Promise<ApiResponse<Driver>> {
    await delay(500);
    const newDriver: Driver = {
      ...driver,
      id: `driver-${Date.now()}`
    };
    dummyDrivers.push(newDriver);
    return {
      data: newDriver,
      status: 201,
      message: 'Driver created successfully'
    };
  }

  async updateDriver(id: string, driver: Partial<Driver>): Promise<ApiResponse<Driver | null>> {
    await delay(500);
    const index = dummyDrivers.findIndex(d => d.id === id);
    if (index === -1) {
      return {
        data: null,
        status: 404,
        message: 'Driver not found'
      };
    }
    dummyDrivers[index] = { ...dummyDrivers[index], ...driver };
    return {
      data: dummyDrivers[index],
      status: 200,
      message: 'Driver updated successfully'
    };
  }

  async deleteDriver(id: string): Promise<ApiResponse<boolean>> {
    await delay(500);
    const index = dummyDrivers.findIndex(d => d.id === id);
    if (index === -1) {
      return {
        data: false,
        status: 404,
        message: 'Driver not found'
      };
    }
    dummyDrivers.splice(index, 1);
    return {
      data: true,
      status: 200,
      message: 'Driver deleted successfully'
    };
  }

  // Daily Logs API
  async getAllLogs(params?: { driverId?: string; startDate?: string; endDate?: string; limit?: number }): Promise<ApiResponse<DailyLog[]>> {
    await delay(400);
    let logs = [...dummyLogs];

    if (params?.driverId) {
      logs = logs.filter(log => log.driverId === params.driverId);
    }

    if (params?.startDate) {
      logs = logs.filter(log => new Date(log.date) >= new Date(params.startDate!));
    }

    if (params?.endDate) {
      logs = logs.filter(log => new Date(log.date) <= new Date(params.endDate!));
    }

    logs = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (params?.limit) {
      logs = logs.slice(0, params.limit);
    }

    return {
      data: logs,
      status: 200,
      message: 'Logs fetched successfully'
    };
  }

  async getLog(id: string): Promise<ApiResponse<DailyLog | null>> {
    await delay(300);
    const log = dummyLogs.find(l => l.id === id);
    return {
      data: log || null,
      status: log ? 200 : 404,
      message: log ? 'Log fetched successfully' : 'Log not found'
    };
  }

  async getDriverLogs(driverId: string): Promise<ApiResponse<DailyLog[]>> {
    await delay(400);
    const logs = getLogsByDriverId(driverId);
    return {
      data: logs,
      status: 200,
      message: 'Driver logs fetched successfully'
    };
  }

  async getRecentLogs(limit: number = 10): Promise<ApiResponse<DailyLog[]>> {
    await delay(300);
    const logs = getRecentLogs(limit);
    return {
      data: logs,
      status: 200,
      message: 'Recent logs fetched successfully'
    };
  }

  async createLog(log: Omit<DailyLog, 'id' | 'created' | 'updated'>): Promise<ApiResponse<DailyLog>> {
    await delay(600);
    const newLog: DailyLog = {
      ...log,
      id: `log-${Date.now()}`,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    dummyLogs.unshift(newLog);
    return {
      data: newLog,
      status: 201,
      message: 'Log created successfully'
    };
  }

  async updateLog(id: string, log: Partial<DailyLog>): Promise<ApiResponse<DailyLog | null>> {
    await delay(600);
    const index = dummyLogs.findIndex(l => l.id === id);
    if (index === -1) {
      return {
        data: null,
        status: 404,
        message: 'Log not found'
      };
    }
    dummyLogs[index] = { 
      ...dummyLogs[index], 
      ...log, 
      updated: new Date().toISOString() 
    };
    return {
      data: dummyLogs[index],
      status: 200,
      message: 'Log updated successfully'
    };
  }

  async deleteLog(id: string): Promise<ApiResponse<boolean>> {
    await delay(500);
    const index = dummyLogs.findIndex(l => l.id === id);
    if (index === -1) {
      return {
        data: false,
        status: 404,
        message: 'Log not found'
      };
    }
    dummyLogs.splice(index, 1);
    return {
      data: true,
      status: 200,
      message: 'Log deleted successfully'
    };
  }

  // Statistics API
  async getDriverStats(driverId: string): Promise<ApiResponse<any>> {
    await delay(400);
    const logs = getLogsByDriverId(driverId);
    
    const stats = {
      totalLogs: logs.length,
      totalDrivingHours: logs.reduce((sum, log) => sum + log.hours.driving, 0),
      totalMiles: logs.reduce((sum, log) => sum + log.totalMiles, 0),
      averageDailyDriving: logs.length > 0 
        ? logs.reduce((sum, log) => sum + log.hours.driving, 0) / logs.length 
        : 0,
      averageDailyMiles: logs.length > 0 
        ? logs.reduce((sum, log) => sum + log.totalMiles, 0) / logs.length 
        : 0,
      last7Days: logs.slice(0, 7),
      complianceRate: Math.floor(Math.random() * 10) + 90 // Mock compliance rate
    };

    return {
      data: stats,
      status: 200,
      message: 'Statistics fetched successfully'
    };
  }
}

export const api = new DriverLogAPI();





