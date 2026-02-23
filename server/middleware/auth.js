/**
 * Simple token-based auth middleware for pilot self-serve access.
 *
 * Modes:
 *   - "admin"    : Full read/write (you, the insights team)
 *   - "viewer"   : Read-only (pilot users: PMs, design leads)
 *   - "disabled" : No auth required (default, for local dev)
 *
 * Set in .env:
 *   AUTH_MODE=token            # Enable auth (or "disabled" to skip)
 *   AUTH_ADMIN_TOKEN=xxx       # Token for admin access
 *   AUTH_VIEWER_TOKEN=yyy      # Token for viewer (read-only) access
 *
 * Usage:
 *   Pass token via header: Authorization: Bearer <token>
 *   Or via query param:    ?token=<token>
 */

export function authMiddleware(req, res, next) {
  const authMode = process.env.AUTH_MODE || 'disabled';

  if (authMode === 'disabled') {
    req.userRole = 'admin';
    return next();
  }

  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Provide a token via Authorization header or ?token= query param',
    });
  }

  const adminToken = process.env.AUTH_ADMIN_TOKEN;
  const viewerToken = process.env.AUTH_VIEWER_TOKEN;

  if (adminToken && token === adminToken) {
    req.userRole = 'admin';
    return next();
  }

  if (viewerToken && token === viewerToken) {
    req.userRole = 'viewer';
    return next();
  }

  return res.status(403).json({ error: 'Invalid token' });
}

/**
 * Middleware that blocks write operations for viewer role.
 * Apply to POST/PUT/DELETE routes that should be admin-only.
 */
export function adminOnly(req, res, next) {
  if (req.userRole === 'admin') {
    return next();
  }
  return res.status(403).json({
    error: 'Admin access required',
    message: 'This operation is not available in read-only mode',
  });
}

/**
 * Attach role info to API responses so the UI can adapt.
 */
export function roleInfoEndpoint(req, res) {
  res.json({
    role: req.userRole || 'admin',
    authMode: process.env.AUTH_MODE || 'disabled',
  });
}

function extractToken(req) {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  // Check query param
  if (req.query.token) {
    return req.query.token;
  }
  return null;
}
