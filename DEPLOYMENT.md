# 🚀 Deploying Noufi to Render.com + GitHub

## Prerequisites

1. **GitHub Account** - [github.com](https://github.com)
2. **Render Account** - [render.com](https://render.com) (free tier available)
3. **MongoDB Atlas Account** - [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) (free tier available)

---

## Step 1: Setup MongoDB Atlas (Free Database)

1. **Create MongoDB Atlas Account:**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free

2. **Create a Cluster:**
   - Click "Build a Database"
   - Select "M0 Sandbox" (FREE)
   - Choose a cloud provider and region closest to you
   - Name your cluster (e.g., "noufi-cluster")
   - Click "Create Cluster"

3. **Create Database User:**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and strong password (SAVE THESE!)
   - Set role to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Setup Network Access:**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Confirm

5. **Get Connection String:**
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Select "Node.js" and version "4.1 or later"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:<password>@cluster.mongodb.net/`
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://username:password@cluster.mongodb.net/noufi-game`
   - **SAVE THIS STRING!**

---

## Step 2: Push Code to GitHub

1. **Initialize Git Repository:**
```bash
cd noufi-game
git init
git add .
git commit -m "Initial commit: Noufi casino game"
```

2. **Create GitHub Repository:**
   - Go to [github.com/new](https://github.com/new)
   - Name it "noufi-game"
   - Don't initialize with README (we already have one)
   - Click "Create repository"

3. **Push to GitHub:**
```bash
git remote add origin https://github.com/YOUR-USERNAME/noufi-game.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Backend to Render

1. **Create Render Account:**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub (this auto-connects your repos)

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Select your "noufi-game" repository
   - Click "Connect"

3. **Configure Backend Service:**
   - **Name:** `noufi-backend`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable" and add these:

   ```
   NODE_ENV = production
   PORT = 3000
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/noufi-game
   JWT_SECRET = your-super-secret-key-minimum-32-characters-long
   JWT_EXPIRE = 7d
   DEFAULT_STARTING_BALANCE = 1000
   BOT_WIN_RATE = 0.65
   MATCHMAKING_TIMEOUT = 20000
   FRONTEND_URL = https://noufi-frontend.onrender.com
   ```

   **IMPORTANT:**
   - Replace `MONGODB_URI` with your actual MongoDB Atlas connection string
   - Generate a strong random string for `JWT_SECRET` (use: https://randomkeygen.com/)
   - For `FRONTEND_URL`, use placeholder for now, we'll update it later

5. **Deploy Backend:**
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Copy the backend URL (e.g., `https://noufi-backend.onrender.com`)

---

## Step 4: Deploy Frontend to Render

1. **Create New Static Site:**
   - Click "New +" → "Static Site"
   - Select your "noufi-game" repository

2. **Configure Frontend Service:**
   - **Name:** `noufi-frontend`
   - **Branch:** `main`
   - **Root Directory:** Leave empty
   - **Publish Directory:** `frontend/public`
   - **Build Command:** Leave empty

3. **Deploy Frontend:**
   - Click "Create Static Site"
   - Wait for deployment (1-2 minutes)
   - Copy the frontend URL (e.g., `https://noufi-frontend.onrender.com`)

---

## Step 5: Update Configuration

### Update Backend FRONTEND_URL

1. Go to your backend service on Render
2. Click "Environment"
3. Edit `FRONTEND_URL` to your actual frontend URL
4. Click "Save Changes"
5. Backend will auto-redeploy

### Update Frontend API URLs

1. **Edit `frontend/public/js/config.js` on GitHub:**

```javascript
const CONFIG = {
    // Replace with your actual backend URL
    API_URL: 'https://noufi-backend.onrender.com',
    SOCKET_URL: 'https://noufi-backend.onrender.com',
    // ... rest of config
};
```

2. **Commit and Push:**
```bash
git add frontend/public/js/config.js
git commit -m "Update API URLs for production"
git push origin main
```

3. Frontend will auto-redeploy on Render

---

## Step 6: Test Your Game!

1. **Visit your frontend URL:**
   - `https://noufi-frontend.onrender.com`

2. **Register a new account**

3. **Test the game:**
   - Select a bet amount
   - Wait for matchmaking (should get bot after 20 seconds)
   - Play a game!

---

## 🎯 Important Notes

### Free Tier Limitations

**Render Free Tier:**
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds (cold start)
- 750 hours/month of runtime (enough for one service)

**MongoDB Atlas Free Tier:**
- 512 MB storage
- Shared CPU
- More than enough for development/testing

### Keeping Services Awake

If you want to prevent cold starts:

1. **Use Uptime Monitoring (Free):**
   - [UptimeRobot](https://uptimerobot.com)
   - Ping your backend every 10 minutes
   - Free tier allows 50 monitors

2. **Upgrade to Paid Plan:**
   - Render: $7/month for always-on
   - Worth it for production apps

---

## 🔧 Troubleshooting

### Backend Won't Start
- Check environment variables are set correctly
- View logs in Render dashboard
- Verify MongoDB connection string

### Frontend Can't Connect to Backend
- Check CORS is configured correctly
- Verify API_URL in config.js matches backend URL
- Check backend logs for errors

### Database Connection Failed
- Verify MongoDB Atlas IP whitelist includes "0.0.0.0/0"
- Check username/password in connection string
- Ensure database user has correct permissions

### Cold Start Issues
- This is normal on free tier
- First request after 15min inactivity will be slow
- Consider uptime monitoring or paid tier

---

## 📊 Monitoring Your App

### Render Dashboard
- View logs
- Monitor resource usage
- Check deployment history
- See live requests

### MongoDB Atlas
- Database size
- Connection count
- Query performance
- Real-time metrics

---

## 🚀 Future Improvements

### Custom Domain
1. Buy domain (Namecheap, Google Domains)
2. Add custom domain in Render
3. Update DNS records
4. Enable HTTPS (automatic)

### Continuous Deployment
- Already set up!
- Push to GitHub main branch → Auto-deploys
- Use feature branches for development
- Merge to main when ready

### Environment-Specific Configs
- Create `.env.development` and `.env.production`
- Use different MongoDB databases for dev/prod
- Separate Render services for staging and production

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] Connection string saved
- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Render
- [ ] Environment variables configured
- [ ] API URLs updated in config.js
- [ ] CORS configured correctly
- [ ] Test registration works
- [ ] Test game matchmaking works
- [ ] Test bot gameplay works

---

## 🎉 You're Live!

Your Noufi casino game is now live and accessible worldwide!

**Share your game:**
- Frontend URL: `https://noufi-frontend.onrender.com`
- Backend API: `https://noufi-backend.onrender.com`

**Next steps:**
- Add real money payment integration
- Implement leaderboards
- Add tournaments
- Mobile app version
- Custom domain

Happy gaming! 🎰✨
