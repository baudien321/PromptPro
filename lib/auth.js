import { getToken } from "next-auth/jwt";

/**
 * Check if the request is authenticated
 * @param {Object} req - The request object
 * @returns {Promise<Object|null>} - The user session or null if not authenticated
 */
export async function getAuthSession(req) {
  return await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
}

/**
 * Higher-order function that creates an API handler that requires authentication
 * @param {Function} handler - The API handler to protect
 * @returns {Function} - The protected API handler
 */
export function withAuth(handler) {
  return async (req, res) => {
    const session = await getAuthSession(req);
    
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    // Add the session to the request object
    req.session = session;
    
    // Call the original handler
    return handler(req, res);
  };
}

/**
 * Higher-order function that optionally requires authentication for certain methods
 * @param {Function} handler - The API handler 
 * @param {Array} protectedMethods - HTTP methods that require authentication (e.g., ['POST', 'PUT', 'DELETE'])
 * @returns {Function} - The conditionally protected API handler
 */
export function withAuthForMethods(handler, protectedMethods = ['POST', 'PUT', 'DELETE']) {
  return async (req, res) => {
    // Check if the current method requires authentication
    if (protectedMethods.includes(req.method)) {
      const session = await getAuthSession(req);
      
      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Add the session to the request object
      req.session = session;
    }
    
    // Call the original handler
    return handler(req, res);
  };
}