/**
 * @author Brijesh Prajapati
 */

const mongoose = require('mongoose'),
	logger = require('../winston');

const CustomLogger = logger.__instance({
	defaultMeta: {
		requestId: 'Service:Mongoose',
	},
});

if (!process.env.MONGODB_URI) {
	CustomLogger.error('Secrets [Mongoose]: srv not found');
	process.exit(1); // Exit if no connection string is found
}

// #region agent log
(function () {
	const uri = process.env.MONGODB_URI;
	const hostMatch = (uri || '').match(/@([^/]+)/);
	const hostHint = hostMatch ? hostMatch[1].split('?')[0] : '(no host)';
	fetch('http://127.0.0.1:7815/ingest/e25f93bb-a71b-4185-a45f-0fa8e383dad2', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'd1ae5b' },
		body: JSON.stringify({
			sessionId: 'd1ae5b',
			runId: 'startup',
			hypothesisId: 'H1-H4',
			location: 'mongoose/index.js:beforeConnect',
			message: 'Mongoose about to connect',
			data: { uriSet: true, hostHint, uriLength: (uri || '').length },
			timestamp: Date.now(),
		}),
	}).catch(() => {});
})();
// #endregion

const MongoDBConnectionString = process.env.MONGODB_URI;
const MAX_RETRIES = 5;
const BASE_RETRY_DELAY = 1000; // 1 second

function getConnectionStatusString() {
	return Object.entries(mongoose.STATES).find(([, value]) => value === mongoose.connection.readyState)?.[0] || 'unknown';
}

let retryCount = 0;

function mongooseConnect() {
	try {
		CustomLogger.info('Attempting to connect to MongoDB...');
		mongoose.connect(MongoDBConnectionString).catch((error) => {
			CustomLogger.error(`Connection failed: ${error.message}`, error.stack);
			// #region agent log
			(function (err) {
				fetch('http://127.0.0.1:7815/ingest/e25f93bb-a71b-4185-a45f-0fa8e383dad2', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'd1ae5b' },
					body: JSON.stringify({
						sessionId: 'd1ae5b',
						runId: 'startup',
						hypothesisId: 'H1-H3',
						location: 'mongoose/index.js:connectCatch',
						message: 'MongoDB connection error',
						data: { code: err.code, message: err.message, name: err.name },
						timestamp: Date.now(),
					}),
				}).catch(() => {});
			})(error);
			// #endregion
			handleReconnect();
		});
	} catch (error) {
		CustomLogger.error(`Error during connection attempt: ${error.message}`, error.stack);
		handleReconnect();
	}
}

function handleReconnect() {
	if (retryCount >= MAX_RETRIES) {
		CustomLogger.error(`Max retry count (${MAX_RETRIES}) exceeded. Giving up.`);
		// Optionally: process.exit(1) or notify admin
		return;
	}

	const delay = BASE_RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
	CustomLogger.warn(`Disconnected. Retrying (${retryCount + 1}/${MAX_RETRIES}) in ${delay}ms...`);
	retryCount++;

	setTimeout(() => {
		mongooseConnect();
	}, delay);
}

try {
	mongoose.connection.on('connecting', () => {
		CustomLogger.info(`${getConnectionStatusString()}`);
	});

	mongoose.connection.on('connected', () => {
		CustomLogger.info(`${getConnectionStatusString()} to ${mongoose.connection.db.databaseName}`);
		retryCount = 0; // Reset retry count on successful connection
	});

	mongoose.connection.on('disconnecting', () => {
		CustomLogger.warn(`${getConnectionStatusString()} ${mongoose.connection.db.databaseName}`);
	});

	mongoose.connection.on('error', (err) => {
		CustomLogger.error(`${getConnectionStatusString()}: ${err.message}`);
	});

	mongoose.connection.on('reconnected', () => {
		CustomLogger.info(`${getConnectionStatusString()} to ${mongoose.connection.db.databaseName}`);
		retryCount = 0; // Reset retry count on reconnection
	});

	mongoose.connection.on('disconnected', () => {
		CustomLogger.warn(`${getConnectionStatusString()}`);
		handleReconnect();
	});
} catch (error) {
	CustomLogger.error(`Error setting up connection handlers: ${error.message}`);
}

try {
	mongooseConnect();

	process.on('SIGINT', async () => {
		await mongoose.disconnect();
		CustomLogger.info('Disconnected from MongoDB due to app termination');
		process.exit(0);
	});
} catch (error) {
	CustomLogger.error(`Initial connection error: ${error.message}`);
}
