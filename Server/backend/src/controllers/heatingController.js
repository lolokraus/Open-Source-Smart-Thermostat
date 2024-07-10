const Heating = require('../models/heatingModel');
const Temperature = require('../models/temperatureModel');

exports.checkHeatingStatus = async (req, res) => {
  try {
    const settings = await Heating.getSettings();
    const latestTemperature = await Temperature.getLatest();

    let heatingOn = false;
    if (settings.manual_active) {
      heatingOn = shouldHeatManual(settings.manual_temperature, latestTemperature.value);
    } else if (settings.schedule_active) {
      heatingOn = shouldHeatSchedule(settings, latestTemperature.value);
    }
    res.json({ heatingOn });
  } catch (error) {
    res.status(500).json({ message: 'Error checking heating status', error });
  }
};

exports.getHeatingSettings = async (req, res) => {
  try {
    const settings = await Heating.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving heating settings', error });
  }
};

exports.updateHeatingSettings = async (req, res) => {
  try {
    const { manualActive, manualTemperature, highTemperature, lowTemperature, highStart, highEnd, scheduleActive } = req.body;

     if (manualActive === scheduleActive) {
      return res.status(400).json({ message: 'Either manual or schedule mode must be active, but not both.' });
    }

    await Heating.updateSettings(manualActive, manualTemperature, highTemperature, lowTemperature, highStart, highEnd, scheduleActive);
    res.json({ message: 'Heating settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating heating settings', error });
  }
};

function shouldHeatManual(manualTemperature, currentTemperature) {

  const manualTempNum = Number(manualTemperature);
  const currentTempNum = Number(currentTemperature);

  const lowerThreshold = manualTempNum - 0.5;
  const upperThreshold = manualTempNum + 0.3;

  if (currentTempNum <= lowerThreshold) {
    return true;
  } else if (currentTempNum >= upperThreshold) {
    return false;
  } else {
    return true;
  }
}

function shouldHeatSchedule(settings, currentTemperature) {
  const now = new Date();
  const currentTime = now.getHours() + now.getMinutes() / 60;
  const highStart = parseTime(settings.high_start);
  const highEnd = parseTime(settings.high_end);

  let targetTemperature = settings.low_temperature;
  if (currentTime >= highStart && currentTime < highEnd) {
    targetTemperature = settings.high_temperature;
  }

  const targetTempNum = Number(targetTemperature);
  const currentTempNum = Number(currentTemperature);

  const lowerThreshold = targetTempNum - 0.5;
  const upperThreshold = targetTempNum + 0.3;

   if (currentTempNum <= lowerThreshold) {
    return true;
  } else if (currentTempNum >= upperThreshold) {
    return false;
  } else {
    return true;
  }
}

function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
}