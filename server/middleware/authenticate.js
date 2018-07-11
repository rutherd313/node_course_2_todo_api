var {User} = require('./../models/user');

//Middleware function to make routes private
var authenticate = (req, res, next) => {
	var token = req.header('x-auth');

	//model method
	User.findByToken(token).then((user) => {
		//if this code runs, so will catch block
		if (!user) {
			return Promise.reject();
		}
		//modify req obj to be used on route below
		req.user = user;
		req.token = token;
		next();
	}).catch((e) => {
		res.status(401).send();
	});
};

module.exports = {authenticate};