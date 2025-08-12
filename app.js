const express = require('express');
const path = require('path');
const app = express();
const indexRouter = require('./routes/indexRoute').indexRouter;
const signUpRouter = require('./routes/sign-upRoute').signUpRouter;
const { dashboardRouter } = require('./routes/dashboardRoute');
const { authRouter } = require('./routes/authRoute');
const { createClubRouter } = require('./routes/createClubRoute');
const { logInRouter } = require('./routes/log-inRoute');
const { viewClubRouter } = require('./routes/viewClubRoute');
const { joinClubRouter } = require('./routes/joinClubRoute');
const { leaveClubRouter } = require('./routes/leaveClubRoute');
const { deleteClubRouter } = require('./routes/deleteClubRoute');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('passport');
require('./config/passport')(passport); // the passport instance is passed to the passport.js. This is how we configure passport with our local strategy and session management.



app.set('trust proxy', 1); //used if deployed through proxy like railway

app.use(session({
  store: new pgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'session',
    createTableIfMissing: true, //table name for storing sessions
  }),
  secret: process.env.SESSION_SECRET || 'default_secret', //secret for signing the session ID cookie
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 //1 day
  }
}));

app.use(passport.initialize()); 
app.use(passport.session()); 

// make user available in EJS
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});



//this makes public folder to serve files to the browser without any route
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));




app.use('/', indexRouter);
app.use('/sign-up', signUpRouter);
app.use('/dashboard', dashboardRouter);
app.use('/create-club', createClubRouter);
app.use('/log-in', logInRouter);
app.use('/club/', viewClubRouter)
app.use('/join-club', joinClubRouter);
app.use('/leave-club', leaveClubRouter)
app.use('/delete-club', deleteClubRouter);

app.use(authRouter);


//write an error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(`Something broke: ${err.stack}`);
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});