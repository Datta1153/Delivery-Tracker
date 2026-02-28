import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Error handling
    socket.on('connect_error', (error) => {
      console.debug('Socket connection error (expected on non-auth pages):', error.message);
    });

    socket.on('error', (error) => {
      console.debug('Socket error:', error);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const joinUserRoom = (userId) => {
  const sock = getSocket();
  if (sock && sock.connected) {
    sock.emit('join-user', userId);
  }
};

export const emitPackageUpdate = (packageId, status, location, userId) => {
  const sock = getSocket();
  if (sock && sock.connected) {
    sock.emit('package-update', { packageId, status, location, userId });
  }
};

export const onPackageUpdated = (callback) => {
  const sock = getSocket();
  sock.on('package-updated', callback);
};

export const offPackageUpdated = () => {
  const sock = getSocket();
  sock.off('package-updated');
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
