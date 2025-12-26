// Authentication routes - handles user signup, login, logout
import { Router, Request, Response } from 'express';
import { supabase } from '../supabaseClient';

const router = Router();

// POST /api/auth/signup - Create a new user account
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters'
      });
    }

    // Create the user account using Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Signup error:', error);
      return res.status(400).json({ error: error.message });
    }

    // Return success with user info and session
    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
      session: data.session,
    });
  } catch (err) {
    console.error('Unexpected signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login - Log in an existing user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Return session and user info
    res.json({
      message: 'Logged in successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      session: data.session,
    });
  } catch (err) {
    console.error('Unexpected login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout - Log out the current user
router.post('/logout', async (req: Request, res: Response) => {
  try {
    // Get the access token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // Sign out the user
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ error: 'Failed to logout' });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Unexpected logout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/user - Get current user info
router.get('/user', async (req: Request, res: Response) => {
  try {
    // Get the access token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Get user from token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
      }
    });
  } catch (err) {
    console.error('Unexpected error getting user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
