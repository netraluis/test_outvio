const express = require('express');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/error.controller');
const userRouter = require('./routes/userRoutes');
const booksRouter = require('./routes/booksRoute');
const { customRedisRateLimiter } = require('./middlewares/rateLimiter');
const { ipBlocker } = require('./middlewares/ipBlocker');
const { rateRestrictionInjection } = require('./middlewares/rateRestrictionInjection');


const app = express();
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', `${process.env.URL_ORIGIN}`);
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PATCH, PUT, DELETE');
  next();
});

app.use('/prueba', (req,res,next)=>{
  res.status(200).json({
    status: 'funciona'
  })
})

app.use(rateRestrictionInjection, ipBlocker, customRedisRateLimiter)
app.use('/api/v1/users', userRouter);
app.use('/api/v1/books', booksRouter);

app.use('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
