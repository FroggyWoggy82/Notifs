# Railway Deployment Guide

## Required Environment Variables

Set these environment variables in your Railway project:

### Database
- `DATABASE_URL` - PostgreSQL connection string (automatically provided by Railway when you add a PostgreSQL service)
- `NODE_ENV=production` - Enables production optimizations

### Optional Environment Variables

#### For faster startup (if database connection issues persist):
- `SKIP_DB_TEST=true` - Skip database connection test on startup
- `OFFLINE_MODE=true` - Start server without database connection

#### For push notifications:
- `VAPID_PUBLIC_KEY` - Web push public key
- `VAPID_PRIVATE_KEY` - Web push private key

#### For additional features:
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to Google Cloud credentials JSON
- `CRONOMETER_USERNAME` - Cronometer account username
- `CRONOMETER_PASSWORD` - Cronometer account password

## Deployment Configuration

The following files are configured for Railway deployment:

- `railway.toml` - Railway-specific deployment configuration
- `nixpacks.toml` - Build system configuration
- `Procfile` - Process definition

## Health Check

The application provides a health check endpoint at `/health` that returns:
- Server status
- Database connection status
- Memory usage
- Environment information
- Railway-specific metadata

## Troubleshooting

### If deployment fails with health check timeout:

1. Check Railway logs for database connection errors
2. Verify `DATABASE_URL` environment variable is set
3. Consider setting `SKIP_DB_TEST=true` temporarily
4. Check if the PostgreSQL service is running

### If the server starts but health checks fail:

1. Verify the health endpoint is accessible: `curl https://your-app.railway.app/health`
2. Check server logs for startup errors
3. Ensure the correct port is being used (Railway sets `PORT` automatically)

## Recent Optimizations

The following optimizations have been made for Railway deployment:

1. **Faster startup**: Reduced database connection timeouts for Railway environment
2. **Better error handling**: Server starts even if database connection fails
3. **Optimized health checks**: Reduced health check timeout from 200s to 60s
4. **Environment detection**: Automatic Railway environment detection
5. **Resource optimization**: Fewer database connections and shorter timeouts for Railway

## Manual Deployment Steps

1. Connect your GitHub repository to Railway
2. Add a PostgreSQL service to your Railway project
3. Set required environment variables
4. Deploy the application
5. Monitor the health check endpoint

The application should start within 15-30 seconds and respond to health checks within 60 seconds.
