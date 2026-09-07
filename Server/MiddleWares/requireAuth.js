// Server/MiddleWares/requireAuth.js
const { supabaseAdmin } = require('../Config/supabase'); // Make sure supabase.js is also using module.exports!

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or malformed authorization header.' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token securely with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired session token.' });
    }

    // Attach verified user to the request so controllers can use it
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Internal authentication error.' });
  }
};

module.exports = { requireAuth };