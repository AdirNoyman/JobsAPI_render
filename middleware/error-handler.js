const { StatusCodes } = require('http-status-codes');
const errorHandlerMiddleware = (err, req, res, next) => {
	let customError = {
		// Set default (for the errors that I didn't customize  a head)
		statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
		msg: err.message || 'Something went wrong, please try again later',
	};

	if (err.name === 'ValidationError') {
		customError.msg = Object.values(err.errors)
			.map(item => item.message)
			.join(',');
		customError.statusCode = StatusCodes.BAD_REQUEST;
	}
	if (err.code && err.code === 11000) {
		customError.msg = `Duplicate value entered for ${Object.keys(
			err.keyValue
		)} field 🤨. Please choose another ${Object.keys(err.keyValue)}.`;
		customError.statusCode = StatusCodes.BAD_REQUEST;
	}

	if (err.name === 'CastError') {
		customError.msg = `No item with ID ${err.value} was found 😩`;
		customError.statusCode = StatusCodes.NOT_FOUND;
	}
	// return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
	return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
