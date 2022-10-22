const Setting = require('../models/setting');

module.exports = async (field) => {
  return await Setting.findOneAndUpdate(
    { status: 1 },
    { $inc: field },
    { new: true }
  );
};
