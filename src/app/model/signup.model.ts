import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    ownerName: { type: String, required: true },
    workEmail: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    checkActionCode: { type: Boolean, default: false },

    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

const Business = mongoose.models.Business || mongoose.model('Business', businessSchema);

export default Business;