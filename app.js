require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();

// Extra Middleware security packages
const helmet = require('helmet');
// CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.
const cors = require('cors');
// Sanitize untrusted HTML (to prevent XSS) with a configuration specified by a Whitelist
const xss = require('xss');
// Basic rate-limiting middleware for Express. Use to limit repeated requests to public APIs and/or endpoints such as password reset
const rateLimiter = require('express-rate-limit');

// Swagger
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

// Middleware
const authenticateUser = require('./middleware/authentication');

// Connect DB
const connectDB = require('./db/connect');

// Routers
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.json());
// extra packages
// Heroku is the reverse proxy for us
app.set('trust proxy', 1);
app.use(
	rateLimiter({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	})
);
app.use(helmet());
app.use(cors());
app.use(xss());

app.get('/', (req, res) => {
	res.send('<h1>jobs API</h1><a href="/api-docs">API Documentation 🤓</a>');
});

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
// routes
app.use('/api/v1/auth', authRouter);
// authenticateUser = middleware we use for authenticating users before we let proceed to the jobs routes
app.use('/api/v1/jobs', authenticateUser, jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
	try {
		await connectDB(process.env.MONGO_URI);
		app.listen(port, () =>
			console.log(`Server is listening on port ${port} 😎🤟...`)
		);
	} catch (error) {
		console.log(error);
	}
};

start();
