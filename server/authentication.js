const { admin } = require('./firebase');

module.exports = async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies && (req.cookies.__session || req.cookies.session || req.cookies.token);
    const queryToken = req.query && req.query.token;
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : (cookieToken || queryToken);

    if (!token) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('Auth: no token. Headers present:', Object.keys(req.headers));
        }
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decoded = await admin.auth().verifyIdToken(token);
        req.user = decoded;
        return next();
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Auth verify failed:', err && err.message);
        }
        return res.status(401).json({ error: 'Authentication required' });
    }
};