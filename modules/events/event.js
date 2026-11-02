let EventEmitter = require('node:events');
class MyEmitter extends EventEmitter {}

EventEmitter = new MyEmitter();
EventEmitter.setMaxListeners(0);

module.exports = { EventEmitter };