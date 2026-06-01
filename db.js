/**
 * Tooleefy - Hostinger DB Connection Helper
 * This file is created according to your hosting guidelines to establish and test
 * the Supabase integration on the root level.
 */

// Load environment variables dynamically from .env or Hostinger platform variables
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Support both server-side keys & client-prefixed fallback configurations
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy-anon-key";

// Initialize the Supabase Client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Verification helper to test real-time connection from Hostinger node server
 */
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('user_activities') // Replaced 'your_table' with 'user_activities' from your Supabase project
      .select('*')
      .limit(1);

    if (error) {
      // Try fallback to standard 'activities' table
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('activities')
        .select('*')
        .limit(1);

      if (fallbackError) {
        throw new Error(`Database connection failed: ${error.message} (Fallback: ${fallbackError.message})`);
      }
      return { success: true, message: "Successfully connected to standard activities table", sample: fallbackData };
    }
    return { success: true, message: "Successfully connected to user_activities table", sample: data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

module.exports = {
  supabase,
  testConnection
};
