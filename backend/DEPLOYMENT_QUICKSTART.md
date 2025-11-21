# Quick Deployment Reference

## What's Ready

- `render.yaml` configured for production
- Database schema created in Tiger Cloud
- `.gitignore` protecting credentials
- Complete documentation created

## Deployment Checklist

### Before Deploying
- Update `main.py` with your API endpoints
- Ensure `database.py` exists with SQLAlchemy models
- Test locally: `uvicorn main:app --reload`
- Verify database connection works locally

### Deploy to Render
1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Web Service in Render**
   - Go to: https://dashboard.render.com
   - New + → Web Service
   - Connect repo: `faramirezs/backend-proof-quest`

3. **Set Environment Variables**
   Copy these from `.env`:
   ```
   TIMESCALE_SERVICE_URL=postgres://username:password@host:port/database?sslmode=require
   PGHOST=your_host
   PGPORT=your_port
   PGDATABASE=your_database
   PGUSER=your_username
   PGPASSWORD=your_password
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete
   - Test: `https://brand-challenge-backend.onrender.com/health`

## Important URLs

- **Render Dashboard**: https://dashboard.render.com
- **Tiger Cloud Dashboard**: https://cloud.timescale.com
- **Your API (after deploy)**: https://brand-challenge-backend.onrender.com
- **API Docs (after deploy)**: https://brand-challenge-backend.onrender.com/docs

## Documentation

| File | Purpose |
|------|---------|
| `DATABASE_SCHEMA.md` | Database documentation |
| `README_DATABASE.md` | Database quick start |
| `queries.sql` | Ready-to-use SQL queries |

## Quick Commands

```bash
# Test database locally
python3 -c "from database import test_connection; test_connection()"

# Run locally
uvicorn main:app --reload --port 8000

# Test health endpoint (after deploy)
curl https://brand-challenge-backend.onrender.com/health

# View logs in Render
# Use the dashboard: Logs tab
```

## Troubleshooting

**Build fails?**
- Check `requirements.txt` has all dependencies
- Verify Python version compatibility
- Review build logs in Render dashboard

**Database connection fails?**
- Verify environment variables in Render dashboard
- Test connection string format
- Check database service status in Tiger Cloud

**Health check fails?**
- Ensure `/health` endpoint returns 200 OK
- Verify database connectivity
- Check server logs for errors

**Service is slow?**
- Free tier spins down after 15 min inactivity (first request takes ~30s)
- Consider upgrading to paid tier for production use
- Monitor response times in Render metrics

## Support

- Render Docs: https://render.com/docs
- Tiger Cloud Support: https://docs.tigerdata.com
- Project Files: See documentation in `backend-proof-quest/`

---
