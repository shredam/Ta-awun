const mongoose = require('mongoose');

const donationCampaignSchema = new mongoose.Schema(
  {
    postID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Enter the ID of the organization'],
    },
    title: {
      type: String,
      required: [true, 'Enter campaign title'],
    },
    remainingAmount: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

donationCampaignSchema.pre('save', function (next) {
  if (this.isNew) this.remainingAmount = this.totalAmount;
  next();
});
const DonationCampaign = mongoose.model(
  'DonationCampaign',
  donationCampaignSchema
);

module.exports = DonationCampaign;