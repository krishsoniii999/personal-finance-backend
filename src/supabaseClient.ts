// Supabase client configuration
// This file creates a connection to your Supabase database

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables first!
dotenv.config();

// Get credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Make sure the environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables! Check your .env file.');
}

// Create and export the Supabase client
// This is what we'll use to interact with the database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
