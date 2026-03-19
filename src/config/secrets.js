let secrets = {};

try {
	secrets = JSON.parse(process.env.SECRETS_JSON || '{}');
} catch (err) {
	console.error('Invalid SECRETS_JSON');
}

module.exports = secrets;
