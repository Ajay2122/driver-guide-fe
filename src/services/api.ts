import axios, { AxiosInstance, AxiosError } from 'axios';
import { Driver, DailyLog } from '../types';
import API_CONFIG from '../config/api.config';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

interface BackendResponse<T> {
  status: string;
  data: T;
  message: string;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

function transformResponse<T>(data: T, statusCode: number = 200, message: string = 'Success'): ApiResponse<T> {
  return {
    data,
    status: statusCode,
    message
  };
}

class DriverLogAPI {
  async getAllDrivers(params?: { 
    search?: string; 
    ordering?: string; 
    page?: number 
  }): Promise<ApiResponse<Driver[]>> {
    try {
      const response = await apiClient.get<BackendResponse<{ drivers: Driver[] }>>('/drivers', { params });
      const backendData = response.data.data as { drivers: Driver[] };
      return transformResponse(backendData.drivers, response.status, response.data.message);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDriver(id: string): Promise<ApiResponse<Driver>> {
    try {
      const response = await apiClient.get<BackendResponse<Driver>>(`/drivers/${id}/`);
      return transformResponse(response.data.data, response.status, response.data.message);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createDriver(driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Driver>> {
    try {
      const response = await apiClient.post<BackendResponse<Driver>>('/drivers/', {
        name: driver.name,
        licenseNumber: driver.licenseNumber,
        homeTerminal: driver.homeTerminal,
        mainOfficeAddress: driver.mainOfficeAddress
      });
      return transformResponse(response.data.data, response.status, response.data.message);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateDriver(id: string, driver: Partial<Driver>): Promise<ApiResponse<Driver>> {
    try {
      const response = await apiClient.patch<BackendResponse<Driver>>(`/drivers/${id}/`, {
        ...(driver.name && { name: driver.name }),
        ...(driver.licenseNumber && { licenseNumber: driver.licenseNumber }),
        ...(driver.homeTerminal && { homeTerminal: driver.homeTerminal }),
        ...(driver.mainOfficeAddress && { mainOfficeAddress: driver.mainOfficeAddress })
      });
      return transformResponse(response.data.data, response.status, response.data.message);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteDriver(id: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await apiClient.delete<BackendResponse<null>>(`/drivers/${id}/`);
      return {
        data: true,
        status: response.status,
        message: response.data.message
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAllLogs(params?: { 
    driver_id?: string; 
    start_date?: string; 
    end_date?: string;
    compliant?: boolean;
    limit?: number;
  }): Promise<ApiResponse<DailyLog[]>> {
    try {
      const response = await apiClient.get<BackendResponse<{ logs: DailyLog[] }>>('/logs', { params });
      const backendData = response.data.data as { logs: DailyLog[] };
      return transformResponse(backendData.logs, response.status, response.data.message);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getLog(id: string): Promise<ApiResponse<DailyLog>> {
    try {
      const response = await apiClient.get<BackendResponse<DailyLog>>(`/logs/${id}`);
      return transformResponse(response.data.data, response.status, response.data.message);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDriverLogs(driverId: string, params?: { 
    startDate?: string; 
    endDate?: string 
  }): Promise<ApiResponse<DailyLog[]>> {
    try {
      const response = await apiClient.get<BackendResponse<{ logs: DailyLog[] }>>(`/drivers/${driverId}/logs/`, { params });
      const backendData = response.data.data as { logs: DailyLog[] };
      return transformResponse(backendData.logs, response.status, response.data.message);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRecentLogs(limit: number = 10): Promise<ApiResponse<DailyLog[]>> {
    try {
      const response = await apiClient.get<BackendResponse<{ logs: DailyLog[] }>>('/logs', {
        params: { limit }
      });
      const backendData = response.data.data as { logs: DailyLog[] };
      return transformResponse(backendData.logs, response.status, response.data.message);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createLog(log: Omit<DailyLog, 'id' | 'created' | 'updated'> & { autoGeocode?: boolean }): Promise<ApiResponse<DailyLog>> {
    try {
      const response = await apiClient.post<BackendResponse<DailyLog>>('/logs/', {
        driverId: log.driverId,
        date: log.date,
        dutyStatuses: log.dutyStatuses,
        remarks: log.remarks || '',
        shippingDocuments: log.shippingDocuments || '',
        coDriverName: log.coDriverName || '',
        vehicleNumbers: log.vehicleNumbers || '',
        totalMiles: log.totalMiles || 0,
        totalMilesToday: log.totalMilesToday || 0,
        totalMilesYesterday: log.totalMilesYesterday || 0,
        autoGeocode: (log as any).autoGeocode || false
      });
      return transformResponse(response.data.data, response.status, response.data.message);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateLog(id: string, log: Partial<DailyLog> & { autoGeocode?: boolean }): Promise<ApiResponse<DailyLog>> {
    try {
      const updateData: any = {};
      
      if (log.driverId) updateData.driverId = log.driverId;
      if (log.date) updateData.date = log.date;
      if (log.dutyStatuses) updateData.dutyStatuses = log.dutyStatuses;
      if (log.remarks !== undefined) updateData.remarks = log.remarks;
      if (log.shippingDocuments !== undefined) updateData.shippingDocuments = log.shippingDocuments;
      if (log.coDriverName !== undefined) updateData.coDriverName = log.coDriverName;
      if (log.vehicleNumbers !== undefined) updateData.vehicleNumbers = log.vehicleNumbers;
      if (log.totalMiles !== undefined) updateData.totalMiles = log.totalMiles;
      if (log.totalMilesToday !== undefined) updateData.totalMilesToday = log.totalMilesToday;
      if (log.totalMilesYesterday !== undefined) updateData.totalMilesYesterday = log.totalMilesYesterday;
      if ((log as any).autoGeocode !== undefined) updateData.autoGeocode = (log as any).autoGeocode;

      const response = await apiClient.patch<BackendResponse<DailyLog>>(`/logs/${id}/`, updateData);
      return transformResponse(response.data.data, response.status, response.data.message);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteLog(id: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await apiClient.delete<BackendResponse<null>>(`/logs/${id}/`);
      return {
        data: true,
        status: response.status,
        message: response.data.message
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async geocodeLocation(location: string): Promise<ApiResponse<{ 
    lat: number; 
    lng: number; 
    formattedAddress: string 
  }>> {
    try {
      const response = await apiClient.post<BackendResponse<{
        location: string;
        coordinates: { lat: number; lng: number };
        formattedAddress: string;
      }>>('/gps/geocode/', { location });
      
      return {
        data: {
          lat: response.data.data.coordinates.lat,
          lng: response.data.data.coordinates.lng,
          formattedAddress: response.data.data.formattedAddress
        },
        status: response.status,
        message: response.data.message
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<ApiResponse<{
    address: string;
    city: string;
    state: string;
    country: string;
  }>> {
    try {
      const response = await apiClient.post<BackendResponse<any>>('/gps/reverse-geocode/', { lat, lng });
      return transformResponse(response.data.data, response.status, response.data.message);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async batchGeocode(locations: string[]): Promise<ApiResponse<{
    results: Array<{ location: string; coordinates: any; status: string }>;
    successCount: number;
    failureCount: number;
  }>> {
    try {
      const response = await apiClient.post<BackendResponse<any>>('/gps/batch-geocode/', { locations });
      return transformResponse(response.data.data, response.status, response.data.message);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async calculateDistance(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    unit: 'miles' | 'kilometers' = 'miles'
  ): Promise<ApiResponse<{
    distance: number;
    unit: string;
    origin: any;
    destination: any;
  }>> {
    try {
      const response = await apiClient.post<BackendResponse<any>>('/gps/calculate-distance/', {
        origin,
        destination,
        unit
      });
      return transformResponse(response.data.data, response.status, response.data.message);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async calculateRouteDistance(
    waypoints: Array<{ lat: number; lng: number }>,
    unit: 'miles' | 'kilometers' = 'miles'
  ): Promise<ApiResponse<{
    totalDistance: number;
    unit: string;
    segments: any[];
    waypointCount: number;
  }>> {
    try {
      const response = await apiClient.post<BackendResponse<any>>('/gps/calculate-route-distance/', {
        waypoints,
        unit
      });
      return transformResponse(response.data.data, response.status, response.data.message);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getLogRoute(logId: string): Promise<ApiResponse<{
    logId: string;
    date: string;
    driver: any;
    locations: any[];
    drivingSegments: any[];
    routeStats: any;
  }>> {
    try {
      const response = await apiClient.get<BackendResponse<any>>(`/logs/${logId}/route/`);
      return transformResponse(response.data.data, response.status, response.data.message);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDriverStats(driverId: string, params?: {
    startDate?: string;
    endDate?: string;
    period?: '7days' | '30days' | '90days';
  }): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get<BackendResponse<any>>(`/drivers/${driverId}/stats/`, { params });
      return transformResponse(response.data.data, response.status, response.data.message);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async checkCompliance(dutyStatuses: any[]): Promise<ApiResponse<{
    isCompliant: boolean;
    hours: any;
    violations: any[];
    warnings: any[];
  }>> {
    try {
      const response = await apiClient.post<BackendResponse<any>>('/logs/compliance-check/', {
        dutyStatuses
      });
      return transformResponse(response.data.data, response.status, response.data.message);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDashboardStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get<BackendResponse<any>>('/dashboard/stats/', { params });
      return transformResponse(response.data.data, response.status, response.data.message);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      
      if (axiosError.response) {
        const errorData = axiosError.response.data;
        const message = errorData?.message || errorData?.error || 'Server error occurred';
        const errors = errorData?.errors;
        
        const errorMessage = errors 
          ? `${message}: ${JSON.stringify(errors)}`
          : message;
        
        return new Error(errorMessage);
      } else if (axiosError.request) {
        return new Error('Cannot connect to server. Please ensure the backend is running at ' + API_CONFIG.BASE_URL);
      }
    }
    
    return new Error(error.message || 'An unexpected error occurred');
  }
}

export const api = new DriverLogAPI();
export default api;
