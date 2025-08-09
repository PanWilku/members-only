const express = require('express');
const path = require('path');
const app = express();
const indexRouter = require('./routes/indexRoute').indexRouter;

//this makes public folder to serve files to the browser without any route
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));




app.get('/', indexRouter);


//write an error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(`Something broke: ${err.stack}`);
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});