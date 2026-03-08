// Brijesh Prajapati

const fs = require('fs');
console.clear();
const process = require('process');

process.on('uncaughtException', function (exception) {
	console.error(exception);
});
process.on('unhandledRejection', function (reason) {
	console.error(reason);
});

const envPath = `.env.${process.env.NODE_ENV || 'development'}`;
if (fs.existsSync(envPath)) {
	require('dotenv').config({ path: envPath });
} else {
	require('dotenv').config(); // fallback to .env
}

// Fail fast with clear message if MONGODB_URI is missing (before loading app/mongoose)
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri || typeof mongoUri !== 'string' || !mongoUri.trim()) {
	console.error('[server.js] MONGODB_URI is required. Set it in .env.development or .env');
	process.exit(1);
}

// #region agent log
(function () {
	const uriSet = !!process.env.MONGODB_URI;
	const uriLen = (process.env.MONGODB_URI || '').length;
	const hostMatch = (process.env.MONGODB_URI || '').match(/@([^/]+)/);
	const hostHint = hostMatch ? hostMatch[1].split('?')[0] : '(no host match)';
	fetch('http://127.0.0.1:7815/ingest/e25f93bb-a71b-4185-a45f-0fa8e383dad2', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'd1ae5b' },
		body: JSON.stringify({
			sessionId: 'd1ae5b',
			runId: 'startup',
			hypothesisId: 'H2-H4',
			location: 'server.js:env',
			message: 'After dotenv: env path and MONGODB_URI',
			data: { envPath, uriSet, uriLen, hostHint },
			timestamp: Date.now(),
		}),
	}).catch(() => {});
})();
// #endregion

// npm run start:prod
// "start:prod": "cross-env NODE_ENV=production nodemon server.js", -> nodemon
// process.env.NODE_ENV = 'production';
// process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const listenerAPP = require('./app');
const { logger } = require('./src/services');
const CustomLogger = logger.__instance({
	defaultMeta: {
		requestId: 'server.js',
	},
});

const http = require('http');
// HTTP Server
const server = http.createServer(listenerAPP);

server.addListener('listening', () => {
	CustomLogger.info(`\x1b[32m\x1b[1m PORT: ${process.env.PORT} \x1b[0m || \x1b[32m\x1b[1m NODE_ENV: ${process.env.NODE_ENV || '\x1b[31m\x1b[1m NODE_ENV NOT FOUND'} \x1b[0m`);
});
server.listen(process.env.PORT);
require('./src/socket')(server); // Initialize Socket.io

// Clear tmp folder

function deleteFolderRecursive(path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function (file) {
			var curPath = path + '/' + file;
			if (fs.lstatSync(curPath).isDirectory()) {
				// recurse
				deleteFolderRecursive(curPath);
			} else {
				// delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
}

let path = './.tmp';
if (fs.existsSync(path)) {
	deleteFolderRecursive(path);
} else {
	fs.mkdirSync(path);
}
