var mongoose = require('mongoose');

var User = mongoose.model('User', {
	email: {
		type: String,
		required: true, //These values must exist
		minlength: 1,
		trim: true
	},
	completed: {
		type: Boolean,
		default: false
	},
	completedAt: {
		type: Number,
		default: null
	}
});

module.exports = {User}


/*
var userLog = new User({
	email: 'djohnruther@yahoo.com'
});

userLog.save().then((doc) => {
	console.log(JSON.stringify(doc, undefined, 2));
}, (e) => {
	console.log('Unable to save userLog');
})*/