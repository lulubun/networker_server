const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const {PORT, DATABASE_URL} = require('./config');
const {JobModel} = require('./models');
const {User} = require('./userModels');
const jsonParser = require('body-parser').json();
const LocalStrategy = require('passport-local');
const cors = require('cors');

const app = express();

mongoose.Promise = global.Promise;

app.use(express.static('public'));

let corsOptions = {
  "preflightContinue": true
}

app.options('*', cors(corsOptions))
app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//return all Jobs for a user
app.get('/:user/Jobs', (req, res) => {
  JobModel
  .find({serUser: req.params.user})
  .exec()
  .then(data => {
    res.json(data)
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({error: 'cannot retrieve Jobs'});
  });
});


//get all data for one Job
app.get('/:user/one_Job/:id', (req, res) => {
  JobModel
  .findById(req.params.id)
  .exec()
  .then(data => res.json(data))
  .catch(err => {
    console.error(err);
    res.status(500).json({error: 'cannot retrieve Job'});
  });
});


//get one past instance to edit it
app.get('/:user/one_Job/:id/:pastId', (req, res) => {
  JobModel
  .findById(req.params.id)
  .exec()
  .then(data => res.json(data))
  .catch(err => {
    console.error(err);
    res.status(500).json({error: 'cannot retrieve Job history'})
  })
});

//create a new Job
app.post('/:user/new_Job', (req, res) => {
  let serFirst = req.body.serFirst ? req.body.serFirst : '';
  let serLast = req.body.serLast ? req.body.serLast: '';
  let serImportant = req.body.serImportant ? req.body.serImportant: false;
  let serCompany = req.body.serCompany ? req.body.serCompany: '';
  let serJobTitle = req.body.serJobTitle ? req.body.serJobTitle: '';
  let serPhone = req.body.serPhone ? req.body.serPhone: '';
  let serEmail = req.body.serEmail ? req.body.serEmail: '';
  let serMeetDate = req.body.serMeetDate ? req.body.serMeetDate: '';
  let serNote = req.body.serNote ? req.body.serNote: '';
  let serPast = req.body.serPast ? req.body.serPast: [];

  JobModel
  .create({
    serUser: req.body.serUser,
    serNextJob: req.body.serNextJob,
    serFirst: serFirst,
    serLast: serLast,
    serImportant: serImportant,
    serCompany: serCompany,
    serJobTitle: serJobTitle,
    serPhone: serPhone,
    serEmail: serEmail,
    serMeetDate: serMeetDate,
    serNote: serNote,
    serPast: req.body.serPast
  })
  .then((data) => {res.status(201).json(data)})
  .catch(err => {
    console.error(err);
    res.status(500).json({error: 'Could not save Job'})
  });
});


//delete a Job
app.delete('/:user/one_Job/:id', (req, res) => {
  JobModel
  .findByIdAndRemove(req.params.id)
  .exec()
  .then(() => {
    res.status(201).json({message: 'Job deleted'})
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({error: 'Job not deleted'})
  });
});


//delete a past instance
app.put('/:user/one_Job/:id/:pastId', (req, res) => {
  console.log(req.params);
  JobModel
  .update(
    { _id: req.params.id },
    { $pull: { 'serPast': { 'pastId':  parseInt(req.params.pastId) } } }, (err, updatedObj) => {
      if(err) {
        console.log(err);
      }
      res.json(updatedObj)

    }
  );
});


//edit a Job
app.put('/:user/edit_Job/:id', (req, res) => {
  console.log(req.params.id, req.body._id);
  if(!(req.params.id && req.body._id && req.params.id === req.body._id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }
  const updated = {};
  const updatableFields = ['serFirst', 'serLast', 'serCompany', 'serJobTitle', 'serPhone', 'serEmail', 'serMeetDate', 'serNote'];
  updatableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  })

  JobModel
  .findByIdAndUpdate(req.params.id, {$set: updated}, {new:true})
  .exec()
  .then(updatedJob => {res.status(201).json(updatedJob)})
  .catch(err => res.status(500).json({message: 'Job not updated'}));
});


//edit heart or date on one Job
app.put('/:user/one_Job/:_id', (req, res) => {
  JobModel.findByIdAndUpdate(req.params._id, { $set: { serNextJob: req.body.serNextJob, serImportant: req.body.serImportant }}, {}, (err) => {
    if(err) {
      res.send(err);
    }
  })
  JobModel.findById(req.params._id, function (err, Job) {
    if (err) {
      res.send(err);
    }
    console.log(Job);
    res.json(Job)
  });
});


//add a new past instance
app.post('/:user/newPast/:id', (req, res) => {
  JobModel.findByIdAndUpdate(
    req.params.id,
    {$push: {"serPast": req.body}},
    {new : true},
    function(err, updatedPast) {
      if(err) {
        console.log(err);
      }
      res.json(updatedPast);
      console.log('new past response', updatedPast);
    }
  );
});

// this function connects to our database, then starts the server
function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

const router = express.Router();

router.use(jsonParser);


// NB: at time of writing, passport uses callbacks, not promises
const localStrategy = new LocalStrategy((username, password, callback) => {
  let user;
  User
  .findOne({username: username})
  .exec()
  .then(_user => {
    console.log(_user);
    user = _user;
    if (!user) {
      return callback(null, false, {message: 'Incorrect username'});
    }
    return user.validatePassword(password);
  })
  .then(isValid => {
    if (!isValid) {
      return callback(null, false, {message: 'Incorrect password'});
    }
    else {
      return callback(null, user)
    }
  });
});

passport.use(localStrategy);
router.use(passport.initialize());


//create a new user
router.post('/create', (req, res) => {

  let {username, password, firstName, lastName} = req.body;

  if (typeof username !== 'string') {
    return res.status(422).json({message: 'Incorrect field type: username'});
  }

  username = username.trim();

  if (username === '') {
    return res.status(422).json({message: 'Incorrect field length: username'});
  }

  if (!(password)) {
    return res.status(422).json({message: 'Missing field: password'});
  }

  if (typeof password !== 'string') {
    return res.status(422).json({message: 'Incorrect field type: password'});
  }

  password = password.trim();

  if (password === '') {
    return res.status(422).json({message: 'Incorrect field length: password'});
  }

  // check for existing user
  User
  .find({username})
  .count()
  .exec()
  .then(count => {
    if (count > 0) {
      return res.status(422).json({message: 'username already taken'});
    }
    return User.hashPassword(password)
  })
  .then(hash => {
    return User
    .create({
      username: username,
      password: hash,
      firstName: firstName,
      lastName: lastName
    })
  })
  .then(user => {
    return res.status(201).json(user.apiRepr());
  })
  .catch(err => {
    res.status(500).json({message: 'Internal server error'})
  });
});

//validate a user
router.post('/me',
  passport.authenticate('local', {session: false}),
  (req, res) => res.json({user: req.user.apiRepr()})
);

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.use(router);

module.exports = {runServer, app, closeServer};
