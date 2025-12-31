# Backend Integration Guide

## Overview

Your React app is now integrated with the Django backend GPS features. The app automatically falls back to mock data if the backend is not available.

---

## Configuration

### Option 1: Using Environment Variable (Recommended)

Create a `.env` file in the root of your React app:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

### Option 2: Default Behavior

If no environment variable is set, the app defaults to `http://localhost:8000`.

---

## How It Works

### Automatic Fallback System

The app tries to connect to the backend first, then falls back to mock data if:
- Backend is not running
- Backend is unreachable
- Network error occurs

**Example:**
```
User clicks "Get GPS" button
    ↓
Try: POST http://localhost:8000/api/v1/gps/geocode/
    ↓
Backend Available? → Yes → Use real OpenStreetMap geocoding
    ↓
Backend Available? → No → Use mock location database
```

### Features with Backend Integration

1. **Geocoding** (`/gps/geocode/`)
   - Frontend: Clicks "Get GPS" button
   - Backend: Calls OpenStreetMap Nominatim (FREE)
   - Fallback: Uses mock 40+ location database

2. **Route Visualization** (`/logs/{id}/route/`)
   - Frontend: Views log detail page
   - Backend: Generates route with real distance calculations
   - Fallback: Uses client-side route generation

---

## Starting the Backend

### 1. Navigate to Backend Directory
```bash
cd /home/dev/Desktop/play-ground/assesment/BusLogs
```

### 2. Activate Virtual Environment
```bash
source venv/bin/activate
```

### 3. Install Dependencies (if not already done)
```bash
pip install -r requirements.txt
```

### 4. Run Migrations
```bash
python manage.py migrate
```

### 5. Start Django Server
```bash
python manage.py runserver
```

**Backend will be available at:** `http://localhost:8000`

---

## Testing the Integration

### Test 1: Backend Running

1. **Start Backend:**
   ```bash
   cd BusLogs
   source venv/bin/activate
   python manage.py runserver
   ```

2. **Start Frontend:**
   ```bash
   cd driver-log-app
   npm start
   ```

3. **Create a New Log:**
   - Click "New Log"
   - Add duty status with location: "New York"
   - Click "Get GPS"
   - Should see: OpenStreetMap data (more accurate)

### Test 2: Backend Not Running

1. **Stop Backend** (if running)

2. **Keep Frontend Running:**
   ```bash
   cd driver-log-app
   npm start
   ```

3. **Create a New Log:**
   - Click "New Log"
   - Add duty status with location: "Los Angeles"
   - Click "Get GPS"
   - Should see: Mock data (still works!)

---

## API Endpoints Used

### From React App → Django Backend

| Frontend Action | Backend Endpoint | Method | Fallback |
|----------------|------------------|--------|----------|
| Click "Get GPS" | `/api/v1/gps/geocode/` | POST | Mock geocoding |
| View Log Route | `/api/v1/logs/{id}/route/` | GET | Client-side calculation |

---

## Backend Features Available

When backend is running, you get:

### 1. Real Geocoding (OpenStreetMap)
- ✅ Worldwide coverage (not just 40+ mock locations)
- ✅ Accurate address matching
- ✅ Database caching (first request slow, subsequent instant)
- ✅ No API key required (FREE)

### 2. Route Statistics
- ✅ Server-side distance calculation
- ✅ Driving segment analysis
- ✅ Route statistics stored in database

### 3. Auto-Geocoding (Future Feature)
When creating logs via backend API directly:
```javascript
// Can send location names, backend geocodes automatically
POST /api/v1/logs
{
  "autoGeocode": true,
  "dutyStatuses": [
    {"location": "Los Angeles"}, // Backend will geocode this
    {"location": "San Francisco"} // And this
  ]
}
```

---

## Environment Variables

### Create `.env` file in `driver-log-app/`:

```env
# Backend URL (default: http://localhost:8000)
REACT_APP_BACKEND_URL=http://localhost:8000

# For production:
# REACT_APP_BACKEND_URL=https://your-backend-domain.com
```

