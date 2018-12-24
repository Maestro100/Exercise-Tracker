const mongoose = require('mongoose');
const express = require('express');
const app = express();
const bodyParser= require('body-parser');
const PORT = 3000;
const path = require('path');
const User = require('./models/userSchema');
const Exercise = require('./models/exerciseSchema');

app.set('view engine', 'pug');
app.use(express.static(__dirname+'public'));

mongoose.connect('mongodb://localhost/Users');
mongoose.connect('mongodb://localhost/Exercises');

const dateToNumber = (date) => {
    if(date) {
      const year = date.slice(0,4);
      const month = date.slice(5,7);
      const day = date.slice(8);
      return Number(year + month + day);
    } else {
      return null;
    }
  }
  
  const dateFromNumber = (date) => {
    let newDate = date.toString();
    const year = newDate.slice(0,4);
    const month = newDate.slice(4,6);
    const day = newDate.slice(6);
    return `${year}-${month}-${day}`;
  }

  app.use(bodyParser.urlencoded({extended: true}));

  app.use('/api/exercise/new-user', (req, res, next) => {
    const username = req.body.username
    User.find({username}, (err, result) => {
      if (err) {
        res.send(err);
      } else {
        if (result.length === 0) {
          next();
        } else {
          res.send('duplicate username not allowed');
        }
      }
    })
  })

  app.use('/api/exercise/log', (req,res,next) => {
    const _id = req.query.userId;
    User.findById({_id}, (err, result) => {
      if(err) {
        res.send('User not found');
      } else {
        next();
      }
    })
  })

  app.get('/', (req,res) => {
    res.render('index');
  })

  app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'favicon.ico'));
  });

  app.get('/api/exercise/log', (req,res) => {
    const userId = req.query.userId
    const from = dateToNumber(req.query.from) || 0;
    const to = dateToNumber(req.query.to) || 99999999;
    const limit = (Math.abs(0 - (req.query.limit || 0)));
    Exercise.find({
      userId,
      date: {$gt: from, $lt: to},
    }, {}, {limit}, (err,result) => {
      if(err) {
        res.send(err);
      } else {
        res.send(result);
      }
    })
  })

  app.post('/api/exercise/new-user', (req,res) => {
    const username = req.body.username;
    User.create({username}, (err,user) => {
      if (err) {
        res.send(err);
      } else {
        res.send(user);
      }
    })
  })

  app.post('/api/exercise/add', (req,res) => {
    let {_id, description, duration, date} = req.body;
    date = dateToNumber(date);
    User.findById(_id, (err, user) => {
      if (err) {
        res.send('user ID not found')
      } else {
        Exercise.create({userId: _id, username: user.username, description, duration, date}, (err, exercise) => {
          if (err) {
            res.send(err);
          } else {
            res.send(`{"userId": "${_id}", "username": "${user.username}", "description": "${description}", "duration": "${duration}", "date": "${dateFromNumber(date)}"}`);
          }
        })
      }
    })
  })

app.listen(PORT, ()=>{
    console.log('Your app is listening on port ' + PORT);
});