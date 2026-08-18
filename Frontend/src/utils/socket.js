/**
 * Planova - Shared Socket.io client utility.
 *
 * Provides a single, consistent Socket.io connection for the whole app.
 * Uses the application's existing Socket.io backend (backend/src/sockets/index.js)
 * and the authenticated `accessToken` from localStorage.
 *
 * If `socket.io-client` is not installed, or the connection fails, this
 * module degrades gracefully to a null socket so pages never crash.
 */

let socket = null;
let socketPromise = null;

/**
 * Lazily create a single shared Socket.io connection.
 * Reuses the existing connection if one already exists.
 *
 * @returns {Promise<object|null>} the socket instance, or null if unavailable
 */
export async function getSocket() {
  if (socket) return socket;

  if (socketPromise) return socketPromise;

  socketPromise = (async () => {
    let io = null;
    try {
      // Dynamic import keeps the app buildable even if the dependency is
      // not yet installed (it becomes a code-split chunk loaded on demand).
      const mod = await import('socket.io-client');
      io = mod.default || mod.io;
    } catch (e) {
      // socket.io-client not installed / failed to load — no realtime.
      return null;
    }

    if (!io) return null;

    const token = localStorage.getItem('accessToken');
    const baseUrl =
      (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(
        '/api/v1',
        ''
      ) || 'http://localhost:5000';

    try {
      socket = io(baseUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });
    } catch (e) {
      return null;
    }

    socket.on('disconnect', () => {
      // Allow a fresh connection next time getSocket() is called.
      socket = null;
      socketPromise = null;
    });

    return socket;
  })();

  try {
    return await socketPromise;
  } catch (e) {
    socket = null;
    socketPromise = null;
    return null;
  }
}

/**
 * Disconnect the shared socket (e.g. on logout).
 */
export function disconnectSocket() {
  if (socket) {
    try {
      socket.disconnect();
    } catch (e) {
      // ignore
    }
  }
  socket = null;
  socketPromise = null;
}
