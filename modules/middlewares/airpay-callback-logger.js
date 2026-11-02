const fs = require('fs');
const moment = require('moment');

const logPath = './logs';

if (!fs.existsSync(logPath)) {
    fs.mkdirSync(logPath);
}

const airpayCallbackLogger = async (req, res, next) => {
    try {
        if (req.url != '/v1/webhook/airpay') return next();
        const fileName = `airpay-callback-${moment(new Date()).format('YYYY-MM-DD')}.log`;
        const data = JSON.stringify(req.body, null, 2);
        const logData = `[------Start(${Date.now()})------] \n ${data} \n [------End------] \n`;
        const filePath = `${logPath}/${fileName}`;
        fs.appendFile(filePath, logData, (err) => {
            if (err) {
                console.error(`Error writing to the log file: ${err}`);
            } else {
                console.log(`JSON data appended to ${filePath}`);
            }
        });
        return next();
    } catch (error) {
        return next();
    }
}

module.exports = airpayCallbackLogger;