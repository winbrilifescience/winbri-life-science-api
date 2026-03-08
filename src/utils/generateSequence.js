const { CounterRepo } = require('../database');

const generateSequence = async (name) => {
	const counter = await CounterRepo.findOneAndUpdate({ name }, { $inc: { seq: 1 } }, { new: true, upsert: true });
	return counter.seq;
};

module.exports = generateSequence;