### For Production Deployment:

```env
# Production backend
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

---

## CORS Configuration (Backend)

The Django backend already has CORS enabled via `django-cors-headers`. 

If you need to customize allowed origins, edit `BusLogs/buslogs/settings.py`:

```python
# In settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React dev server
    "http://localhost:3001",
    "https://your-production-domain.com",
]

# Or allow all for development (not recommended for production)
CORS_ALLOW_ALL_ORIGINS = True
```

---

## Troubleshooting

### Issue: "Location not found" even with backend running

**Check:**
1. Backend server is running (`http://localhost:8000`)
2. Check browser console for CORS errors
3. Verify backend URL in `.env` is correct

**Solution:**
```bash
# Test backend directly
curl -X POST http://localhost:8000/api/v1/gps/geocode/ \
  -H "Content-Type: application/json" \
  -d '{"location": "Los Angeles"}'
```

### Issue: Frontend can't connect to backend

**Check:**
1. Backend running: `python manage.py runserver`
2. Port 8000 is not blocked by firewall
3. No other service using port 8000

**Solution:**
```bash
# Run backend on different port
python manage.py runserver 8080

# Update .env
REACT_APP_BACKEND_URL=http://localhost:8080
```

### Issue: Mock data always used

**This is expected behavior when:**
- Backend is not running
- Backend URL is wrong
- Network issues

**Check console logs:**
- Should see: "Backend not available, using mock geocoding"

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│           React Frontend (Port 3000)             │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  User clicks "Get GPS" button            │  │
│  └──────────────┬───────────────────────────┘  │
│                 │                                │
│  ┌──────────────▼───────────────────────────┐  │
│  │  api.geocodeLocation(location)           │  │
│  │  Try: POST /api/v1/gps/geocode/         │  │
│  └──────────────┬───────────────────────────┘  │
│                 │                                │
└─────────────────┼────────────────────────────────┘
                  │
      ┌───────────▼──────────┐
      │  Backend Available?   │
      └───────────┬──────────┘
                  │
         ┌────────┴─────────┐
         │                  │
       YES                 NO
         │                  │
         ▼                  ▼
┌──────────────────┐  ┌──────────────────┐
│ Django Backend   │  │ Mock Geocoding   │
│ (Port 8000)      │  │ (40+ locations)  │
│                  │  │                  │
│ ┌──────────────┐│  │ Returns:         │
│ │OpenStreetMap ││  │ {lat, lng}       │
│ │ Nominatim    ││  │ from database    │
│ │   (FREE)     ││  │                  │
│ └──────────────┘│  └──────────────────┘
│                  │
│ ┌──────────────┐│
│ │Location Cache││
│ │  Database    ││
│ └──────────────┘│
│                  │
│ Returns:         │
│ {lat, lng,       │
│  formattedAddr}  │
└──────────────────┘
```

---

## Development Workflow

### Typical Development Setup:

**Terminal 1 - Backend:**
```bash
cd /home/dev/Desktop/play-ground/assesment/BusLogs
source venv/bin/activate
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd /home/dev/Desktop/play-ground/assesment/driver-log-app
npm start
```

**Result:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Full GPS features with OpenStreetMap

### Testing Without Backend:

**Terminal 1 - Frontend Only:**
```bash
cd /home/dev/Desktop/play-ground/assesment/driver-log-app
npm start
```

**Result:**
- Frontend: http://localhost:3000
- Mock data: 40+ locations work
- Perfect for UI development

---

## Summary

✅ **Integration Complete:**
- Frontend automatically tries backend first
- Falls back to mock data seamlessly
- No code changes needed to switch

✅ **Flexible Development:**
- Work with or without backend
- Easy to test both modes
- Production ready

✅ **FREE OpenStreetMap:**
- No API key required
- Worldwide coverage
- Database caching for speed

**Ready to use! Start both servers for full GPS features, or just frontend for mock data.**

