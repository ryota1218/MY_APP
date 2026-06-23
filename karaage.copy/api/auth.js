const { supabase } = require('./_utils/supabase');
const cookie = require('cookie');

module.exports = async (req, res) => {
  const { action } = req.query;

  // --- Session (GET) ---
  if (action === 'session' && req.method === 'GET') {
    const token = req.cookies['sb-access-token'];
    if (!token) return res.status(401).json({ error: 'No active session' });
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user) return res.status(401).json({ error: 'Invalid or expired session' });
      return res.status(200).json({ user: data.user });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // --- Login (POST) ---
  if (action === 'login' && req.method === 'POST') {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return res.status(401).json({ error: error.message });

      const token = data.session.access_token;
      const refreshToken = data.session.refresh_token;

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      };

      res.setHeader('Set-Cookie', [
        cookie.serialize('sb-access-token', token, cookieOptions),
        cookie.serialize('sb-refresh-token', refreshToken, cookieOptions)
      ]);

      return res.status(200).json({ user: data.user, message: 'Logged in successfully' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // --- Logout (POST) ---
  if (action === 'logout' && req.method === 'POST') {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0)
    };
    res.setHeader('Set-Cookie', [
      cookie.serialize('sb-access-token', '', cookieOptions),
      cookie.serialize('sb-refresh-token', '', cookieOptions)
    ]);
    return res.status(200).json({ message: 'Logged out successfully' });
  }

  // --- Register (POST) ---
  if (action === 'register' && req.method === 'POST') {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
      
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return res.status(400).json({ error: error.message });

      if (data.session) {
        const token = data.session.access_token;
        const refreshToken = data.session.refresh_token;
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7
        };
        res.setHeader('Set-Cookie', [
          cookie.serialize('sb-access-token', token, cookieOptions),
          cookie.serialize('sb-refresh-token', refreshToken, cookieOptions)
        ]);
      }

      return res.status(200).json({ user: data.user, message: 'Registered successfully' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // --- Update (POST) ---
  if (action === 'update' && req.method === 'POST') {
    const token = req.cookies['sb-access-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Invalid session' });

    const supabaseClient = require('@supabase/supabase-js').createClient(
      process.env.SUPABASE_URL || 'https://ylgumuwmpnnqzrfleyoc.supabase.co',
      process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZ3VtdXdtcG5ucXpyZmxleW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNzA2MjgsImV4cCI6MjA5MTk0NjYyOH0.HP5miiB3Gbjvi0iDKgi9b1kXsf4FaOFY9AUt5fyun5Q',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { password, email, deleteUser } = req.body || {};

    try {
      if (deleteUser) {
        return res.status(501).json({ error: 'アカウント削除機能はサービスロールキーが必要です。Supabase管理画面から実施してください。' });
      }
      if (password) {
        const { error } = await supabaseClient.auth.updateUser({ password });
        if (error) throw error;
        return res.status(200).json({ success: true });
      }
      if (email) {
        const { error } = await supabaseClient.auth.updateUser({ email });
        if (error) throw error;
        return res.status(200).json({ success: true });
      }
      return res.status(400).json({ error: 'No update parameters provided' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: 'Invalid action or method' });
};
