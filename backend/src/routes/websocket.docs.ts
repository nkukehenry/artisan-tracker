/**
 * @swagger
 * components:
 *   examples:
 *     WebSocketOfferMessage:
 *       value:
 *         type: 'offer'
 *         data:
 *           sdp: 'v=0\r\no=- 123456789 2 IN IP4 127.0.0.1...'
 *           type: 'offer'
 *       summary: WebRTC Offer Message
 *     
 *     WebSocketAnswerMessage:
 *       value:
 *         type: 'answer'
 *         data:
 *           sdp: 'v=0\r\no=- 987654321 2 IN IP4 127.0.0.1...'
 *           type: 'answer'
 *       summary: WebRTC Answer Message
 *     
 *     WebSocketICECandidateMessage:
 *       value:
 *         type: 'ice-candidate'
 *         data:
 *           candidate: 'candidate:1 1 UDP 2130706431 192.168.1.1 54321 typ host'
 *           sdpMLineIndex: 0
 *           sdpMid: '0'
 *       summary: ICE Candidate Message
 *     
 *     WebSocketScreenShareOffer:
 *       value:
 *         type: 'screen-share-offer'
 *         deviceId: 'DEVICE-001'
 *         data:
 *           sdp: 'v=0\r\no=- 123456789 2 IN IP4 127.0.0.1...'
 *           type: 'offer'
 *         timestamp: '2023-01-01T12:00:00Z'
 *       summary: Screen Share Offer
 *     
 *     WebSocketCustomMessage:
 *       value:
 *         type: 'custom'
 *         action: 'request-screen-share'
 *         targetDevice: 'DEVICE-001'
 *         data:
 *           quality: 'high'
 *           fps: 30
 *       summary: Custom Signaling Message
 */

/**
 * WebSocket Signaling Documentation
 * 
 * This file provides additional Swagger documentation for WebSocket endpoints.
 * 
 * Note: Swagger/OpenAPI doesn't natively support WebSocket protocol,
 * so we document it as a special GET endpoint with upgrade capability.
 */

export {};

