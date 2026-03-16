/**
 * ServiceEntry model - Medical service booking/entry
 */
const mongoose = require('mongoose');
const { serviceTypes, entryStatus, paymentModes } = require('../common/constants');

const required = true;
const trim = true;

/** Health Check-up task assignment */
const healthCheckupAssignmentSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'admins', required: true },
		task: [{ type: String, enum: ['COLLECTION', 'ECG', 'PFT'], required: true }],
	},
	{ _id: false }
);

const serviceEntrySchema = new mongoose.Schema(
	{
		entryNo: { type: Number, required: true, unique: true },
		serviceName: { type: String, required, trim, enum: Object.values(serviceTypes) },
		amount: { type: Number, required, min: 0 },
		assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'admins' }],
		healthCheckupAssignments: { type: [healthCheckupAssignmentSchema], default: [] },
		address: { type: String, trim },
		location: { type: String, trim },
		mobile: { type: String, trim },
		paymentMode: { type: String, trim, enum: Object.values(paymentModes) },
		upiReceivedAmount: { type: Number, default: 0, min: 0 },
		cashReceivedAmount: { type: Number, default: 0, min: 0 },
		status: { type: String, required, trim, enum: Object.values(entryStatus), default: entryStatus.pending },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admins', required },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admins' },
	},
	{
		timestamps: true,
		collection: 'service_entries',
	}
);

serviceEntrySchema.index({ serviceName: 1 });
serviceEntrySchema.index({ status: 1 });
serviceEntrySchema.index({ createdAt: -1 });
serviceEntrySchema.index({ createdBy: 1 });
serviceEntrySchema.index({ assignedUsers: 1 });

module.exports = mongoose.models.ServiceEntry || mongoose.model('ServiceEntry', serviceEntrySchema);
