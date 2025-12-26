# Personal Finance Tracker - Backend API

A RESTful API backend for a personal finance tracking application built with Express, TypeScript, and Supabase.

## Features

- **User Authentication**: JWT-based authentication with Supabase Auth
  - Sign up with email confirmation
  - Login/logout
  - Protected routes with authentication middleware

- **Transaction Management**: Full CRUD operations for financial transactions
  - Create income/expense transactions
  - View all user transactions
  - Delete transactions
  - Automatic user isolation (users can only see their own data)

- **Database**: PostgreSQL via Supabase with Row Level Security support

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth (JWT)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get current user info

### Transactions (Protected)
- `GET /api/transactions` - Get all user transactions
- `POST /api/transactions` - Create new transaction
- `DELETE /api/transactions/:id` - Delete transaction

See [FRONTEND_GUIDE.md](FRONTEND_GUIDE.md) for detailed API documentation.

## Local Development

### Prerequisites
- Node.js 18+ installed
- Supabase account and project

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/krishsoniii999/personal-finance-backend.git
   cd personal-finance-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   PORT=3001
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**

   Run the SQL in `database-setup.sql` in your Supabase SQL Editor to create the necessary tables.

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3001`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server

## Deployment to Render

### Step 1: Prepare Your Render Account
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" and select "Web Service"
3. Connect your GitHub account and select this repository

### Step 2: Configure the Web Service

**Basic Settings:**
- **Name**: `personal-finance-backend` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Leave blank
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Instance Type:**
- Select "Free" for testing (or paid plan for production)

### Step 3: Add Environment Variables

In the Render dashboard, add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_VERSION` | `18` |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `PORT` | `3001` (Render will override this automatically) |

**Where to find Supabase credentials:**
1. Go to your Supabase project dashboard
2. Click "Settings" → "API"
3. Copy the "URL" and "anon/public" key

### Step 4: Deploy

1. Click "Create Web Service"
2. Render will automatically deploy your app
3. Wait for the build to complete (2-3 minutes)
4. Your API will be live at the provided URL (e.g., `https://personal-finance-backend.onrender.com`)

### Step 5: Test Your Deployment

Test the health endpoint:
```bash
curl https://your-app.onrender.com/health
```

You should get:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-25T..."
}
```

### Important Notes for Render Deployment

1. **Free Tier Limitations**:
   - Service spins down after 15 minutes of inactivity
   - First request after inactivity may take 30-60 seconds (cold start)
   - Sufficient for development/testing

2. **Environment Variables**:
   - Never commit `.env` file to git (it's in `.gitignore`)
   - Always set environment variables in Render dashboard
   - Render automatically provides `PORT` - your app will use it

3. **CORS Configuration**:
   - Current setup allows all origins (`cors()`)
   - For production, update to specific frontend URL in `src/index.ts`:
   ```typescript
   app.use(cors({
     origin: 'https://your-frontend-url.com'
   }));
   ```

4. **Database**:
   - Make sure your Supabase database is set up with the schema from `database-setup.sql`
   - RLS is currently disabled for development - enable it for production

## Project Structure

```
personal-finance-backend/
├── src/
│   ├── index.ts                 # Main server entry point
│   ├── supabaseClient.ts        # Supabase client configuration
│   ├── middleware/
│   │   └── auth.ts              # Authentication middleware
│   └── routes/
│       ├── auth.ts              # Authentication routes
│       └── transactions.ts      # Transaction routes
├── database-setup.sql           # Database schema
├── FRONTEND_GUIDE.md           # Frontend integration guide
├── .env                        # Environment variables (local only)
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

## Security Notes

- JWT tokens are used for authentication
- Passwords are hashed by Supabase Auth
- User data isolation at the database query level
- RLS (Row Level Security) available in schema (currently disabled)
- Environment variables protect sensitive credentials

## Frontend Integration

See [FRONTEND_GUIDE.md](FRONTEND_GUIDE.md) for complete documentation on building a frontend that connects to this API.

## License

MIT

## Author

Built by Krish Soni with Claude Code
