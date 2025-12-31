# Driver's Daily Log - Frontend Application

A modern React-based web application for managing and tracking driver's daily logs with HOS (Hours of Service) compliance checking, GPS tracking, and interactive route visualization.

## Features

### Core Functionality
- **Driver Management** - Create, edit, view, and delete driver profiles
- **Daily Log Management** - Comprehensive CRUD operations for daily logs
- **24-Hour Duty Status Grid** - Visual timeline representation of driver activities
- **HOS Compliance Checking** - Real-time validation against FMCSA regulations
- **GPS & Geocoding** - Location tracking and route visualization
- **Interactive Maps** - Visual representation of driver routes with distance calculations
- **Dashboard & Analytics** - Overview statistics and compliance metrics
- **Print Functionality** - Export logs for record-keeping

### Technical Features
- Real-time data validation
- Axios-based API integration
- TypeScript for type safety
- OpenStreetMap integration for maps
- Environment-based configuration

## Technology Stack

- **Framework:** React 18
- **Language:** TypeScript
- **HTTP Client:** Axios
- **Routing:** React Router DOM v6
- **Maps:** React-Leaflet + Leaflet
- **Styling:** CSS3 with CSS Variables
- **Build Tool:** Create React App

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running (see ../BusLogs/README.md)

## Installation

### 1. Clone the Repository
```bash
cd driver-log-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
```

**Available Environment Variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api/v1` |

### 4. Start Development Server
```bash
npm start
```

The application will open at `http://localhost:3000`

## Available Scripts

### Development
```bash
npm start
```
Runs the app in development mode with hot reload.

### Production Build
```bash
npm run build
```
Builds optimized production bundle in the `build/` folder.

### Testing
```bash
npm test
```
Launches the test runner in interactive watch mode.

### Linting
```bash
npm run lint
```
Checks code for linting errors.

## Project Structure

```
driver-log-app/
├── public/                 # Static files
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Header.tsx    # Navigation header
│   │   ├── LogGrid.tsx   # 24-hour duty status grid
│   │   └── RouteMap.tsx  # Interactive map component
│   ├── pages/            # Page components
│   │   ├── Dashboard.tsx # Main dashboard
│   │   ├── LogList.tsx   # All logs listing
│   │   ├── LogForm.tsx   # Create/edit log form
│   │   ├── LogDetail.tsx # Single log detail view
│   │   └── Drivers.tsx   # Driver management
│   ├── services/         # API services
│   │   └── api.ts        # Axios API client
│   ├── config/           # Configuration
│   │   └── api.config.ts # API configuration
│   ├── utils/            # Utility functions
│   │   ├── hoursCalculator.ts  # HOS calculations
│   │   └── gpsUtils.ts         # GPS utilities
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── data/             # Mock/dummy data (dev only)
│   ├── App.tsx           # Main app component
│   ├── App.css           # Global styles
│   └── index.tsx         # Entry point
├── .env                  # Environment variables (create this)
├── package.json
└── README.md
```

## API Integration

The application connects to the Django backend API. All endpoints are integrated:

### Driver Endpoints
- `GET /drivers` - List all drivers
- `POST /drivers` - Create new driver
- `GET /drivers/:id` - Get driver details
- `PATCH /drivers/:id` - Update driver
- `DELETE /drivers/:id` - Delete driver

### Log Endpoints
- `GET /logs` - List all logs (with filters)
- `POST /logs` - Create new log
- `GET /logs/:id` - Get log details
- `PATCH /logs/:id` - Update log
- `DELETE /logs/:id` - Delete log

### GPS Endpoints
- `POST /gps/geocode/` - Convert location to coordinates
- `GET /logs/:id/route/` - Get route visualization data

For complete API documentation, see `../BACKEND_API_SPECIFICATION.md`

## Configuration

### Connecting to Backend

1. Ensure backend is running at `http://localhost:8000`
2. Update `.env` if using different URL
3. Restart development server after changing `.env`

### CORS Configuration

Backend must allow frontend origin. Ensure Django has:
```python
CORS_ALLOWED_ORIGINS = ['http://localhost:3000']
```

## Features Guide

### Creating a Daily Log

1. Navigate to "Create Log" page
2. Select driver and date
3. Add duty status entries with times
4. Enter locations for driving/on-duty statuses
5. Click "Get GPS" to geocode locations
6. Save the log

