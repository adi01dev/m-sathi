
# Mental Health Mirror - Backend API

This is the backend API for the Mental Health Mirror application, a mental wellness platform designed to help users track, understand, and improve their emotional well-being through AI-powered voice journaling, personalized recommendations, and community support.

## Setup Instructions

1. Install dependencies:
```
npm install
```

2. Create a `.env` file in the root directory based on the `.env.example` file.

3. Start the development server:
```
npm run dev
```

4. Seed the database with initial data:
```
node seeder.js
```

To remove all data:
```
node seeder.js -d
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### User
- `GET /api/users/streak` - Get user streak
- `POST /api/users/streak` - Update user streak

### Mood
- `POST /api/moods` - Record a new mood entry
- `GET /api/moods/history` - Get mood history
- `POST /api/moods/analyze` - Analyze sentiment from voice recording

### Recommendations
- `GET /api/recommendations` - Get recommendations based on mood
- `POST /api/recommendations/:id/complete` - Mark recommendation as completed

### Community
- `GET /api/community/groups` - Get all community groups
- `POST /api/community/groups/:id/join` - Join a community group
- `GET /api/community/groups/:id/messages` - Get messages for a group
- `POST /api/community/messages` - Send a message to a group

### Reports
- `POST /api/reports/generate` - Generate a weekly report
- `GET /api/reports` - Get user's reports

### Rewards
- `GET /api/rewards/tokens` - Get token balance
- `POST /api/rewards/redeem` - Redeem tokens for rewards

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development, production)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT token generation
- `JWT_EXPIRES_IN` - JWT token expiration (e.g., "7d")
- `OPENAI_API_KEY` - OpenAI API key for voice analysis
- `SPOTIFY_CLIENT_ID` - Spotify API client ID
- `SPOTIFY_CLIENT_SECRET` - Spotify API client secret
- `YOUTUBE_API_KEY` - YouTube Data API key
