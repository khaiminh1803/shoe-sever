const redis = require('redis');

const client = redis.createClient({
  url: 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000), 
  }
});

client.connect().catch(console.error);

client.on('error', (err) => {
  console.log('Redis error: ', err);
});

client.on('connect', () => {
  console.log('Redis client connected');
});

client.on('ready', () => {
  console.log('Redis client ready');
});

client.on('end', () => {
  console.log('Redis client disconnected');
});

client.on('reconnecting', (delay) => {
  console.log(`Redis client reconnecting in ${delay}ms`);
});

module.exports = client;
