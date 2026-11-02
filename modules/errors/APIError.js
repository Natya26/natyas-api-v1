const Result = require('express-validator').Result;

class APIError extends Error {
  /**
   * 
   * @param {number} httpCode 
   * @param {string} message 
   * @param {*} details 
   * @param {*} errorId 
   */
  constructor(httpCode, message, details, errorId) {
    if (!message) throw new Error('parameter message cannot be null');
    if (!httpCode && !Number.isInteger(httpCode)) throw new Error('parameter message should be integer')
    super(message);
    this.httpCode = httpCode;
    this.errorId = errorId;
    if (details instanceof Result) {
      this.details = details.array({ onlyFirstError: true });
    }
    else {
      this.details = details;
    }
  }

  toJSON() {
    return {
      errorId: this.errorId,
      message: this.message,
      details: this.details
    }
  }
}

module.exports = APIError;
