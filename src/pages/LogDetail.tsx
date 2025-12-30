import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { DailyLog } from '../types';
import { checkHOSCompliance, formatDuration } from '../utils/hoursCalculator';
import LogGrid from '../components/LogGrid';
import RouteMap from '../components/RouteMap';
import './LogDetail.css';

const LogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [log, setLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadLog(id);
    }
  }, [id]);

  const loadLog = async (logId: string) => {
    setLoading(true);
    try {
      const response = await api.getLog(logId);
      setLog(response.data);
    } catch (error) {
      console.error('Error loading log:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this log?')) {
      try {
        if (id) {
          await api.deleteLog(id);
          alert('Log deleted successfully!');
          navigate('/logs');
        }
      } catch (error) {
        console.error('Error deleting log:', error);
        alert('Error deleting log. Please try again.');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="card">
        <div className="alert alert-danger">
          <strong>Error:</strong> Log not found.
        </div>
        <Link to="/logs" className="btn btn-primary">
          ← Back to Logs
        </Link>
      </div>
    );
  }

  const compliance = checkHOSCompliance(log.hours);

  return (
    <div className="log-detail-page">
      <div className="log-detail-header no-print">
        <h1 className="page-title">
          <span className="page-title-icon">📋</span>
          Log Details
        </h1>
        <div className="action-buttons">
          <Link to="/logs" className="btn btn-secondary">
            ← Back
          </Link>
          <Link to={`/edit/${log.id}`} className="btn btn-outline">
            ✏️ Edit
          </Link>
          <button onClick={handlePrint} className="btn btn-outline">
            🖨️ Print
          </button>
          <button onClick={handleDelete} className="btn btn-danger">
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Driver & Date Information */}
      <div className="card">
        <div className="card-header">👤 Driver Information</div>
        <div className="info-grid">
          <div className="info-item">
            <div className="info-label">Date</div>
            <div className="info-value">{formatDate(log.date)}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Driver Name</div>
            <div className="info-value">{log.driver.name}</div>
          </div>
          <div className="info-item">
            <div className="info-label">License Number</div>
            <div className="info-value">{log.driver.licenseNumber}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Home Terminal</div>
            <div className="info-value">{log.driver.homeTerminal}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Main Office Address</div>
            <div className="info-value">{log.driver.mainOfficeAddress}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Vehicle Numbers</div>
            <div className="info-value">{log.vehicleNumbers || '-'}</div>
          </div>
          {log.coDriverName && (
            <div className="info-item">
              <div className="info-label">Co-Driver</div>
              <div className="info-value">{log.coDriverName}</div>
            </div>
          )}
          <div className="info-item">
            <div className="info-label">Shipping Documents</div>
            <div className="info-value">{log.shippingDocuments || '-'}</div>
          </div>
        </div>
      </div>

      {/* Duty Status Grid */}
      <div className="card">
        <div className="card-header">📊 Duty Status Grid</div>
        <LogGrid dutyStatuses={log.dutyStatuses} />
      </div>

      {/* Route Map */}
      <div className="card">
        <RouteMap 
          dutyStatuses={log.dutyStatuses} 
          driverName={log.driver.name}
          date={formatDate(log.date)}
        />
      </div>

      {/* Hours Summary */}
      <div className="card">
        <div className="card-header">⏱️ Hours Summary</div>
        <div className="hours-summary">
          <div className="hours-card off-duty">
            <div className="hours-card-icon">🏠</div>
            <div className="hours-card-content">
              <div className="hours-card-label">Off Duty</div>
              <div className="hours-card-value">{log.hours.offDuty.toFixed(2)}h</div>
              <div className="hours-card-detail">{formatDuration(log.hours.offDuty)}</div>
            </div>
          </div>
          <div className="hours-card sleeper">
            <div className="hours-card-icon">🛌</div>
            <div className="hours-card-content">
              <div className="hours-card-label">Sleeper Berth</div>
              <div className="hours-card-value">{log.hours.sleeper.toFixed(2)}h</div>
              <div className="hours-card-detail">{formatDuration(log.hours.sleeper)}</div>
            </div>
          </div>
          <div className="hours-card driving">
            <div className="hours-card-icon">🚛</div>
            <div className="hours-card-content">
              <div className="hours-card-label">Driving</div>
              <div className="hours-card-value">{log.hours.driving.toFixed(2)}h</div>
              <div className="hours-card-detail">{formatDuration(log.hours.driving)}</div>
            </div>
          </div>
          <div className="hours-card on-duty">
            <div className="hours-card-icon">⚙️</div>
            <div className="hours-card-content">
              <div className="hours-card-label">On-Duty</div>
              <div className="hours-card-value">{log.hours.onDuty.toFixed(2)}h</div>
              <div className="hours-card-detail">{formatDuration(log.hours.onDuty)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mileage Information */}
      <div className="card">
        <div className="card-header">🛣️ Mileage Information</div>
        <div className="mileage-grid">
          <div className="mileage-item">
            <div className="mileage-icon">📍</div>
            <div className="mileage-content">
              <div className="mileage-label">Total Miles Today</div>
              <div className="mileage-value">{log.totalMilesToday} mi</div>
            </div>
          </div>
          <div className="mileage-item">
            <div className="mileage-icon">📊</div>
            <div className="mileage-content">
              <div className="mileage-label">Total Miles</div>
              <div className="mileage-value">{log.totalMiles} mi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Duty Status Details */}
      <div className="card">
        <div className="card-header">📝 Duty Status Details</div>
        <div className="status-timeline">
          {log.dutyStatuses.map((status, index) => (
            <div key={index} className={`timeline-item ${status.status}`}>
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="timeline-time">
                  {String(status.startHour).padStart(2, '0')}:{String(status.startMinute).padStart(2, '0')} - 
                  {String(status.endHour).padStart(2, '0')}:{String(status.endMinute).padStart(2, '0')}
                </div>
                <div className="timeline-status">
                  {status.status === 'off-duty' && '🏠 Off Duty'}
                  {status.status === 'sleeper' && '🛌 Sleeper Berth'}
                  {status.status === 'driving' && '🚛 Driving'}
                  {status.status === 'on-duty' && '⚙️ On-Duty (Not Driving)'}
                </div>
                {status.location && (
                  <div className="timeline-location">📍 {status.location}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Status */}
      <div className={`card compliance-card ${compliance.isCompliant ? 'compliant' : 'violation'}`}>
        <div className="card-header">
          {compliance.isCompliant ? '✓ HOS Compliance' : '⚠ HOS Violations'}
        </div>
        <div className="compliance-content">
          {compliance.isCompliant ? (
            <div className="compliance-message success">
              <div className="compliance-message-icon">✓</div>
              <div>
                <strong>This log is HOS compliant</strong>
                <p>All Hours of Service regulations are met.</p>
              </div>
            </div>
          ) : (
            <div className="compliance-message error">
              <div className="compliance-message-icon">⚠</div>
              <div>
                <strong>HOS Violations Detected</strong>
                <ul className="violation-list">
                  {compliance.violations.map((violation, index) => (
                    <li key={index}>{violation}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Remarks */}
      {log.remarks && (
        <div className="card">
          <div className="card-header">💬 Remarks</div>
          <div className="remarks-content">
            {log.remarks}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="card metadata-card">
        <div className="metadata-grid">
          <div className="metadata-item">
            <div className="metadata-label">Created</div>
            <div className="metadata-value">
              {new Date(log.created).toLocaleString()}
            </div>
          </div>
          <div className="metadata-item">
            <div className="metadata-label">Last Updated</div>
            <div className="metadata-value">
              {new Date(log.updated).toLocaleString()}
            </div>
          </div>
          <div className="metadata-item">
            <div className="metadata-label">Log ID</div>
            <div className="metadata-value">{log.id}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogDetail;