### GPS Geocoding

**Input Methods:**
- Location name: `Los Angeles, CA`
- GPS coordinates: `34.0522, -118.2437`

**Features:**
- Free OpenStreetMap Nominatim service
- Automatic caching for performance
- No API key required

### Route Visualization

- Interactive map with custom markers for each duty status
- Orange lines showing driving segments
- Distance calculations displayed on routes
- Automatic map zoom to fit all locations

### HOS Compliance

The system checks:
- **Driving hours:** 11-hour daily limit
- **On-duty hours:** 14-hour daily limit
- **Rest breaks:** 8-hour break after 14 hours
- **Cycle hours:** 60/70-hour weekly limit

## Deployment

### Building for Production

```bash
npm run build
```

This creates an optimized production build in `build/`.

### Deployment Options

**Static Hosting:**
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

**Example (Netlify):**
```bash
npm run build
netlify deploy --prod --dir=build
```

**Update Environment Variables:**
```env
REACT_APP_API_BASE_URL=https://api.your-domain.com/api/v1
```

## Troubleshooting

### Cannot Connect to Backend

**Solution:**
1. Verify backend is running: `curl http://localhost:8000/api/v1/`
2. Check `.env` file exists and has correct URL
3. Restart dev server: Ctrl+C, then `npm start`
4. Check browser console (F12) for errors

### CORS Errors

**Solution:**
1. Install django-cors-headers in backend
2. Add to Django INSTALLED_APPS and MIDDLEWARE
3. Set CORS_ALLOWED_ORIGINS
4. Restart backend server

### Geocoding Not Working

**Solution:**
1. Check internet connection (Nominatim requires internet)
2. Wait a moment (rate limiting may apply)
3. Try entering GPS coordinates directly
4. Check backend logs for errors

### Build Errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Production build size: ~145 KB (gzipped)
- Initial load time: < 2 seconds
- Interactive maps with lazy loading
- Optimized API calls with caching

## Improvement Points

### High Priority

1. **Print Formatting**
   - Currently prints the site view (web page layout)
   - **Future:** Implement proper FMCSA-compliant driver log form printing
   - Should match the official format shown in requirement document
   - Include proper grid, fields, and signature areas
   - Use CSS `@media print` for print-specific styling

2. **Offline Support**
   - Add service workers for offline functionality
   - Cache logs locally with IndexedDB
   - Sync when connection restored

3. **Mobile App**
   - Convert to Progressive Web App (PWA)
   - Add install prompt
   - Native mobile apps (React Native)

### Medium Priority

4. **Authentication & Authorization**
   - User login/logout
   - JWT token management
   - Role-based access control
   - Driver vs Manager vs Admin roles

5. **Real-time Updates**
   - WebSocket integration
   - Live log updates
   - Notification system
   - Multi-user collaboration

6. **Enhanced Reporting**
   - PDF export with proper formatting
   - Excel/CSV export
   - Custom date range reports
   - Compliance summary reports

7. **Advanced Analytics**
   - Driver performance metrics
   - Fuel efficiency tracking
   - Route optimization suggestions
   - Predictive compliance warnings

### Low Priority

8. **UI Enhancements**
   - Dark mode toggle
   - Customizable themes
   - Drag-and-drop duty status editing
   - Keyboard shortcuts

9. **Additional Features**
   - Vehicle maintenance tracking
   - Fuel log integration
   - Weather conditions overlay on maps
   - Traffic data integration
   - Multi-language support

10. **Data Visualization**
    - Charts and graphs for trends
    - Heatmaps for frequently traveled routes
    - Compliance score over time
    - Driver comparison dashboards

## Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm test -- --coverage
```

### E2E Testing
Consider adding Cypress or Playwright for end-to-end testing.

## Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

This project is proprietary software for driver log management.

## Support

For issues or questions:
- Check troubleshooting section
- Review backend documentation
- Check browser console for errors
- Verify backend API is responding

## Related Documentation

- Backend API: `../BusLogs/README.md`
- Full Stack Guide: `../FULL_STACK_INTEGRATION_GUIDE.md`
- Environment Setup: `./ENVIRONMENT_SETUP.md`
- Integration Details: `./BACKEND_INTEGRATION.md`
- Quick Start: `../QUICK_START.md`

## Version

**Current Version:** 1.0.0

## Author

Driver's Daily Log Application - HOS Compliance Management System
