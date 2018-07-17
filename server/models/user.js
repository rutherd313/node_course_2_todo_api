const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

//Model method
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

//Override methods to limit what is being shown in postman post request
//Determines what gets sent back when a mongoose model is converted
//into a json value
UserSchema.methods.toJSON = function(){
  var user = this;
  //toObject() resp for taking mongoose var user and converting it to
  //regular obj where only properties available in the docs exist
  var userObject = user.toObject() 

  return _.pick(userObject, ['_id', 'email']);
}

//Arrow func does not bind .this, so func expression is used
//instance method(generateAuthTOken) have access to individual docs
UserSchema.methods.generateAuthToken = function(){
  //Instance methods gets called with individual doc, (user)
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

  user.tokens = user.tokens.concat([{access, token}]);

  //.save() returns a promise, .then callback is used
  //in order to allow server.js to chain onto promise
  return user.save().then(() => {
    return token;
  });//.then((token))
};

//Defines app.delete in server.js
UserSchema.methods.removeToken = function(token){
  //$pull removes items from array that match certain criteria
  var user = this;

  return user.update({
    $pull: {
      tokens: {token}
    }
  });
};

//Everything added turns into a model method as opposed to an instance
UserSchema.statics.findByToken = function(token){
  //model methods (User) gets called with 'this' binding
  var User = this;
  //stores from line 17, hashing.js
  var decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    //if this code runs, anything below will not
    /*return new Promise((resolve, reject) => {
      reject();
    });*/
    //simplified version from ^. Inside reject(), value will be used
    //to line 162 in server.js
    return Promise.reject();
  }
  //Success case
  return User.findOne({
    //finding values that match tokens array
    '_id': decoded._id,
    //to query a nested doc, this is the format. from line 24
    'tokens.token': token,
    'tokens.access': 'auth'
  });
}

UserSchema.statics.findByCredentials = function(email, password) {
  //find user where email is equal to the one passed in
  var user = this;

  return User.findOne({email}).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      //Use brypt.compare
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          //returns 400
          reject();
        }
      });
    });
  });
};

//Runs before 'save' event
UserSchema.pre('save', function(next) {
  var user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        //update user doc in order to hide plain-text password
        user.password = hash;
        next();
      })
    });
  } else {  
    next();
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = {User}

/*const mongoose = require('mongoose');
const validator = require('validator');

// {
//   email: 'andrew@example.com',
//   password: 'adpsofijasdfmpoijwerew',
//   tokens: [{
//     access: 'auth',
//     token: 'poijasdpfoimasdpfjiweproijwer'
//   }]
// }

var User = mongoose.model('User', {
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

module.exports = {User}

//--------
const mongoose = require('mongoose');
const validator = require('validator');
//Authentication and Security. Changes to make for User object
//validate func => http://mongoosejs.com/docs/validation.html
{
  email: 'youremail@yahoo.com',
  password: 'dcrriuufrhjuj', //crypted pass
  tokens: [{
    access: 'auth',
    token: 'ijfeifjeifhwsq' //crypted pass
  }]
}

var User = mongoose.model('User', {
  email: {
    type: String,
    required: true, //These values must exist
    minlength: 1,
    trim: true,
    //verifies that email property does not have the same value as any
    //other documents in the selection
    unique: true,
    //verify that string that was passed in is a valid email
    validate: {
      validator: validator.isEmail,
      // (uncompressed) (value) => {
      //   return validator.isEmail(value);
      // },
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token : {
      type: String,
      required: true
    }
  }]
  // completed: {
  //  type: Boolean,
  //  default: false
  // },
  // completedAt: {
  //  type: Number,
  //  default: null
  // }
});

module.exports = {User}



// var userLog = new User({
//   email: 'djohnruther@yahoo.com'
// });

// userLog.save().then((doc) => {
//   console.log(JSON.stringify(doc, undefined, 2));
// }, (e) => {
//   console.log('Unable to save userLog');
// })*/