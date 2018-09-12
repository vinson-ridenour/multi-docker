// will connect to running instance of redis and postgres - these need to be passed into server container when executed
module.exports = {
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT,
    // postgres user that we'll be logging in as
    pgUser: process.env.PGUSER,
    pgHost: process.env.PGHOST,
    // name of DB inside postgres we're gonna connect to
    pgDatabase: process.env.PGDATABASE,
    pgPassword: process.env.PGPASSWORD,
    pgPort: process.env.PGPORT
};