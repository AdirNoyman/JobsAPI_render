const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');

const register = async (req, res) => {
	// Create a user entry in the MongoDB using the mongoose validation
	// The hashing and encryption of the user's password is done in the mongoose middleware, prior hiting this route
	const user = await User.create({ ...req.body });
	// creating the token in the mongoose middleware
	const token = user.createJWT();

	res.status(StatusCodes.CREATED).json({
		// get user name from the mongoose schema
		user: { name: user.name },
		token,
	});
};
const login = async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		throw new BadRequestError('Please enter a valid email and password 🤨');
	}

	const user = await User.findOne({ email });
	// check if user was found in DB
	if (!user) {
		throw new UnauthenticatedError('Invalid credentials 🤨');
	}
	// Check the provided password by the user
	const isPasswordCorrect = await user.comparePassword(password);
	if (!isPasswordCorrect) {
		throw new UnauthenticatedError('Invalid credentials 🤨');
	}

	const token = user.createJWT();
	res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token });
};

module.exports = {
	register,
	login,
};
