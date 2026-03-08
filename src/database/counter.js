/**
 * @author Brijesh Prajapati
 * @description Admin Profile Information
 */

const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, unique: true },
		seq: { type: Number, default: 0 },
	},
	{ collection: 'counters' }
);

module.exports = mongoose.model('counters', counterSchema, 'counters');
