import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { DailyLog, Driver } from '../types';
import { checkHOSCompliance } from '../utils/hoursCalculator';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [recentLogs, setRecentLogs] = useState<DailyLog[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLogs: 0,
    totalDrivers: 0,
    compliantLogs: 0,
    violationLogs: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [logsResponse, driversResponse] = await Promise.all([
        api.getRecentLogs(10),
        api.getAllDrivers()
      ]);

      setRecentLogs(logsResponse.data);
      setDrivers(driversResponse.data);

      // Calculate stats
      const allLogsResponse = await api.getAllLogs({});
      const allLogs = allLogsResponse.data;

      const compliant = allLogs.filter(log => 
        checkHOSCompliance(log.hours).isCompliant
      ).length;

      setStats({
        totalLogs: allLogs.length,
        totalDrivers: driversResponse.data.length,
        compliantLogs: compliant,
        violationLogs: allLogs.length - compliant
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
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
    <div className="dashboard">
      <h1 className="page-title">
        <span className="page-title-icon">📊</span>
        Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{stats.totalLogs}</div>
          <div className="stat-label">Total Logs</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.totalDrivers}</div>
          <div className="stat-label">Active Drivers</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-value">{stats.compliantLogs}</div>
          <div className="stat-label">Compliant Logs</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠</div>
          <div className="stat-value">{stats.violationLogs}</div>
          <div className="stat-label">Violations</div>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="card">
        <div className="card-header">📈 Compliance Overview</div>
        <div className="compliance-chart">
          <div className="compliance-bar">
            <div 
              className="compliance-fill compliant"
              style={{ width: `${(stats.compliantLogs / stats.totalLogs * 100) || 0}%` }}
            >
              {stats.compliantLogs > 0 && (
                <span className="compliance-label">
                  {((stats.compliantLogs / stats.totalLogs * 100) || 0).toFixed(1)}%
                </span>
              )}
            </div>
            <div 
              className="compliance-fill violation"
              style={{ width: `${(stats.violationLogs / stats.totalLogs * 100) || 0}%` }}
            >
              {stats.violationLogs > 0 && (
                <span className="compliance-label">
                  {((stats.violationLogs / stats.totalLogs * 100) || 0).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div className="compliance-legend">
            <div className="compliance-legend-item">
              <div className="compliance-legend-color compliant"></div>
              <span>Compliant: {stats.compliantLogs}</span>
            </div>
            <div className="compliance-legend-item">
              <div className="compliance-legend-color violation"></div>
              <span>Violations: {stats.violationLogs}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Logs */}
      <div className="card">
        <div className="card-header">
          📋 Recent Logs
          <Link to="/logs" className="btn btn-outline btn-sm">View All Logs</Link>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Driver</th>
                <th>Total Miles</th>
                <th>Driving Hours</th>
                <th>On-Duty Hours</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    No logs available. <Link to="/create">Create your first log</Link>
                  </td>
                </tr>
              ) : (
                recentLogs.map(log => (
                  <tr key={log.id}>
                    <td>{formatDate(log.date)}</td>
                    <td>
                      <strong>{log.driver.name}</strong>
                      <br />
                      <small>{log.driver.licenseNumber}</small>
                    </td>
                    <td>{log.totalMiles} mi</td>
                    <td>{log.hours.driving.toFixed(1)}h</td>
                    <td>{log.hours.onDuty.toFixed(1)}h</td>
                    <td>{getComplianceBadge(log)}</td>
                    <td>
                      <Link to={`/logs/${log.id}`} className="btn btn-outline btn-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Drivers */}
      <div className="card">
        <div className="card-header">
          👥 Active Drivers
          <Link to="/drivers" className="btn btn-outline btn-sm">View All Drivers</Link>
        </div>
        <div className="drivers-grid">
          {drivers.map(driver => (
            <div key={driver.id} className="driver-card">
              <div className="driver-avatar">
                {driver.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="driver-info">
                <h3>{driver.name}</h3>
                <p>{driver.licenseNumber}</p>
                <p className="driver-terminal">{driver.homeTerminal}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;





