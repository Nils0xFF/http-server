import { Request, Response, RequestHandler } from 'express';
import { BadRequestError, UnauthorizedError } from '../../types/errors.js';
import { createUser, getUserByEmail } from '../../db/queires/index.js';
import { checkPasswordHash, hashPassword } from '../../utils/auth.js';
import { UserResponse } from '../../db/schemas/index.js';

export const createUserHandler: RequestHandler = async (req: Request, res: Response<UserResponse>) => {
  type CreateUserBody = {
    email?: unknown;
    password?: unknown;
  };

  const body = req.body as CreateUserBody;
  const { email, password } = body;
  if (typeof email !== 'string' || email.length === 0) {
    throw new BadRequestError('Invalid email.');
  }
  if (typeof password !== 'string' || password.length === 0) {
    throw new BadRequestError('Invalid password.');
  }

  const hash = await hashPassword(password);

  const user = await createUser({ email, hashedPassword: hash });

  if (!user) {
    throw new BadRequestError('Duplicate email!');
  }

  const { hashedPassword, ...userResponse } = user;

  res.status(201).json(userResponse);
};

export const loginHandler: RequestHandler = async (req: Request, res: Response<UserResponse>) => {
  type LoginBody = {
    email?: unknown;
    password?: unknown;
  };

  const body = req.body as LoginBody;
  const { email, password } = body;
  if (typeof email !== 'string' || email.length === 0) {
    throw new BadRequestError('Invalid email.');
  }
  if (typeof password !== 'string' || password.length === 0) {
    throw new BadRequestError('Invalid password.');
  }

  const user = await getUserByEmail(email);

  if (!user) {
    throw new UnauthorizedError();
  }

  const passwordMatch = await checkPasswordHash(password, user.hashedPassword);

  if (!passwordMatch) {
    throw new UnauthorizedError();
  }

  const { hashedPassword, ...userResponse } = user;

  res.status(200).json(userResponse);
};
