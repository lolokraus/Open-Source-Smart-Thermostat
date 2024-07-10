const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

/**
 * @swagger
 * /api/authenticate:
 *   post:
 *     summary: Authenticate user
 *     description: Authenticates a user and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentication successful, token returned.
 *       401:
 *         description: Authentication failed.
 */
router.post('/authenticate', userController.login);

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Logout user
 *     description: Logs out a user by invalidating the token used for session management.
 *     responses:
 *       200:
 *         description: Logout successful.
 */
router.post('/logout', userController.logout); 

module.exports = router;