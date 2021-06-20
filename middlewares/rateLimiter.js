
const redis = require('redis');

const redisClient = redis.createClient();


exports.customRedisRateLimiter = (req, res, next) => {
  const WINDOW_SIZE_IN_HOURS = Number(process.env.DEFAULT_WINDOW_SIZE_IN_HOURS);
  const MAX_WINDOW_REQUEST_COUNT = Number(req.maxWindowsRequestCount);

  const reference = `${req.ip}${req.originalUrl}${req.method}`;

  try {
    // check that redis client exists
    if (!redisClient) {
      throw new Error('Redis client does not exist!');
      process.exit(1);
    }
    // fetch records of current user using IP address, returns null when no record is found
    redisClient.get(reference, (err, record) => {
      if (err) throw err;
      const currentRequestTime = new Date();
      //  if no record is found , create a new record for user and store to redis
      if (record == null) {
        const newRecord = [];
        const requestLog = {
          requestTimeStamp: currentRequestTime.getTime() / 1000,
          requestCount: 1
        };
        newRecord.push(requestLog);
        redisClient.set(reference, JSON.stringify(newRecord));
        return next();
      }

      // if record is found, parse it's value and calculate number of requests users has made wirhin the last window
      const data = JSON.parse(record);

      const windowStartTimestamp = (new Date().getTime() - WINDOW_SIZE_IN_HOURS * 60 * 60 * 1000) / 1000;

      const requestsWithinWindow = data.filter(entry => {
        // pasan las request guardadas que estan en nuestra franja pasada
        return entry.requestTimeStamp > windowStartTimestamp;
      });

      const totalWindowRequestsCount = requestsWithinWindow.reduce((accumulator, entry) => {
        return accumulator + entry.requestCount;
      }, 0);

      // if number of requests made is greater than or equal to the desired maximum, return error
      if (totalWindowRequestsCount >= MAX_WINDOW_REQUEST_COUNT) {
        const timeToRestart = (requestsWithinWindow[0].requestTimeStamp - windowStartTimestamp) / 3600;
        res
          .status(429)
          .json({
            response: `You have exceeded the ${MAX_WINDOW_REQUEST_COUNT} requests in ${WINDOW_SIZE_IN_HOURS} hrs limit. You have to wait ${timeToRestart} hrs`
          });
      } else {
        // if number of requests made is lesser than allowed maximum, log new entry
        const lastRequestLog = data[data.length - 1];
        const potentialCurrentWindowIntervalStartTimeStamp =
          (currentRequestTime.getTime() - WINDOW_SIZE_IN_HOURS * 60 * 60 * 1000) / 1000;
          
        //  if interval has not passed since last request log, increment counter
        if (lastRequestLog.requestTimeStamp > potentialCurrentWindowIntervalStartTimeStamp) {
          lastRequestLog.requestCount++;
          data[data.length - 1] = lastRequestLog;
        } else {
          //  if interval has passed, log new entry for current user and timestamp
          data.push({
            requestTimeStamp: currentRequestTime.getTime() / 1000,
            requestCount: 1
          });
        }
        redisClient.set(reference, JSON.stringify(data));
        next();
      }
    });
  } catch (error) {
    next(error);
  }
};
