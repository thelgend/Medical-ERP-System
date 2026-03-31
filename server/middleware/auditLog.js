const AuditLog = require('../models/AuditLog');

const logAction = (action, target) => {
    return async (req, res, next) => {
        const originalSend = res.send;
        res.send = function(data) {
            // Only log if the request was successful
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const log = new AuditLog({
                    user: req.user ? req.user._id : null,
                    action,
                    target,
                    details: `${req.method} ${req.originalUrl}`,
                    ipAddress: req.ip
                });
                log.save().catch(err => console.error('Error saving audit log:', err));
            }
            originalSend.apply(res, arguments);
        };
        next();
    };
};

module.exports = logAction;
