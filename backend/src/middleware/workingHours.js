const START_HOUR = 8;   // 08:00 AM
const END_HOUR = 18;    // 06:00 PM

function workingHours(req, res, next) {
  const now = new Date();

  // Convert current time to IST
  const istTime = new Date(
    now.toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata'
    })
  );

  const hour = istTime.getHours();

  // Allow reports only between 8 AM and 6 PM
  if (hour < START_HOUR || hour >= END_HOUR) {
    console.log(
      ` Report rejected: outside working hours (${hour}:00 IST)`
    );

    return res.status(200).json({
      success: false,
      message: 'Reports are allowed only between 8:00 AM and 6:00 PM.',
      workingHours: '08:00 AM - 06:00 PM'
    });
  }

  console.log(` Working hours validated: ${hour}:00 IST`);

  next();
}

module.exports = workingHours;