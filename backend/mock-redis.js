/**
 * Mock Redis Server
 * Minimal Redis server that accepts connections and responds to basic commands
 * This is used to allow the backend to start without a real Redis instance
 */

const net = require('net');

const server = net.createServer((socket) => {
  console.log('Mock Redis: Client connected');
  
  // Send welcome message on connection (Redis protocol)
  socket.write('+OK\r\n');
  
  socket.on('error', (err) => {
    console.log('Mock Redis: Socket error:', err.message);
  });
  
  // Handle Redis commands
  socket.on('data', (data) => {
    const cmd = data.toString().trim().toUpperCase();
    console.log('Mock Redis: Received:', cmd);
    
    if (cmd.includes('PING')) {
      socket.write('+PONG\r\n');
    } else if (cmd.includes('QUIT')) {
      socket.write('+OK\r\n');
      socket.end();
    } else if (cmd.includes('AUTH')) {
      socket.write('+OK\r\n');
    } else if (cmd.includes('HELLO') || cmd.includes('PROTOCOL')) {
      socket.write('+OK\r\n');
    } else if (cmd.includes('SET')) {
      socket.write('+OK\r\n');
    } else if (cmd.includes('GET')) {
      socket.write('$-1\r\n');
    } else if (cmd.includes('DEL')) {
      socket.write(':0\r\n');
    } else if (cmd.includes('KEYS')) {
      socket.write('*0\r\n');
    } else if (cmd.includes('SELECT')) {
      socket.write('+OK\r\n');
    } else {
      socket.write('+OK\r\n');
    }
  });
  
  socket.on('close', () => {
    console.log('Mock Redis: Client disconnected');
  });
});

const PORT = 6379;
server.listen(PORT, () => {
  console.log(`Mock Redis server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('Redis port already in use - real Redis may be running');
  } else {
    console.error('Mock Redis server error:', err);
  }
});

