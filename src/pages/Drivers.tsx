import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Driver } from '../types';
import './Drivers.css';

const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    homeTerminal: '',
    mainOfficeAddress: ''
  });

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const response = await api.getAllDrivers();
      setDrivers(response.data);
    } catch (error) {
      console.error('Error loading drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingDriver) {
        await api.updateDriver(editingDriver.id, formData);
        alert('Driver updated successfully!');
      } else {
        await api.createDriver(formData);
        alert('Driver created successfully!');
      }
      setShowModal(false);
      resetForm();
      loadDrivers();
    } catch (error) {
      console.error('Error saving driver:', error);
      alert('Error saving driver. Please try again.');
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      homeTerminal: driver.homeTerminal,
      mainOfficeAddress: driver.mainOfficeAddress
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await api.deleteDriver(id);
        alert('Driver deleted successfully!');
        loadDrivers();
      } catch (error) {
        console.error('Error deleting driver:', error);
        alert('Error deleting driver. Please try again.');
      }
    }
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingDriver(null);
    setFormData({
      name: '',
      licenseNumber: '',
      homeTerminal: '',
      mainOfficeAddress: ''
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="drivers-page">
      <h1 className="page-title">
        <span className="page-title-icon">👥</span>
        Drivers
        <button onClick={handleAddNew} className="btn btn-primary btn-sm">
          ➕ Add Driver
        </button>
      </h1>

      <div className="drivers-grid-page">
        {drivers.length === 0 ? (
          <div className="card">
            <p style={{ textAlign: 'center', padding: '2rem' }}>
              No drivers available. Click "Add Driver" to create one.
            </p>
          </div>
        ) : (
          drivers.map(driver => (
            <div key={driver.id} className="driver-card-page">
              <div className="driver-card-header">
                <div className="driver-avatar-large">
                  {driver.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="driver-card-actions">
                  <button
                    onClick={() => handleEdit(driver)}
                    className="btn btn-outline btn-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(driver.id)}
                    className="btn btn-danger btn-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="driver-card-body">
                <h3 className="driver-name">{driver.name}</h3>
                <div className="driver-detail">
                  <span className="detail-label">License:</span>
                  <span className="detail-value">{driver.licenseNumber}</span>
                </div>
                <div className="driver-detail">
                  <span className="detail-label">Terminal:</span>
                  <span className="detail-value">{driver.homeTerminal}</span>
                </div>
                <div className="driver-detail">
                  <span className="detail-label">Office:</span>
                  <span className="detail-value">{driver.mainOfficeAddress}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingDriver ? 'Edit Driver' : 'Add New Driver'}</h2>
              <button onClick={handleCloseModal} className="modal-close">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">License Number *</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    placeholder="DL-12345678"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Home Terminal *</label>
                  <input
                    type="text"
                    name="homeTerminal"
                    value={formData.homeTerminal}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    placeholder="Los Angeles Terminal"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Main Office Address *</label>
                  <input
                    type="text"
                    name="mainOfficeAddress"
                    value={formData.mainOfficeAddress}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDriver ? 'Update Driver' : 'Create Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;





