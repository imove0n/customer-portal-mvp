# Deployment Guide

Complete guide for deploying the Customer Portal to production.

## Pre-Deployment Checklist

### ✅ Code Quality
- [ ] All features tested locally
- [ ] No console errors in browser
- [ ] API endpoints responding correctly
- [ ] Authentication working
- [ ] Database seeded properly

### ✅ Environment Variables
- [ ] Backend `.env` configured
- [ ] Frontend `.env.local` configured
- [ ] ServiceM8 credentials added (if available)
- [ ] JWT secret is strong and unique

### ✅ Security
- [ ] Passwords are hashed
- [ ] JWT tokens expire appropriately
- [ ] CORS configured for production domains
- [ ] No sensitive data in git history
- [ ] `.gitignore` includes all env files

---

## Option 1: Vercel (Frontend) + Railway (Backend)

### Frontend Deployment (Vercel)

**Step 1: Prepare Repository**
```bash
cd customer-portal-mvp
git init
git add .
git commit -m "Initial commit - Customer Portal MVP"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

**Step 2: Deploy to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Set root directory to `frontend`
5. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend-url.railway.app/api`
6. Click "Deploy"

**Step 3: Configure Domain (Optional)**
1. Go to project settings
2. Add custom domain
3. Update DNS records
4. Wait for SSL certificate

### Backend Deployment (Railway)

**Step 1: Create Railway Project**
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Set root directory to `backend`

**Step 2: Configure Environment Variables**
Add these in Railway dashboard:
```
PORT=5000
JWT_SECRET=<generate-strong-secret>
SERVICEM8_API_KEY=<your-key>
SERVICEM8_SECRET=<your-secret>
NODE_ENV=production
```

**Step 3: Configure Start Command**
- Build Command: (leave empty)
- Start Command: `node server.js`

**Step 4: Enable Public Networking**
1. Go to Settings > Networking
2. Generate domain
3. Copy the URL (e.g., `your-app.railway.app`)
4. Update Vercel environment variable with this URL

### Step 5: Update CORS
Edit `backend/server.js` line 11:
```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.vercel.app',
  credentials: true
}));
```

---

## Option 2: Netlify (Frontend) + Render (Backend)

### Frontend Deployment (Netlify)

**Step 1: Build Settings**
1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Connect to GitHub
4. Set base directory: `frontend`
5. Build command: `npm run build`
6. Publish directory: `.next`

**Step 2: Environment Variables**
Add in Netlify dashboard:
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
```

**Step 3: Deploy**
Click "Deploy site"

### Backend Deployment (Render)

**Step 1: Create Web Service**
1. Go to [render.com](https://render.com)
2. Click "New" > "Web Service"
3. Connect GitHub repository
4. Set root directory: `backend`

**Step 2: Configure**
- Name: customer-portal-backend
- Runtime: Node
- Build Command: `npm install`
- Start Command: `node server.js`

**Step 3: Environment Variables**
```
PORT=10000
JWT_SECRET=<strong-secret>
SERVICEM8_API_KEY=<your-key>
SERVICEM8_SECRET=<your-secret>
NODE_ENV=production
```

**Step 4: Deploy**
Click "Create Web Service"

---

## Option 3: DigitalOcean (Full Stack)

### Using DigitalOcean App Platform

**Step 1: Create App**
1. Go to DigitalOcean dashboard
2. Click "Create" > "Apps"
3. Connect GitHub repository

**Step 2: Configure Components**

**Backend Component:**
- Type: Web Service
- Source Directory: `backend`
- Run Command: `node server.js`
- HTTP Port: 5000

**Frontend Component:**
- Type: Static Site
- Source Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `.next`

**Step 3: Environment Variables**
Set for each component as needed

**Step 4: Deploy**
Review and deploy

---

## Database Migration (Production)

### Migrate from SQLite to PostgreSQL

**Step 1: Create PostgreSQL Database**
Choose a provider:
- Railway (easy)
- Supabase (free tier)
- Heroku Postgres
- DigitalOcean Managed DB

**Step 2: Update Backend Dependencies**
```bash
npm install pg
npm uninstall better-sqlite3
```

**Step 3: Update database.js**
Replace SQLite code with PostgreSQL client:
```javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

**Step 4: Migrate Schema**
Run migration scripts to create tables in PostgreSQL

**Step 5: Seed Data**
Import demo data to new database

