# Environment Setup Guide

## Backend API Configuration

The frontend application needs to connect to the Django backend API. Configure the backend URL using environment variables.

### Step 1: Create Environment File

Create a `.env` file in the root of the `driver-log-app` directory:

```bash
# From driver-log-app directory
touch .env
```

### Step 2: Configure Backend URL

Add the following content to your `.env` file:

```env
# Backend API Base URL
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
```

### Step 3: Update for Different Environments

#### Development (Local)
```env
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
```

#### Production
```env
REACT_APP_API_BASE_URL=https://your-backend-domain.com/api/v1
```

#### Custom Port
If your backend runs on a different port:
```env
REACT_APP_API_BASE_URL=http://localhost:3000/api/v1
```

## Default Configuration

If no `.env` file is created, the application defaults to:
- **Base URL:** `http://localhost:8000/api/v1`
- **Timeout:** 10 seconds

You can find these defaults in `src/config/api.config.ts`.

## Restart Required

After creating or modifying the `.env` file, you must **restart the development server**:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm start
```

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `REACT_APP_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api/v1` | No |

## Troubleshooting

### Connection Errors

If you see errors like "Cannot connect to server":

1. **Check backend is running:**
   ```bash
   cd BusLogs
   python manage.py runserver
   ```

2. **Verify backend URL:**
   - Open `http://localhost:8000/api/v1/` in your browser
   - You should see the API response

3. **Check CORS settings:**
   - Ensure Django backend has CORS configured for `http://localhost:3000`
   - Install: `pip install django-cors-headers`
   - Add to `INSTALLED_APPS`: `'corsheaders'`
   - Add to `MIDDLEWARE`: `'corsheaders.middleware.CorsMiddleware'`
   - Set: `CORS_ALLOWED_ORIGINS = ['http://localhost:3000']`

4. **Restart both servers:**
   ```bash
   # Backend
   cd BusLogs
   python manage.py runserver

   # Frontend (new terminal)
   cd driver-log-app
   npm start
   ```

### Wrong API URL

If the application connects to the wrong backend:

1. Check `.env` file exists in `driver-log-app/` directory
2. Verify `REACT_APP_` prefix is included
3. Restart the development server
4. Clear browser cache (Ctrl+Shift+R)

## Security Note

**Never commit `.env` files to version control!**

The `.env` file is already included in `.gitignore` to prevent accidental commits.

