// all logic to connect to redis/postgres and broker info between the two of them

const keys = require('./keys');

// Express app setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// create new express app - this object will receive and respond to any http request coming to/from react app
const app = express();
// cross-origin resource sharing - allows us to make a request from one domain (port in this case, on react app) 
// to a different domain (port that the express API is hosted on)
app.use(cors());
// turns body of post request into a json value that express API can easily work with
app.use(bodyParser.json());

// Create and connect to Postgres client server
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('error', () => console.log('Lost PG connection'));

// anytime we connect to a SQL-like database, need to create a table that will store indices that have been submitted
// 'number' here in the query method is the index user submits
pgClient
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err => console.log(err));

// redis client setup
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
// making duplicate connections because according to redis docs, if we ever have a client that is listening or publishing info
// it can't be used for other purposes
const redisPublisher = redisClient.duplicate();

// express route handlers
app.get('/', (req, res) => {
    res.send('Hi');
})

// retrieves all values (indices) ever submitted to postgres, paths don't have /api at the front since nginx server
// chops it off before sending to express server
app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * FROM values');

    // ensures we only send back the values, not any other info tied with the sql query (how long it took, etc)
    res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
    // reach into redis and retrieve all indices and values that have been calculated for each one
    // have to use a callback here rather than async/await because nodejs redis client doesn't have out of the box
    // promise support
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

// takes user input index/value and sends it to postgres
app.post('/values', async (req, res) => {
    const index = req.body.index;

    // caps number the user can submit
    if (parseInt(index) > 40) {
        return res.status(422).send('Index too high');
    }

    redisClient.hset('values', index, 'Nothing yet!');
    // wakes up worker process and puts it to work
    redisPublisher.publish('insert', index);
    // takes submitted index and permanent store in postgres
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
    
    res.send({ working: true});
})

app.listen(5000, err => {
    console.log('Listening on port 5000');
})