const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
	{
		company: {
			type: String,
			required: [true, 'Please provide company name ๐ก'],
			maxlength: 50,
		},
		position: {
			type: String,
			required: [true, 'Please provide position ๐ก'],
			maxlength: 100,
		},
		jobStatus: {
			type: String,
			enum: ['interview', 'declined', 'pending'],
			default: 'pending',
		},
		// Every time a job created, it will be associated with the user who created it
		createdBy: {
			type: mongoose.Types.ObjectId,
			ref: 'User',
			required: [true, 'Please provide a user ๐คจ'],
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Job', JobSchema);
