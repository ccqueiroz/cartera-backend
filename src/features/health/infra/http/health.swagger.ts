/**
 * @swagger
 * components:
 *   schemas:
 *     HealthStatus:
 *       type: object
 *       required: [status, uptimeSeconds]
 *       properties:
 *         status: { type: string, enum: [ok] }
 *         uptimeSeconds: { type: number }
 *   responses:
 *     HealthStatusResponse:
 *       description: Serviço no ar.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data: { $ref: '#/components/schemas/HealthStatus' }
 */
export {};
