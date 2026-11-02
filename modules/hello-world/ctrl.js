const { logFmt, apiFmt } = require('../services/fmt');
const { validationResult, body } = require('express-validator');
const APIError = require('../errors/APIError');
const db = require('../db');
const { pageOffset } = require('../utils');

function sendHelloWorldResponse(req, res, next) {
  const response = {
    message: 'Hello World'
  }
  res.json(apiFmt(response));
}
async function contactUs(req, res, next) {
  try {
    validateRequest(req)
    let response = await db.insertDoc('contact-us', req.body)
    res.json(apiFmt(response))
  } catch (e) {
    next(e)
  }
}

async function contactUsGet(req, res, next) {
  try {
    let { id } = req.params;
    let query = db.getQueryBuilder('contact-us')
    let response;
    if (id) {
      response = await executeQuery(query.where({ id }).first())
    }
    else {
      let countQuery =  db.getQueryBuilder('contact-us')
      const count = await db.getCount(countQuery);
      let { offset, limit } = await pageOffset(req, count);
      query = query.orderBy('created_at', 'desc').groupBy('id').limit(limit).offset(offset)
      let data = await db.executeQuery(query)
      response = { total: count, contactEnquiries: data }
    }

    res.json(apiFmt(response))
  } catch (e) {
    next(e)
  }
}

function validateRequest(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(400, "Invalid request", errors);
  }
}

function validate(method) {
  switch (method) {
    case 'contact-us': {
      return [
        body('firstName', 'firstName is a required field').exists().isString(),
        body('lastName', 'lastName is a required field').exists().isString(),
        body('email', 'email is a required field').exists().isString(),
        body('subject', 'subject is a required field').exists().isString(),
        body('country', 'country is a required field').exists().isString()

      ]
    }
  }
}
module.exports = {
  sendHelloWorldResponse,
  validate,
  contactUs,
  contactUsGet
}