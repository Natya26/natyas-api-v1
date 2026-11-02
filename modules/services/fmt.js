const syslog = require('./log');

/**
 * Formatting for API Response
 *
 * @param {*} data Response data
 * @param {*} msg Response Msg
 * @returns object with error, data and message
 */
const apiFmt = (data = {}, msg = null, err = false,details=[]) => {
    if (data instanceof Error) {
        err = true;
        msg = msg.message;
        data = null;
    }
    return {
        err,
        msg,
        data,
        details
    };
};

/**
 * Formatting for Logs
 *
 * @param {*} req Request
 * @param {*} err Error
 * @returns Log based on error / debug
 */
const logFmt = (req, err = null) => {
    const log = {
        url: req.url,
        http: req.method,
        userId: ((req.user) ? req.user.id : null),
        action: req.action,
        perm: req.perm,
        time: new Date(),
    };
    if (err instanceof Error) {
        syslog.error(JSON.stringify(log));
        syslog.error(err.stack);
        return;
    }
    syslog.debug(JSON.stringify(log));
};

module.exports = {
    apiFmt,
    logFmt,
};
