const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Define the User schema
const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please provide a name 🤨'],
		minLength: 3,
		maxlength: 50,
	},

	email: {
		type: String,
		required: [true, 'Please provide an email 🤨'],
		match: [
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			'Please provide a valid email 🤨',
		],
		// Create a unique Index for the email that was inserted to the DB. Will alert i another user with the same email value will be attempted to insert (Will throw "duplicate key" error message)
		unique: true,
	},
	password: {
		type: String,
		required: [true, 'Please provide a password 🤨'],
		minLength: 6,
	},
});

// Hashing and encrypting the user password, using mongoose middleware
UserSchema.pre('save', async function () {
	// Create hashed password
	const salt = await bcrypt.genSalt(10);
	// Encrypting the password
	this.password = await bcrypt.hash(this.password, salt);
});

// Creating token, using mongoose middleware
UserSchema.methods.createJWT = function () {
	return jwt.sign(
		{ userId: this._id, name: this.name },
		process.env.JWT_SECRET,
		{
			expiresIn: process.env.JWT_LIFETIME,
		}
	);
};

// Check the user's token by comparing against the token we expect to get from him
UserSchema.methods.comparePassword = async function (candidatePassword) {
	const isMatch = await bcrypt.compare(candidatePassword, this.password);
	return isMatch;
};

module.exports = mongoose.model('User', UserSchema);
