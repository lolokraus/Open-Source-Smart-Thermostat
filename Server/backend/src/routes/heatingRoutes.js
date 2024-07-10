const express = require('express');
const heatingController = require('../controllers/heatingController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/heating/status:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Check heating status
 *     description: Gets the current status of the heating system.
 *     responses:
 *       200:
 *         description: Heating status retrieved successfully.
 *       401:
 *         description: Unauthorized access.
 */
router.get('/status', verifyToken, heatingController.checkHeatingStatus);

/**
 * @swagger
 * /api/heating/settings:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Update heating settings
 *     description: Updates the settings of the heating system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - manualActive
 *               - manualTemperature
 *               - highTemperature
 *               - lowTemperature
 *               - highStart
 *               - highEnd
 *               - scheduleActive
 *             properties:
 *               manualActive:
 *                 type: boolean
 *                 description: Whether manual mode is active.
 *               manualTemperature:
 *                 type: number
 *                 description: Desired temperature in manual mode.
 *                 format: double
 *               highTemperature:
 *                 type: number
 *                 description: High temperature setting.
 *                 format: double
 *               lowTemperature:
 *                 type: number
 *                 description: Low temperature setting.
 *                 format: double
 *               highStart:
 *                 type: string
 *                 description: Start time for high temperature mode.
 *                 format: time
 *               highEnd:
 *                 type: string
 *                 description: End time for high temperature mode.
 *                 format: time
 *               scheduleActive:
 *                 type: boolean
 *                 description: Whether schedule mode is active.
 *     responses:
 *       200:
 *         description: Heating settings updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid settings provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error updating heating settings.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.post('/settings', verifyToken, heatingController.updateHeatingSettings);

/**
 * @swagger
 * /api/heating/settings:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get heating settings
 *     description: Retrieves the current settings of the heating system.
 *     responses:
 *       200:
 *         description: Heating settings retrieved successfully.
 *       401:
 *         description: Unauthorized access.
 */
router.get('/settings', verifyToken, heatingController.getHeatingSettings);

module.exports = router;