---

## Post-Deployment

### Verification Checklist

- [ ] Frontend loads without errors
- [ ] Can login with demo credentials
- [ ] Bookings display correctly
- [ ] Can view booking details
- [ ] Attachments load and download
- [ ] Can send messages
- [ ] ServiceM8 integration working (if configured)
- [ ] Mobile responsive works
- [ ] HTTPS enabled
- [ ] Performance is acceptable

### Monitoring Setup

**Frontend (Vercel)**
- Analytics enabled
- Error tracking via Vercel logs

**Backend**
- Railway/Render logs monitored
- Set up alerts for crashes
- Database backup schedule

### Performance Optimization

**Frontend:**
- Enable Vercel Analytics
- Check Lighthouse score
- Optimize images further
- Enable caching headers

**Backend:**
- Add Redis for caching
- Enable gzip compression
- Monitor response times
- Set up rate limiting

---

## Custom Domain Setup

### Frontend Domain

**Step 1: Purchase Domain**
- Namecheap, Google Domains, etc.
- Example: `customerportal.com`

**Step 2: Configure DNS**
Add these records:
```
Type: A
Name: @
Value: <vercel-ip>

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Step 3: Add to Vercel**
1. Project Settings > Domains
2. Add `customerportal.com`
3. Add `www.customerportal.com`
4. Wait for SSL

### Backend Domain

**Option 1: Subdomain**
```
Type: CNAME
Name: api
Value: your-backend.railway.app
```

**Option 2: Custom Domain in Railway**
1. Settings > Domains
2. Add custom domain
3. Follow DNS instructions

---

## Environment-Specific Configuration

### Production Settings

**Backend:**
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=<very-strong-secret-64-chars>
SERVICEM8_API_KEY=<production-key>
SERVICEM8_SECRET=<production-secret>
DATABASE_URL=<postgresql-connection-string>
CORS_ORIGIN=https://customerportal.com
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=https://api.customerportal.com/api
NEXT_PUBLIC_ENV=production
```

### Staging Settings

**Backend:**
```env
NODE_ENV=staging
PORT=5000
JWT_SECRET=<staging-secret>
SERVICEM8_API_KEY=<test-key>
SERVICEM8_SECRET=<test-secret>
DATABASE_URL=<staging-db-url>
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=https://staging-api.customerportal.com/api
NEXT_PUBLIC_ENV=staging
```

---

## Rollback Plan

### If Deployment Fails

**Vercel:**
1. Go to Deployments
2. Find last working deployment
3. Click "..." > "Promote to Production"

**Railway/Render:**
1. Go to Deployments tab
2. Select previous version
3. Click "Redeploy"

### Database Rollback
1. Restore from backup
2. Update connection string
3. Restart backend

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs
- Review performance metrics
- Verify backups working

**Monthly:**
- Update dependencies
- Security audit (`npm audit`)
- Review and clean logs

**Quarterly:**
- Review infrastructure costs
- Optimize database queries
- Update documentation

---

## Troubleshooting

### Common Issues

**Issue**: Frontend can't connect to backend
**Solution**: Check CORS settings and API URL

**Issue**: Database connection timeout
**Solution**: Verify connection string and network settings

**Issue**: 502 Bad Gateway
**Solution**: Check backend is running and logs for errors

**Issue**: Authentication failing
**Solution**: Verify JWT_SECRET matches between deploys

---

## Support & Resources

**Vercel Docs**: https://vercel.com/docs
**Railway Docs**: https://docs.railway.app
**Render Docs**: https://render.com/docs
**Next.js Docs**: https://nextjs.org/docs
**Express Docs**: https://expressjs.com

---

## Cost Estimates

### Free Tier (Development/Testing)
- **Vercel**: Free (Hobby)
- **Railway**: $5/month credit
- **Render**: Free tier available
- **Total**: ~$0-5/month

### Production (Small Scale)
- **Vercel Pro**: $20/month
- **Railway**: ~$10-20/month
- **Database**: ~$7-15/month
- **Total**: ~$37-55/month

### Production (Medium Scale)
- **Vercel Pro**: $20/month
- **Railway**: ~$30-50/month
- **Managed PostgreSQL**: ~$15-25/month
- **CDN**: ~$10/month
- **Total**: ~$75-105/month

---

Ready to deploy! Follow the guide for your chosen platform and you'll be live in minutes. 🚀
