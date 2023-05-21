const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require("express-session");
const mongoose = require('mongoose');
const indexRouter = require('./routes/index');
const notificationRouter = require('./routes/notification');
const authRouter = require('./routes/auth');
const User = require('./Model/User');

const testingRoutes = require('./routes/testing');
const { Server } = require('http');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: "Lets make a swapha Sessions start from here.",
    resave: true,
    saveUninitialized: false
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.session.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/', indexRouter);
app.use('/api/notification', notificationRouter);
app.use('/api/auth', authRouter);
app.use(testingRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const MONGODB_URI =
  'mongodb+srv://swapha-app:YGzPJW1MV4AMNZ97@cluster0.h3wkjeo.mongodb.net/test';
const port = process.env.PORT || 8000;
mongoose
  .connect(MONGODB_URI)
  .then(result => {
    console.log('mongoDb connected');
  })
  .catch(err => {
    console.log(err);
  });

const server = app.listen(port, () => {
  console.log('connected on port ' + port);
})

const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: 'http://localhost:3000'
  }
})

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  })

  socket.on("join", (room) => {
    socket.join(room);
  })

  socket.on("Send Swap Request", (message) => {
    socket.in(message.to).emit("Receive Message", message);
  })

  socket.on("Send Buy Request", (message) => {
    socket.in(message.to).emit("Receive Message", message);
  })

  socket.on("send Acceptance", (message) => {
    socket.in(message.to).emit("Receive Message", message);
  })

  socket.on("send Rejection", (message) => {
    socket.in(message.to).emit("Receive Message", message);
  })

  socket.on("send Message", (message) => {
    socket.in(message.to).emit("Receive Message", message);
  })

  socket.on("send Finalize Request", (message) => {
    socket.in(message.to).emit("Receive Message", message);
  })

})
