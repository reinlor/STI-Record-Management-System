const { admin } = require('./firebase');

const verificationCache = new Map();
const roleCache = new Map();
const CACHE_TTL_MS = 60 * 1000;

function getCached(cache, key) {
    const entry = cache.get(key);
    if (!entry || entry.expiresAt <= Date.now()) {
        cache.delete(key);
        return null;
    }
    return entry.value;
}

function setCached(cache, key, value, ttl = CACHE_TTL_MS) {
    cache.set(key, { value, expiresAt: Date.now() + ttl });
    return value;
}

async function verifyToken(token, isSessionCookie) {
    const cacheKey = `${isSessionCookie ? 'session' : 'id'}:${token}`;
    const cached = getCached(verificationCache, cacheKey);
    if (cached) return cached;

    const decoded = isSessionCookie
        ? await admin.auth().verifySessionCookie(token, true)
        : await admin.auth().verifyIdToken(token, true);

    const tokenTtl = decoded.exp
        ? Math.max(1000, decoded.exp * 1000 - Date.now())
        : CACHE_TTL_MS;
    return setCached(verificationCache, cacheKey, decoded, Math.min(CACHE_TTL_MS, tokenTtl));
}

async function resolveRole(decoded) {
    const claimRole = decoded.role || decoded.customClaims?.role;
    if (claimRole) return claimRole;

    const cachedRole = getCached(roleCache, decoded.uid);
    if (cachedRole) return cachedRole;

    const snapshot = await admin.firestore().collection('users').doc(decoded.uid).get();
    const role = snapshot.exists ? snapshot.data().role : undefined;
    if (role) setCached(roleCache, decoded.uid, role);
    return role;
}

module.exports = async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && /^Bearer\s+\S+$/i.test(authHeader)
        ? authHeader.replace(/^Bearer\s+/i, '')
        : null;
    const sessionCookie = req.cookies && (req.cookies.__session || req.cookies.session);

    if (!bearerToken && !sessionCookie) {
        return res.status(401).json({ error: 'Authentication required', status: 401 });
    }

    try {
        const decoded = await verifyToken(bearerToken || sessionCookie, !bearerToken);
        decoded.role = await resolveRole(decoded);
        req.user = decoded;
        return next();
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('Auth verification failed:', error.message);
        }
        return res.status(401).json({ error: 'Authentication required', status: 401 });
    }
};

module.exports.clearAuthCache = () => {
    verificationCache.clear();
    roleCache.clear();
};