# Backend Deployment

## Quick Deploy to Render

### 1. Push this branch to GitHub
```bash
git push origin backend-render-deploy
```

### 2. Create Web Service on Render
- Go to [Render Dashboard](https://dashboard.render.com)
- Click "New +" → "Web Service"
- Connect repository and select `backend-render-deploy` branch

### 3. Configure Build & Start
- **Build Command:** `cd src/backend && npm install && npm run build`
- **Start Command:** `cd src/backend && npm start`
- **Plan:** Free

### 4. Add Environment Variables
See `RENDER_DEPLOYMENT_GUIDE.md` in root for full list of required variables.

### 5. Deploy
Click "Create Web Service" and wait for deployment.

## Service URL
Your backend will be available at:
```
https://your-service-name.onrender.com
```

## Health Check
```bash
curl https://your-service-name.onrender.com/health
```

## API Endpoints
- `/health` - Health check
- `/api` - API information
- `/api/config` - Configuration status
- `/api/config/save` - Save API keys
- `/api/config/test/:service` - Test service connection

## Documentation
See `RENDER_DEPLOYMENT_GUIDE.md` for complete deployment instructions.
