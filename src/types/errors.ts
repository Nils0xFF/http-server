export abstract class CustomHttpError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class BadRequestError extends CustomHttpError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends CustomHttpError {
  constructor(message?: string) {
    super(message ?? 'Unauthorized', 401);
  }
}

export class ForbiddenError extends CustomHttpError {
  constructor(message: string) {
    super(message, 403);
  }
}

export class NotFoundError extends CustomHttpError {
  constructor(message: string) {
    super(message, 404);
  }
}
