import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { DailyLog, Driver } from '../types';
import { checkHOSCompliance } from '../utils/hoursCalculator';
import './LogList.css';

const LogList: React.FC = () => {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<DailyLog[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    driverId: '',
    startDate: '',
    endDate: '',
    complianceStatus: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, logs]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsResponse, driversResponse] = await Promise.all([
        api.getAllLogs({}),
        api.getAllDrivers()
      ]);
      setLogs(logsResponse.data);
      setDrivers(driversResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    if (filters.driverId) {
      filtered = filtered.filter(log => log.driverId === filters.driverId);
    }

    if (filters.startDate) {
      filtered = filtered.filter(log => new Date(log.date) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter(log => new Date(log.date) <= new Date(filters.endDate));
    }

    if (filters.complianceStatus) {
      filtered = filtered.filter(log => {
        const compliance = checkHOSCompliance(log.hours);
        return filters.complianceStatus === 'compliant' ? compliance.isCompliant : !compliance.isCompliant;
      });
    }

    setFilteredLogs(filtered);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      driverId: '',
      startDate: '',
      endDate: '',
      complianceStatus: ''
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this log?')) {
      try {
        await api.deleteLog(id);
        alert('Log deleted successfully!');
        loadData();
      } catch (error) {
        console.error('Error deleting log:', error);
        alert('Error deleting log. Please try again.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getComplianceBadge = (log: DailyLog) => {
    const compliance = checkHOSCompliance(log.hours);
    return compliance.isCompliant ? (
      <span className="badge badge-success">✓ Compliant</span>
    ) : (
      <span className="badge badge-danger">⚠ Violation</span>
    );
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="log-list-page">
      <h1 className="page-title">
        <span className="page-title-icon">📋</span>
        All Logs
        <Link to="/create" className="btn btn-primary btn-sm">
          ➕ Create New Log
        </Link>
      </h1>

      {/* Filters */}
      {/* <div className="card">
        <div className="card-header">
          🔍 Filters
          <button onClick={clearFilters} className="btn btn-outline btn-sm">
            Clear Filters
          </button>
        </div>
        <div className="filters-grid">
          <div className="form-group">
            <label className="form-label">Driver</label>
            <select
              name="driverId"
              value={filters.driverId}
              onChange={handleFilterChange}
              className="form-select"
            >
              <option value="">All Drivers</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Compliance</label>
            <select
              name="complianceStatus"
              value={filters.complianceStatus}
              onChange={handleFilterChange}
              className="form-select"
            >
              <option value="">All</option>
              <option value="compliant">Compliant</option>
              <option value="violation">Violations</option>
            </select>
          </div>
        </div>
      </div> */}

      {/* Results Summary */}
      

      {/* Logs Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Driver</th>
                <th>Vehicle</th>
                <th>Total Miles</th>
                <th>Driving Hours</th>
                <th>On-Duty Hours</th>
                <th>Rest Hours</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>
                    {filters.driverId || filters.startDate || filters.endDate || filters.complianceStatus
                      ? 'No logs match your filters.'
                      : 'No logs available. '}
                    <Link to="/create">Create your first log</Link>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <strong>{formatDate(log.date)}</strong>
                    </td>
                    <td>
                      <div>{log.driver.name}</div>
                      <small style={{ color: '#666' }}>{log.driver.licenseNumber}</small>
                    </td>
                    <td>{log.vehicleNumbers || '-'}</td>
                    <td>{log.totalMiles} mi</td>
                    <td>{log.hours.driving.toFixed(1)}h</td>
                    <td>{log.hours.onDuty.toFixed(1)}h</td>
                    <td>{(log.hours.offDuty + log.hours.sleeper).toFixed(1)}h</td>
                    <td>{getComplianceBadge(log)}</td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/logs/${log.id}`} className="btn btn-outline btn-sm">
                          👁️ View
                        </Link>
                        <Link to={`/edit/${log.id}`} className="btn btn-outline btn-sm">
                          ✏️ Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="btn btn-danger btn-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="results-summary">
        <p>
          Showing <strong>{filteredLogs.length}</strong> of <strong>{logs.length}</strong> logs
        </p>
      </div>
    </div>
  );
};

export default LogList;





