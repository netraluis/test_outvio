exports.rateRestrictionInjection = (req, res, next) => {
  
  const { ip, originalUrl, method } = req;

  const limiterPerUserRoute = process.env.RATE_LIMIT_PER_USER_PER_ROUTE.split('|').reduce(
    (accumulator, value, index) => {

      const values = value.split(' ');
      const objectValue = {
        ip: values[0],
        path: values[1],
        method: values[2],
        rateLimit: values[3]
      };
      accumulator.push(objectValue);
      return accumulator;
    },
    []
  );

  const limiterFind = limiterPerUserRoute.find(limiter => {
    return limiter.ip === ip && limiter.path === originalUrl && limiter.method === method;
  });

  req.maxWindowsRequestCount = limiterFind ? limiterFind.rateLimit : process.env.DEFAULT_RATE_LIMIT;

  req.blockedIPs = process.env.BLOCK_IPS.split(' ');
  next();
};
