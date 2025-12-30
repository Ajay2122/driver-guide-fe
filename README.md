# Driver Log - HOS Tracking System

A modern React TypeScript application for managing driver daily logs and Hours of Service (HOS) compliance tracking. Built with a KTM-inspired black and orange theme.

![Driver Log System](./public/logo192.png)

## Features

### 📊 Dashboard
- Overview of all logs and drivers
- Real-time compliance statistics
- Quick access to recent logs
- Active driver management

### 📋 Log Management
- Create and edit daily logs
- 24-hour duty status grid visualization
- Real-time HOS compliance checking
- Detailed log viewing with timeline
- Filter and search functionality
- Print-ready log format

### 👥 Driver Management
- Add, edit, and delete drivers
- Driver profile management
- License and terminal information tracking

### ⏱️ HOS Compliance
- Automatic compliance checking
- 11-Hour Driving Limit validation
- 14-Hour Driving Window tracking
- 10-Hour Off-duty requirement monitoring
- Violation detection and reporting

### 🎨 Design
- KTM-inspired black and orange theme
- Responsive design for all devices
- Modern and intuitive UI
- Smooth animations and transitions

## Technology Stack

- **React 18** - Frontend framework
- **TypeScript** - Type-safe development
- **React Router** - Client-side routing
- **Axios** - HTTP client (for mock APIs)
- **Date-fns** - Date manipulation
- **Recharts** - Data visualization
- **CSS3** - Custom styling

## Installation

1. Clone the repository:
```bash
cd driver-log-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

### `npm start`
Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.

### `npm run eject`
**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## Project Structure

```
driver-log-app/
├── src/
│   ├── components/         # Reusable components
│   │   ├── Header.tsx
│   │   ├── LogGrid.tsx
│   │   └── LogGrid.css
│   ├── pages/             # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Dashboard.css
│   │   ├── LogList.tsx
│   │   ├── LogList.css
│   │   ├── LogForm.tsx
│   │   ├── LogForm.css
│   │   ├── LogDetail.tsx
│   │   ├── LogDetail.css
│   │   ├── Drivers.tsx
│   │   └── Drivers.css
│   ├── services/          # API services
│   │   └── api.ts
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   └── hoursCalculator.ts
│   ├── data/              # Mock data
│   │   └── dummyData.ts
│   ├── App.tsx
│   ├── App.css
│   ├── index.tsx
│   └── index.css
└── package.json
```

## Mock API

The application uses a mock API service that simulates real API calls with delays. All data is stored in memory and includes:

- **Drivers API**: CRUD operations for driver management
- **Logs API**: CRUD operations for daily logs
- **Statistics API**: Calculate driver statistics and compliance rates

### API Endpoints

```typescript
// Drivers
api.getAllDrivers()
api.getDriver(id)
api.createDriver(driver)
api.updateDriver(id, driver)
api.deleteDriver(id)

// Logs
api.getAllLogs(params)
api.getLog(id)
api.getDriverLogs(driverId)
api.getRecentLogs(limit)
api.createLog(log)
api.updateLog(id, log)
api.deleteLog(id)

// Statistics
api.getDriverStats(driverId)
```

## Dummy Data

The application comes pre-loaded with:
- 4 sample drivers
- 56 daily logs (14 days per driver)
- Various duty status patterns
- Realistic mileage and compliance data

## HOS Regulations

The application validates against FMCSA HOS regulations:

1. **11-Hour Driving Limit**: Cannot drive more than 11 hours after 10 consecutive hours off duty
2. **14-Hour Driving Window**: Cannot drive after 14 hours on-duty following 10 consecutive hours off duty
3. **10-Hour Off-Duty**: Must have at least 10 hours off duty (off-duty + sleeper berth)

## Color Scheme

- **Primary Orange**: #FF6600 (KTM Orange)
- **Dark Orange**: #E55A00
- **Black**: #1A1A1A
- **Light Black**: #2A2A2A
- **White Background**: #FFFFFF
- **Success**: #4CAF50
- **Warning**: #FFC107
- **Danger**: #F44336

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Real backend API integration
- [ ] PDF export functionality
- [ ] Email notifications
- [ ] Mobile app version
- [ ] Advanced analytics and reporting
- [ ] GPS integration
- [ ] ELD device integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- FMCSA for HOS regulations and guidelines
- KTM for design inspiration
- React community for excellent documentation

## Contact

For questions or support, please contact the development team.

---

Built with ❤️ and ☕ for the trucking industry
