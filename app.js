const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
var server = require('http').createServer(app);
const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));
const baseUrl = `/v1`;
const port = process.env.PORT || 3100;
var cors = require('cors')
const helloWorld = require('./modules/hello-world/router');
const authentication = require('./modules/authentication/router');
const upload = require('./modules/uploads/router');
const user = require('./modules/user/router');
const unRestricted = require('./modules/unrestricted/router');
const flowplayer = require('./modules/flowplayer-platform/router');
const mobileApp = require('./modules/app/router');
const notification = require('./modules/notifications/router');
const policy = require('./modules/terms-and-conditions/router');
const settings = require('./modules/settings/router');
const subscription = require('./modules/subscriptions/router');
const subscriptionPlans = require('./modules/subscription-plans/router');
const { authMiddleware, idMiddleware, sessionTokenMiddleware } = require('./modules/authentication/middleware');
const NotificationClient = require('./modules/notifications/notifications');
const setPlatformMiddleware = require('./modules/middlewares/set-platform');
const airpayCallbackLogger = require('./modules/middlewares/airpay-callback-logger');
const hdfcCallbackLogger = require('./modules/middlewares/hdfc-callback-logger');

const swaggerOpt = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Navarasa Backend Service',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3000/v1/'
      },
      {
        url: 'https://apidev.navarasaworld.com/v1/'
      },
      {
        url: 'https://api-codingo.navarasaworld.com/v1/'
      },
    ],
  },
  apis: ['./modules/*/router.js', './swagger.yaml']
};
const swaggerSpec = swaggerJSDoc(swaggerOpt);

app.use(cors({ origin: '*' }))

app.use('/assets', express.static(path.join(__dirname, '/public/assets')));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get(`${baseUrl}+'/home'`,function(req,res){
  res.send('Hello World!')
})

// app.use(airpayCallbackLogger);
// app.use(hdfcCallbackLogger);
app.use(setPlatformMiddleware);
app.use(baseUrl, helloWorld);
app.use(baseUrl, authentication);
app.use(baseUrl, unRestricted);
app.use(baseUrl, policy);
app.use(authMiddleware);
app.use(idMiddleware);
app.use(sessionTokenMiddleware);
app.use(baseUrl, mobileApp);
app.use(baseUrl, notification);
app.use(baseUrl, settings);
app.use(baseUrl, subscription);
app.use(baseUrl, subscriptionPlans);
app.use(baseUrl, flowplayer);
app.use(baseUrl, upload);
app.use(baseUrl, user);
const error = require('./modules/errors/middleware');
app.use(baseUrl, error);
NotificationClient.events();
// console.log(process.env.SOCKET_IO_APPID)
// job.start()
server.listen(port, function () {
  console.log('Express server of Navarasa listening on port ' + port);
});