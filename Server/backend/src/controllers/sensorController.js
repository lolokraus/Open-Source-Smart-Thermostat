const Temperature = require('../models/temperatureModel');
const Humidity = require('../models/humidityModel');
const CO2 = require('../models/co2Model');

// Get all temperature readings
exports.getFilteredTemperatureReadings = async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const readings = await Temperature.getFilteredReadings(startDate, endDate);
        res.json(readings);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving temperature data" });
    }
};

// Get latest temperature reading
exports.getLatestTemperatureReading = async (req, res) => {
    try {
        const reading = await Temperature.getLatestReading();
        res.json(reading);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving temperature data" });
    }
};

// Add a temperature reading
exports.addTemperatureReading = async (req, res) => {
    try {
        const { value, heatingOn, deviceTimestamp } = req.body;
        await Temperature.addReading(value, heatingOn, deviceTimestamp);
        res.status(201).send("Temperature reading added successfully");
    } catch (error) {
        res.status(500).json({ message: "Error adding temperature data" });
    }
};

// Get all humidity readings
exports.getLatestHumidityReading = async (req, res) => {
    try {
        const reading = await Humidity.getLatestReading();
        res.json(reading);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving humidity data" });
    }
};

// Get latest humidity reading
exports.getFilteredHumidityReadings = async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const readings = await Humidity.getFilteredReadings(startDate, endDate);
        res.json(readings);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving humidity data" });
    }
};

// Add a humidity reading
exports.addHumidityReading = async (req, res) => {
    try {
        const { value, heatingOn, deviceTimestamp } = req.body;
        await Humidity.addReading(value, heatingOn, deviceTimestamp);
        res.status(201).send("Humidity reading added successfully");
    } catch (error) {
        res.status(500).json({ message: "Error adding humidity data" });
    }
};

// Get all CO2 readings
exports.getFilteredCO2Readings = async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const readings = await CO2.getFilteredReadings(startDate, endDate);
        res.json(readings);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving CO2 data" });
    }
};

// Get latest CO2 reading
exports.getLatestCO2Reading = async (req, res) => {
    try {
        const reading = await CO2.getLatestReading();
        res.json(reading);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving CO2 data" });
    }
};

// Add a CO2 reading
exports.addCO2Reading = async (req, res) => {
    try {
        const { value, heatingOn, deviceTimestamp } = req.body;
        await CO2.addReading(value, heatingOn, deviceTimestamp);
        res.status(201).send("CO2 reading added successfully");
    } catch (error) {
        res.status(500).json({ message: "Error adding CO2 data" });
    }
};