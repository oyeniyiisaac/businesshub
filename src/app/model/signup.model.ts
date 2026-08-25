import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    ownerName: { type: String, required: true },
    workEmail: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    role: { type: String, required: true },
    password: { type: String, required: true },
    checkActionCode: { type: Boolean, default: false },

    logoUrl: { type: String, default: null },
    registeredAddress: { type: String, default: null },
    currency: { type: String, default: 'NGN' },
    taxNumber: { type: String, default: null },
    timezone: { type: String, default: '(GMT+01:00) West Central Africa' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    decimalPlaces: { type: Number, default: 2 },
    showCurrencySymbol: { type: Boolean, default: true },
    taxRates: {
      type: [
        {
          name: { type: String, required: true },
          description: { type: String, default: '' },
          rate: { type: Number, required: true },
          type: { type: String, enum: ['Exclusive', 'Inclusive'], default: 'Exclusive' },
          status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
        },
      ],
      default: [
        {
          name: 'Value Added Tax (VAT)',
          description: 'Federal Tax ID required',
          rate: 7.5,
          type: 'Exclusive',
          status: 'Active',
        },
        {
          name: 'Lagos State Consumption Tax',
          description: 'Hospitality & Restaurants',
          rate: 5.0,
          type: 'Exclusive',
          status: 'Active',
        },
        {
          name: 'Withholding Tax (WHT)',
          description: 'Services & Contracts',
          rate: 10.0,
          type: 'Inclusive',
          status: 'Inactive',
        },
      ],
    },

    resetPasswordToken: { type: String, default: null },
    resetPasswordOtp: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

const Business = mongoose.models.Business || mongoose.model('Business', businessSchema);

export default Business;