const Job = require('../models/Job');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

// Looking for all the jobs that created by the user who is sending the request to this route
const getAllJobs = async (req, res) => {
	const jobs = await Job.find({ createdBy: req.user.userId });
	res.status(StatusCodes.OK)
		.json({ jobs, count: jobs.length })
		.sort('createdAt');
};
const getOneJob = async (req, res) => {
	// distructure the userId from the user request object sent via the middlware and distructure the job id from the url request params
	const {
		user: { userId },
		params: { id: jobId },
	} = req;

	const job = await Job.findOne({
		_id: jobId,
		createdBy: userId,
	});

	if (!job) {
		throw new NotFoundError(`No job with ID ${jobId} was found 😩`);
	}

	res.status(StatusCodes.OK).json({ job });
};

const createJob = async (req, res) => {
	// Get the user's Id from request user object and set it as the vakue for porperty createdBy in the job document
	req.body.createdBy = req.user.userId;
	const newJob = await Job.create(req.body);
	res.status(StatusCodes.CREATED).json({ newJob });
};

const updateJob = async (req, res) => {
	// distructure the userId from the user request object sent via the middlware and distructure the job id from the url request params
	const {
		body: { company, position },
		user: { userId },
		params: { id: jobId },
	} = req;

	if (company === '' || position === '') {
		throw new BadRequestError(
			'please provide company and position name 🤨'
		);
	}

	const jobUpdated = await Job.findByIdAndUpdate(
		// Find the job in the DB
		{ _id: jobId, createdBy: userId },
		// Update it with the data sent in the request body
		req.body,
		// return the updated job and also activate the validation (check if the user delivered 'name' for example)
		{ new: true, runValidators: true }
	);

	if (!jobUpdated) {
		throw new NotFoundError(`No job with ID ${jobId} was found 😩`);
	}

	// Send the updated job in the response
	res.status(StatusCodes.OK).json({ jobUpdated });
};

const deleteJob = async (req, res) => {
	// distructure the userId from the user request object sent via the middlware and distructure the job id from the url request params
	const {
		user: { userId },
		params: { id: jobId },
	} = req;

	const jobToDelete = await Job.findByIdAndRemove({
		_id: jobId,
		createdBy: userId,
	});

	if (!jobToDelete) {
		throw new NotFoundError(`No job with ID ${jobId} was found 😩`);
	}

	res.status(StatusCodes.NO_CONTENT).send();
};

module.exports = {
	getAllJobs,
	getOneJob,
	updateJob,
	createJob,
	deleteJob,
};
