const httpStatus = {
  OK: 200,
  CREATED: 201,
  MOVED_PERMANATELY: 301,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  NOT_IMPLEMENTED: 501,
};

class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class DBError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends DomainError {
  constructor(message) {
    super();
    this.status = httpStatus.BAD_REQUEST;
    this.message = 'A malformed request was recieved.';

    if (message) {
      this.message = message;
    }
  }
}

class UnauthorizedError extends DomainError {
  constructor(message) {
    super();
    this.status = httpStatus.UNAUTHORIZED;
    this.message = 'You are not authorized. Please log in to view this resource.';

    if (message) {
      this.message = message;
    }
  }
}

class ForbiddenError extends DomainError {
  constructor(message) {
    super();
    this.status = httpStatus.FORBIDDEN;
    this.message = 'You are not permitted to view this resource.';

    if (message) {
      this.message = message;
    }
  }
}

class NotFoundError extends DomainError {
  constructor(message) {
    super();
    this.status = httpStatus.NOT_FOUND;
    this.message = 'The requested resource was not found';

    if (message) {
      this.message = message;
    }
  }
}

class NotImplementedError extends DomainError {
  constructor(message) {
    super();
    this.status = httpStatus.NOT_IMPLEMENTED;
    this.message = 'The requested action is not implemented. Check the api docs.';

    if (message) {
      this.message = message;
    }
  }
}


class InternalError extends DomainError {
  constructor(message) {
    super(message);
    this.status = httpStatus.INTERNAL_ERROR;
    this.message = 'An internal error occured. Please try your request again.';

    if (message) {
      this.message = message;
    }
  }
}

module.exports = {
  DomainError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  NotImplementedError,
  InternalError,
  httpStatus,
  DBError,
};
