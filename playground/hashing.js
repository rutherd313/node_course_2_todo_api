const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var password = '123abc!';

//hashing password using bcrypt
//(10) num of rounds used to generate the salt
/*bcrypt.genSalt(10, (err, salt) => {
	bcrypt.hash(password, salt, (err, hash) => {
		console.log(hash);
	});
});*/

var hashedPassword = '$2a$10$rdOHV5zE/2JKSxdnqAtG.eRJvc2tSzkfzNPY19OXGaIdTpU.Y9FWW'

//comparing password values
 bcrypt.compare(password, hashedPassword, (err, res) => {
 	console.log(res)
 });

/*var data = {
	id: 10
};

//takes the obj with the user id and signs it
//creates the hash and returns token value
//arg: "secretwords"
var token = jwt.sign(data, "123abc"); 
console.log(token);

//takes the token and secret and makes sure data was not manipulated
//if anything about the secret or the token changes when verify is called,
//call will not pass
var decoded = jwt.verify(token, '123abc');
console.log('decoded', decoded);
*/

/* Below uses {SHA256} format
//256 comes from num of bits that are the resulting hash

var message = 'I am user number 3';
var hash = SHA256(message).toString();

console.log(`Message: ${message}`);
console.log(`Hash: ${hash}`);

//Data we want to send back from the server to the client
//id = from users.js
var data = {
	id: 4
};

//Important: make sure client doesn't change id:4 to 5, send the token 
//back and initiate to delete all id:5.
var token = {
	data,
	hash: SHA256(JSON.stringify(data) + "somesecret").toString()
}

//Changing the data to fail the call
//Does not have access to the same salt, aka "somesecret" => only in server
token.data.id = 5;
token.hash = SHA256(JSON.stringify(token.data)).toString();

//Not yet fool-proof. Let's say user decides to change data property
//to 5, all is needed is to rehash that data, add to hash property,
//send token back, tricking the machine.
//Solution: Salting the hash = "somesecret" added
var resultHash = SHA256(JSON.stringify(token.data) + "somesecret").toString();

if (resultHash === token.hash){
	console.log('Data was not changed');
} else {
	console.log('Data was changed. Do not trust!');
}*/