const express = require('express');
const router = express.Router();
const { handleHeartbeat } = require('../controllers/heartbeatController');
const verifyToken = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/heartbeat:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Handle a heartbeat signal
 *     description: Receives and processes a heartbeat signal to ensure the system is active.
 *     responses:
 *       200:
 *         description: Heartbeat acknowledged.
 *       401:
 *         description: Unauthorized access.
 */
router.post('/', verifyToken, handleHeartbeat);

module.exports = router;