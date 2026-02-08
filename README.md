
# Noufi
=======
# 🎰 NOUFI - Premium Online Card Game

A luxury casino-style card game built with Node.js, Express, Socket.io, and MongoDB. Players compete in real-time matches where the closest hand to 9 wins!

## 🎮 Game Rules

- **3 cards** are dealt to each player
- **Closest to 9 wins** the pot
- **Card values:**
  - 10, J, Q, K = 0 (ones digit)
  - Ace = 1
  - 2-9 = face value
  - Sum is taken as ones digit only (13 → 3, 25 → 5)

- **Matchmaking:**
  - Players select bet amount: $10, $50, $100, $500, or $1000
  - Matched with another player betting the same amount
  - If no match found within 20 seconds, paired with House Bot
  - Bot has 65% win rate, Player has 35% win rate vs Bot
  - PvP matches are true 50/50

## 📁 Project Structure

```
noufi-game/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   └── authController.js    # Authentication logic
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── User.js              # User schema
│   │   └── Game.js              # Game schema
│   ├── routes/
│   │   └── auth.js              # Auth routes
│   ├── services/
│   │   ├── gameEngine.js        # Core game logic
│   │   ├── matchmaking.js       # Queue & matchmaking
│   │   └── socketHandler.js     # Socket.io event handlers
│   ├── .env                     # Environment variables
│   ├── .env.example             # Environment template
│   ├── package.json             # Dependencies
│   └── server.js                # Main server file
│
└── frontend/
    ├── public/
    │   ├── assets/
    │   │   ├── images/          # Images & avatars
    │   │   ├── sounds/          # Sound effects & music
    │   │   └── cards/           # Card graphics
    │   ├── css/
    │   │   ├── main.css         # Global styles
    │   │   ├── auth.css         # Login/Register styles
    │   │   ├── lobby.css        # Lobby styles
    │   │   └── game.css         # Game table styles
    │   ├── js/
    │   │   ├── config.js        # Configuration
    │   │   ├── auth.js          # Authentication
    │   │   ├── lobby.js         # Lobby logic
    │   │   ├── game.js          # Game logic
    │   │   ├── audio.js         # Audio manager
    │   │   ├── animations.js    # Animations
    │   │   └── app.js           # Main app initialization
    │   └── index.html           # Main HTML file
    └── package.json             # Frontend dependencies
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd noufi-game
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env and add your MongoDB URI and JWT secret
```

4. **Start MongoDB:**
```bash
# If using local MongoDB
mongod

# If using MongoDB Atlas, just ensure your connection string is in .env
```

5. **Start the backend server:**
```bash
npm start
# Or for development with auto-reload:
npm run dev
```

6. **Start the frontend:**
```bash
cd ../frontend/public
# Simple HTTP server (Python):
python3 -m http.server 8080

# Or using Node:
npx serve -p 8080
```

7. **Access the game:**
```
http://localhost:8080
```

## 🌐 Deployment to Render.com

### Backend Deployment

1. **Create a new Web Service on Render:**
   - Connect your GitHub repository
   - Select `backend` as root directory
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Add Environment Variables:**
   ```
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   JWT_EXPIRE=7d
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```

3. **Create MongoDB Atlas Database:**
   - Go to mongodb.com/cloud/atlas
   - Create a free cluster
   - Get connection string
   - Add to Render environment variables

### Frontend Deployment

1. **Create a new Static Site on Render:**
   - Connect your GitHub repository
   - Select `frontend/public` as publish directory
   - Build Command: (leave empty)

2. **Update frontend config:**
   - Edit `frontend/public/js/config.js`
   - Update `API_URL` and `SOCKET_URL` to your backend Render URL

3. **Deploy:**
   - Render will automatically deploy on push to main branch

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/noufi-game
JWT_SECRET=your-secret-key-minimum-32-characters
JWT_EXPIRE=7d
DEFAULT_STARTING_BALANCE=1000
BOT_WIN_RATE=0.65
MATCHMAKING_TIMEOUT=20000
FRONTEND_URL=https://your-frontend.onrender.com
```

### Game Configuration

Edit `frontend/public/js/config.js` to customize:
- API endpoints
- Bet amounts
- Matchmaking timeout
- Sound settings

## 🎨 Customization

### Adding Music

1. Place MP3 files in `frontend/public/assets/sounds/`
2. Update playlist in `frontend/public/js/audio.js`:
```javascript
this.playlist = [
    { title: 'Song 1', url: 'assets/sounds/song1.mp3' },
    { title: 'Song 2', url: 'assets/sounds/song2.mp3' }
];
```

### Changing Bet Amounts

1. Update `CONFIG.BET_AMOUNTS` in `frontend/public/js/config.js`
2. Update HTML in `frontend/public/index.html` to add/remove bet buttons

### Styling

All styles are in `frontend/public/css/`:
- `main.css` - Global styles and variables
- `auth.css` - Login/register screen
- `lobby.css` - Lobby and bet selection
- `game.css` - Game table and cards

CSS variables in `:root` for easy theme customization.

## 🔐 Security Features

- JWT authentication
- Password hashing with bcrypt
- Input validation
- Rate limiting
- CORS protection
- Helmet security headers
- Server-side card dealing (anti-cheat)
- Secure random number generation

## 📊 Database Schema

### User Model
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  balance: Number,
  wins: Number,
  losses: Number,
  totalGamesPlayed: Number,
  gameHistory: Array,
  isOnline: Boolean,
  createdAt: Date
}
```

### Game Model
```javascript
{
  gameId: String,
  player1: Object,
  player2: Object,
  betAmount: Number,
  potAmount: Number,
  winner: String,
  gameState: String,
  completedAt: Date
}
```

## 🎯 Future Enhancements

- [ ] Real money integration (Stripe/PayPal)
- [ ] Tournament mode
- [ ] Leaderboards
- [ ] Chat system
- [ ] Daily bonuses
- [ ] VIP levels
- [ ] Mobile app (React Native)
- [ ] Admin dashboard
- [ ] Game history viewer
- [ ] Friend system
- [ ] Achievements

## 🐛 Troubleshooting

### MongoDB Connection Error
- Verify MongoDB is running
- Check connection string in .env
- Whitelist your IP in MongoDB Atlas

### Socket.io Connection Failed
- Ensure backend server is running
- Check CORS settings
- Verify frontend URL in backend .env

### Cards Not Displaying
- Check browser console for errors
- Verify all CSS files are loaded
- Clear browser cache

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user (protected)

### Socket Events

**Client → Server:**
- `join_queue` - Join matchmaking queue
- `leave_queue` - Leave queue
- `rematch_request` - Request rematch
- `return_to_lobby` - Return to lobby

**Server → Client:**
- `queue_joined` - Queue confirmation
- `match_found` - Match found
- `game_dealing` - Cards being dealt
- `card_reveal` - Reveal cards one by one
- `game_result` - Game outcome
- `opponent_disconnected` - Opponent left

## 📜 License

MIT License - Feel free to use for personal or commercial projects

## 👥 Support

For issues or questions:
- Create a GitHub issue
- Contact: support@yourdomain.com

## 🙏 Credits

- Built with Node.js, Express, Socket.io, MongoDB
- Fonts: Google Fonts (Cinzel, Playfair Display, Montserrat)
- Icons: Font Awesome (if used)
- Music: Tunisian artists (add proper credits)

---

**Enjoy the game and may luck be on your side!** 🎰✨

