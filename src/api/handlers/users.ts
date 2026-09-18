import { RequestHandler } from 'express';
import { BadRequestError } from '../../types/errors.js';
import { createUser } from '../../db/queires/index.js';

export const createUserHandler: RequestHandler = async (req, res) => {
  type CreateUserBody = {
    email?: unknown;
  };

  const body = req.body as CreateUserBody;
  const email = body.email;
  if (typeof email !== 'string' || email.length === 0) {
    throw new BadRequestError('Invalid email.');
  }

  const user = await createUser({ email });
  console.log(user);

  res.status(201).json(user);
};
