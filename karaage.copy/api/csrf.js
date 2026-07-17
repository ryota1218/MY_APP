const crypto = require('crypto');
const cookie = require('cookie');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    // 既存のトークンがあれば再利用、なければ新規作成
    let token = req.cookies && req.cookies['csrf_token'];
    
    if (!token || token.length < 32) {
      token = crypto.randomBytes(32).toString('hex');
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 1週間
      };
      res.setHeader('Set-Cookie', cookie.serialize('csrf_token', token, cookieOptions));
    }
    
    return res.status(200).json({ csrfToken: token });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};
