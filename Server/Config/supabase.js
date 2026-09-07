/**
 * Supabase Server Client
 * Uses service role key for privileged operations
 * NEVER expose this to the client
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Validate environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase admin client (service role)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Create a Supabase client for a specific user (from JWT)
 * Use this when you need RLS to apply for a specific user
 */
const createUserClient = (accessToken) => {
  if (!accessToken) {
    throw new Error('Access token is required to create user client');
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      persistSession: false
    }
  });
};

/**
 * Verify and decode a Supabase JWT token
 * Returns the user object or null if invalid
 */
const verifyToken = async (token) => {
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error) {
      console.error('Token verification error:', error.message);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Token verification exception:', error);
    return null;
  }
};

/**
 * Middleware to extract and verify Supabase auth token
 * Attaches user to req.user
 */
const authenticateUser = async (req, res, next) => {
  try {
    // Extract token from Authorization header or cookie
    let token = null;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    } else if (req.cookies?.supabase_token) {
      token = req.cookies.supabase_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    // Verify token
    const user = await verifyToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Attach user and token to request
    req.user = user;
    req.accessToken = token;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 * Attaches user if valid token exists
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    } else if (req.cookies?.supabase_token) {
      token = req.cookies.supabase_token;
    }

    if (token) {
      const user = await verifyToken(token);
      if (user) {
        req.user = user;
        req.accessToken = token;
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};

module.exports = {
  supabaseAdmin,
  createUserClient,
  verifyToken,
  authenticateUser,
  optionalAuth
};
