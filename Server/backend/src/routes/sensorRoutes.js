const express = require('express');
const sensorController = require('../controllers/sensorController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

// Temperature routes
/**
 * @swagger
 * /api/sensor/temperature:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get filtered temperature readings
 *     description: Retrieves filtered temperature readings based on provided filters.
 *     responses:
 *       200:
 *         description: Temperature readings retrieved successfully.
 *       401:
 *         description: Unauthorized access.
 */
router.get('/temperature', verifyToken, sensorController.getFilteredTemperatureReadings);

/**
 * @swagger
 * /api/sensor/latest-temperature:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get latest temperature reading
 *     description: Retrieves latest temperature reading.
 *     responses:
 *       200:
 *         description: Temperature reading retrieved successfully.
 *       401:
 *         description: Unauthorized access.
 */
router.get('/latest-temperature', verifyToken, sensorController.getLatestTemperatureReading);

/**
 * @swagger
 * /api/sensor/temperature:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Add a temperature reading
 *     description: Adds a new temperature reading to the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: number
 *                 description: Temperature value to add
 *               heatingOn:
 *                 type: boolean
 *                 description: Status whether the heating is on or not
 *               deviceTimestamp:
 *                 type: string
 *                 description: Timestamp from the device in the format YYYY-MM-DD hh:mm:ss
 *     responses:
 *       201:
 *         description: Temperature reading added successfully
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.post('/temperature', verifyToken, sensorController.addTemperatureReading);

// Humidity routes
/**
 * @swagger
 * /api/sensor/humidity:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get filtered humidity readings
 *     description: Retrieves filtered humidity readings based on provided filters.
 *     responses:
 *       200:
 *         description: Humidity readings retrieved successfully.
 *       401:
 *         description: Unauthorized access.
 */
router.get('/humidity', verifyToken, sensorController.getFilteredHumidityReadings);

/**
 * @swagger
 * /api/sensor/latest-humidity:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get latest humidity reading
 *     description: Retrieves latest humidity reading.
 *     responses:
 *       200:
 *         description: Humidity reading retrieved successfully.
 *       401:
 *         description: Unauthorized access.
 */
router.get('/latest-humidity', verifyToken, sensorController.getLatestHumidityReading);

/**
 * @swagger 
 * /api/sensor/humidity:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Add a humidity reading
 *     description: Adds a new humidity reading to the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: number
 *                 description: Humidity value to add
 *               heatingOn:
 *                 type: boolean
 *                 description: Status whether the heating is on or not
 *               deviceTimestamp:
 *                 type: string
 *                 description: Timestamp from the device in the format YYYY-MM-DD hh:mm:ss
 *     responses:
 *       201:
 *         description: Humidity reading added successfully
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.post('/humidity', verifyToken, sensorController.addHumidityReading);

// CO2 routes
/**
 * @swagger
 * /api/sensor/co2:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get filtered CO2 readings
 *     description: Retrieves filtered CO2 readings based on provided filters.
 *     responses:
 *       200:
 *         description: CO2 readings retrieved successfully.
 *       401:
 *         description: Unauthorized access.
 */
router.get('/co2', verifyToken, sensorController.getFilteredCO2Readings);

/**
 * @swagger
 * /api/sensor/latest-co2:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get latest CO2 reading
 *     description: Retrieves latest CO2 reading.
 *     responses:
 *       200:
 *         description: CO2 reading retrieved successfully.
 *       401:
 *         description: Unauthorized access.
 */
router.get('/latest-co2', verifyToken, sensorController.getLatestCO2Reading);

/**
 * @swagger
 * /api/sensor/co2:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Add a CO2 reading
 *     description: Adds a new CO2 reading to the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: number
 *                 description: CO2 value to add
 *               heatingOn:
 *                 type: boolean
 *                 description: Status whether the heating is on or not
 *               deviceTimestamp:
 *                 type: string
 *                 description: Timestamp from the device in the format YYYY-MM-DD hh:mm:ss
 *     responses:
 *       201:
 *         description: CO2 reading added successfully
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.post('/co2', verifyToken, sensorController.addCO2Reading);

module.exports = router;