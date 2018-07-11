const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

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
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

  user.tokens = user.tokens.concat([{access, token}]);

  //.save() returns a promise, .then callback is used
  //in order to allow server.js to chain onto promise
  return user.save().then(() => {
    return token;
  }).then((token))
};

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