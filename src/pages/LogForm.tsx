import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Driver, DutyStatus, DailyLog } from '../types';
import { calculateHoursFromStatuses, checkHOSCompliance } from '../utils/hoursCalculator';
import LogGrid from '../components/LogGrid';
import RouteMap from '../components/RouteMap';
import './LogForm.css';

const LogForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    driverId: '',
    date: new Date().toISOString().split('T')[0],
    remarks: '',
    shippingDocuments: '',
    coDriverName: '',
    vehicleNumbers: '',
    totalMiles: 0,
    totalMilesToday: 0,
    totalMilesYesterday: 0
  });

  const [dutyStatuses, setDutyStatuses] = useState<DutyStatus[]>([
    { status: 'off-duty', startHour: 0, startMinute: 0, endHour: 6, endMinute: 0 },
    { status: 'on-duty', startHour: 6, startMinute: 0, endHour: 7, endMinute: 0, location: '' },
    { status: 'driving', startHour: 7, startMinute: 0, endHour: 17, endMinute: 0, location: '' },
    { status: 'off-duty', startHour: 17, startMinute: 0, endHour: 24, endMinute: 0 }
  ]);

  useEffect(() => {
    loadDrivers();
    if (id) {
      loadLog(id);
    }
  }, [id]);

  const loadDrivers = async () => {
    try {
      const response = await api.getAllDrivers();
      setDrivers(response.data);
      if (response.data.length > 0 && !formData.driverId) {
        setFormData(prev => ({ ...prev, driverId: response.data[0].id }));
      }
    } catch (error) {
      console.error('Error loading drivers:', error);
    }
  };

  const loadLog = async (logId: string) => {
    setLoading(true);
    try {
      const response = await api.getLog(logId);
      if (response.data) {
        const log = response.data;
        setFormData({
          driverId: log.driverId,
          date: log.date,
          remarks: log.remarks,
          shippingDocuments: log.shippingDocuments,
          coDriverName: log.coDriverName,
          vehicleNumbers: log.vehicleNumbers,
          totalMiles: log.totalMiles,
          totalMilesToday: log.totalMilesToday,
          totalMilesYesterday: log.totalMilesYesterday
        });
        setDutyStatuses(log.dutyStatuses);
      }
    } catch (error) {
      console.error('Error loading log:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Miles') || name === 'totalMiles' ? Number(value) : value
    }));
  };

  const handleDutyStatusChange = (index: number, field: keyof DutyStatus, value: any) => {
    const newStatuses = [...dutyStatuses];
    newStatuses[index] = { ...newStatuses[index], [field]: value };
    setDutyStatuses(newStatuses);
  };

  const handleGeocodeLocation = async (index: number) => {
    const status = dutyStatuses[index];
    if (!status.location) {
      alert('Please enter a location name or coordinates');
      return;
    }

    try {
      // Try API first (will fallback to mock if backend not available)
      const response = await api.geocodeLocation(status.location);
      
      if (response.data) {
        const newStatuses = [...dutyStatuses];
        newStatuses[index] = { 
          ...newStatuses[index], 
          coordinates: {
            lat: response.data.lat,
            lng: response.data.lng
          }
        };
        setDutyStatuses(newStatuses);
        alert(`✓ Location found: ${response.data.lat.toFixed(4)}, ${response.data.lng.toFixed(4)}`);
      } else {
        alert('❌ Location not found. Please enter:\n- Location name (e.g., "Los Angeles")\n- GPS coordinates (e.g., "34.0522, -118.2437")');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Error geocoding location');
    }
  };

  const addDutyStatus = () => {
    const lastStatus = dutyStatuses[dutyStatuses.length - 1];
    setDutyStatuses([
      ...dutyStatuses,
      {
        status: 'off-duty',
        startHour: lastStatus.endHour,
        startMinute: lastStatus.endMinute,
        endHour: Math.min(lastStatus.endHour + 2, 24),
        endMinute: 0,
        location: ''
      }
    ]);
  };

  const removeDutyStatus = (index: number) => {
    if (dutyStatuses.length > 1) {
      setDutyStatuses(dutyStatuses.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const hours = calculateHoursFromStatuses(dutyStatuses);
      const driver = drivers.find(d => d.id === formData.driverId);

      if (!driver) {
        alert('Please select a driver');
        return;
      }

      const logData: Omit<DailyLog, 'id' | 'created' | 'updated'> = {
        ...formData,
        driver,
        dutyStatuses,
        hours
      };
      console.log(logData)
      if (id) {
        await api.updateLog(id, logData);
        alert('Log updated successfully!');
      } else {
        await api.createLog(logData);
        alert('Log created successfully!');
      }

      navigate('/logs');
    } catch (error) {
      console.error('Error saving log:', error);
      alert('Error saving log. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const hours = calculateHoursFromStatuses(dutyStatuses);
  const compliance = checkHOSCompliance(hours);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="log-form-page">
      <h1 className="page-title">
        <span className="page-title-icon">{id ? '✏️' : '➕'}</span>
        {id ? 'Edit Log' : 'Create New Log'}
      </h1>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">📝 Basic Information</div>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Driver *</label>
              <select
                name="driverId"
                value={formData.driverId}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select Driver</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} - {driver.licenseNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vehicle Numbers</label>
              <input
                type="text"
                name="vehicleNumbers"
                value={formData.vehicleNumbers}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., TRK-1001"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Co-Driver Name</label>
              <input
                type="text"
                name="coDriverName"
                value={formData.coDriverName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Optional"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Miles</label>
              <input
                type="number"
                name="totalMiles"
                value={formData.totalMiles}
                onChange={handleInputChange}
                className="form-input"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Shipping Documents</label>
              <input
                type="text"
                name="shippingDocuments"
                value={formData.shippingDocuments}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., DOC-12345"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Enter any notes or remarks about this log..."
            />
          </div>
        </div>

        {/* Duty Status */}
        <div className="card">
          <div className="card-header">
            ⏰ Duty Status
            <button type="button" onClick={addDutyStatus} className="btn btn-outline btn-sm">
              ➕ Add Status
            </button>
          </div>

          <div className="duty-status-list">
            {dutyStatuses.map((status, index) => (
              <div key={index} className="duty-status-item">
                <div className="duty-status-number">{index + 1}</div>
                <div className="duty-status-form">
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      value={status.status}
                      onChange={(e) => handleDutyStatusChange(index, 'status', e.target.value)}
                      className="form-select"
                    >
                      <option value="off-duty">Off Duty</option>
                      <option value="sleeper">Sleeper Berth</option>
                      <option value="driving">Driving</option>
                      <option value="on-duty">On-Duty (Not Driving)</option>
                    </select>
                    {status.status=="on-duty" && <div className='form-new-input'>
                      <input
                          type="text"
                          value={status.duty_summary || ''}
                          onChange={(e) => handleDutyStatusChange(index, 'duty_summary', e.target.value)}
                          className="form-input"
                          placeholder="On-Duty summary"
                        />
                    </div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <div className="time-input-group">
                      <input
                        type="number"
                        value={status.startHour}
                        onChange={(e) => handleDutyStatusChange(index, 'startHour', Number(e.target.value))}
                        className="form-input"
                        min="0"
                        max="23"
                        placeholder="HH"
                      />
                      <span>:</span>
                      <input
                        type="number"
                        value={status.startMinute}
                        onChange={(e) => handleDutyStatusChange(index, 'startMinute', Number(e.target.value))}
                        className="form-input"
                        min="0"
                        max="59"
                        placeholder="MM"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <div className="time-input-group">
                      <input
                        type="number"
                        value={status.endHour}
                        onChange={(e) => handleDutyStatusChange(index, 'endHour', Number(e.target.value))}
                        className="form-input"
                        min="0"
                        max="24"
                        placeholder="HH"
                      />
                      <span>:</span>
                      <input
                        type="number"
                        value={status.endMinute}
                        onChange={(e) => handleDutyStatusChange(index, 'endMinute', Number(e.target.value))}
                        className="form-input"
                        min="0"
                        max="59"
                        placeholder="MM"
                      />
                    </div>
                  </div>

                  <div className="form-group location-group">
                    <label className="form-label">
                      Location 
                      {status.coordinates && (
                        <span className="location-badge">
                          ✓ GPS: {status.coordinates.lat.toFixed(4)}, {status.coordinates.lng.toFixed(4)}
                        </span>
                      )}
                    </label>
                    <div className="location-input-wrapper">
                      <input
                        type="text"
                        value={status.location || ''}
                        onChange={(e) => handleDutyStatusChange(index, 'location', e.target.value)}
                        className="form-input"
                        placeholder="e.g., 'Los Angeles' or '34.0522, -118.2437'"
                      />
                      <button
                        type="button"
                        onClick={() => handleGeocodeLocation(index)}
                        className="btn btn-outline btn-sm geocode-btn"
                        title="Convert location to GPS coordinates"
                      >
                        📍 Get GPS
                      </button>
                    </div>
                    <small className="location-help">
                      Enter location name or GPS coordinates (lat, lng)
                    </small>
                  </div>
                </div>

                {dutyStatuses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDutyStatus(index)}
                    className="btn btn-danger btn-sm duty-status-remove"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Log Grid Preview */}
        <div className="card">
          <div className="card-header">📊 Duty Status Grid Preview</div>
          <LogGrid dutyStatuses={dutyStatuses} />
        </div>

        {/* Route Map Preview */}
        {dutyStatuses.some(s => s.coordinates) && (
          <div className="card">
            <RouteMap 
              dutyStatuses={dutyStatuses}
              driverName={drivers.find(d => d.id === formData.driverId)?.name}
              date={formData.date}
            />
          </div>
        )}

        {/* Hours Summary */}
        <div className="card">
          <div className="card-header">⏱️ Hours Summary</div>
          <div className="hours-summary">
            <div className="hours-item">
              <div className="hours-label">Off Duty</div>
              <div className="hours-value">{hours.offDuty.toFixed(2)}h</div>
            </div>
            <div className="hours-item">
              <div className="hours-label">Sleeper Berth</div>
              <div className="hours-value">{hours.sleeper.toFixed(2)}h</div>
            </div>
            <div className="hours-item">
              <div className="hours-label">Driving</div>
              <div className="hours-value">{hours.driving.toFixed(2)}h</div>
            </div>
            <div className="hours-item">
              <div className="hours-label">On-Duty</div>
              <div className="hours-value">{hours.onDuty.toFixed(2)}h</div>
            </div>
            <div className="hours-item">
              <div className="hours-label">Total</div>
              <div className="hours-value">{hours.total}h</div>
            </div>
          </div>

          {/* Compliance Status */}
          <div className={`compliance-status ${compliance.isCompliant ? 'compliant' : 'violation'}`}>
            <div className="compliance-icon">
              {compliance.isCompliant ? '✓' : '⚠'}
            </div>
            <div className="compliance-text">
              <strong>
                {compliance.isCompliant ? 'HOS Compliant' : 'HOS Violations Detected'}
              </strong>
              {!compliance.isCompliant && (
                <ul className="violation-list">
                  {compliance.violations.map((violation, index) => (
                    <li key={index}>{violation}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/logs')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : id ? 'Update Log' : 'Create Log'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LogForm;





