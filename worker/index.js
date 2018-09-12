// ./keys file will contain the hostname and port for connecting to Redis
const keys = require('./keys');
// import a redis client
const redis = require('redis');

// create a redis client
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    // tells redis client that if it ever loses connection to redis server, should automatically try to reconnect
    // every 1s
    retry_strategy: () => 1000
});

// subscription to watch for new value
const sub = redisClient.duplicate();

function fib(index) {
    // if index less than 2, return value of 1
    if (index < 2) return 1;
    // otherwise return previous values added together - recursive solution (kinda slow)
    return fib(index - 1) + fib(index - 2);
}

sub.on('message', (channel, message) => {
    // hset = hash of values
    redisClient.hset('values', message, fib(parseInt(message)));
});

sub.subscribe('insert')

