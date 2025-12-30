import React from 'react';
import { DutyStatus } from '../types';
import './LogGrid.css';

interface LogGridProps {
  dutyStatuses: DutyStatus[];
  editable?: boolean;
  onEdit?: (statuses: DutyStatus[]) => void;
}

const LogGrid: React.FC<LogGridProps> = ({ dutyStatuses, editable = false, onEdit }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const statusTypes: Array<DutyStatus['status']> = ['off-duty', 'sleeper', 'driving', 'on-duty'];

  const getStatusLabel = (status: DutyStatus['status']) => {
    switch (status) {
      case 'off-duty':
        return '1. Off Duty';
      case 'sleeper':
        return '2. Sleeper';
      case 'driving':
        return '3. Driving';
      case 'on-duty':
        return '4. On-Duty';
    }
  };

  const isHourInStatus = (hour: number, minute: number, status: DutyStatus['status']) => {
    return dutyStatuses.some(ds => {
      if (ds.status !== status) return false;

      const timeInMinutes = hour * 60 + minute;
      const startMinutes = ds.startHour * 60 + ds.startMinute;
      let endMinutes = ds.endHour * 60 + ds.endMinute;

      // Handle crossing midnight
      if (endMinutes <= startMinutes) {
        endMinutes += 24 * 60;
      }

      return timeInMinutes >= startMinutes && timeInMinutes < endMinutes;
    });
  };

  const renderGridCells = (status: DutyStatus['status']) => {
    return hours.map(hour => {
      const quarters = [0, 15, 30, 45];
      return quarters.map((minute, qIndex) => {
        const isActive = isHourInStatus(hour, minute, status);
        return (
          <div
            key={`${hour}-${qIndex}`}
            className={`grid-cell ${isActive ? 'active' : ''}`}
            title={`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`}
          />
        );
      });
    });
  };

  const getActiveSegments = (status: DutyStatus['status']) => {
    return dutyStatuses
      .filter(ds => ds.status === status)
      .map((ds, index) => {
        const startMinutes = ds.startHour * 60 + ds.startMinute;
        const endMinutes = ds.endHour * 60 + ds.endMinute;
        const totalMinutes = 24 * 60;

        const left = (startMinutes / totalMinutes) * 100;
        let width = ((endMinutes - startMinutes) / totalMinutes) * 100;

        // Handle crossing midnight
        if (width < 0) {
          width = ((totalMinutes - startMinutes + endMinutes) / totalMinutes) * 100;
        }

        return (
          <div
            key={index}
            className="grid-segment"
            style={{
              left: `${left}%`,
              width: `${width}%`
            }}
            title={`${String(ds.startHour).padStart(2, '0')}:${String(ds.startMinute).padStart(2, '0')} - ${String(ds.endHour).padStart(2, '0')}:${String(ds.endMinute).padStart(2, '0')}`}
          >
            {ds.location && <span className="segment-location">{ds.location}</span>}
          </div>
        );
      });
  };

  return (
    <div className="log-grid-container">
      <div className="grid-header">
        <div className="grid-header-labels">
          <div className="grid-label-spacer"></div>
          <div className="grid-hour-labels">
            {hours.map(hour => (
              <div key={hour} className="hour-label">
                {hour}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-body">
        {statusTypes.map(status => (
          <div key={status} className="grid-row">
            <div className="row-label">{getStatusLabel(status)}</div>
            <div className="row-grid">
              <div className="grid-cells">{renderGridCells(status)}</div>
              <div className="grid-segments">{getActiveSegments(status)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-footer">
        <div className="grid-legend">
          <div className="legend-item">
            <div className="legend-color off-duty"></div>
            <span>Off Duty</span>
          </div>
          <div className="legend-item">
            <div className="legend-color sleeper"></div>
            <span>Sleeper Berth</span>
          </div>
          <div className="legend-item">
            <div className="legend-color driving"></div>
            <span>Driving</span>
          </div>
          <div className="legend-item">
            <div className="legend-color on-duty"></div>
            <span>On-Duty (Not Driving)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogGrid;





