# ⚡ Quick Start Guide - Get Noufi Running in 5 Minutes

## 1. Install Node.js
If you don't have Node.js:
- Download from https://nodejs.org (LTS version)
- Install it

## 2. Install MongoDB
Choose one:

**Option A: Local MongoDB (Recommended for development)**
- Download from https://www.mongodb.com/try/download/community
- Install and start MongoDB service

**Option B: MongoDB Atlas (Cloud - Free)**
- Go to https://www.mongodb.com/cloud/atlas
- Create free account
- Create cluster
- Get connection string

## 3. Clone and Setup

```bash
# Navigate to where you want the project
cd your-projects-folder

# If you have the zip file, extract it
unzip noufi-game.zip
cd noufi-game

# Install backend dependencies
cd backend
npm install

# Go back to root
cd ..
```

## 4. Configure Environment

```bash
# Edit backend/.env file
# Change MONGODB_URI to your MongoDB connection string
# If using local MongoDB, the default is fine:
# MONGODB_URI=mongodb://localhost:27017/noufi-game

# If using MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/noufi-game
```

## 5. Start Everything

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

You should see:
```
🎰 NOUFI GAME SERVER 🎰
Status: ✅ Running
Port: 3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend/public
python3 -m http.server 8080
```

If Python doesn't work, use:
```bash
npx serve -p 8080
```

## 6. Open Game

Open browser and go to:
```
http://localhost:8080
```

## 7. Play!

1. Click "Create Account"
2. Enter username, email, password
3. Select a bet amount
4. Click PLAY
5. Wait 20 seconds (you'll be matched with a bot)
6. Cards will be dealt automatically
7. Winner is announced!

---

## Troubleshooting

### "MongoDB connection error"
- Make sure MongoDB is running
- Check your connection string in .env

### "Cannot find module"
- Run `npm install` in backend folder

### "Port 3000 already in use"
- Change PORT in backend/.env to different number (like 3001)
- Update API_URL in frontend/public/js/config.js to match

### "Can't access localhost:8080"
- Make sure frontend server is running
- Try http://127.0.0.1:8080 instead

---

## Next Steps

- Read README.md for full documentation
- Read DEPLOYMENT.md to deploy online
- Add your own music files (see assets/README.md)
- Customize the game!

**That's it! You're playing Noufi! 🎰✨**
