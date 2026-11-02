const fs = require('fs');
const moment = require('moment');

const logPath = './logs';

if (!fs.existsSync(logPath)) {
    fs.mkdirSync(logPath);
}

const hdfcCallbackLogger = async (req, res, next) => {
    try {
        console.log('reach', req.path);
        if (req.path != '/v1/webhook/hdfc') return next();
        const fileName = `hdfc-callback-${moment(new Date()).format('YYYY-MM-DD')}.log`;
        const queryNBody = {
            query : req.query,
            body  : req.body,
        };
        const data = JSON.stringify(queryNBody, null, 2);
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

module.exports = hdfcCallbackLogger;