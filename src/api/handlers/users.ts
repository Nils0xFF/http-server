import { Request, RequestHandler, Response } from 'express';
import { createUser, getUserByEmail, updateUser, upgradeUser } from '../../db/queires/index.js';
import { createRefreshToken, getTokenDetails, revokeToken } from '../../db/queires/refresh-tokens.js';
import { UserResponse } from '../../db/schemas/index.js';
import { config } from '../../types/config.js';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../types/errors.js';
import { checkPasswordHash, getAPIKey, getBearerToken, hashPassword, makeJWT, makeRefreshToken, validateJWT } from '../../utils/auth.js';

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

export const updateOwnUserHandler: RequestHandler = async (req: Request, res: Response<UserResponse>) => {
  type CreateUserBody = {
    email?: unknown;
    password?: unknown;
  };

  const token = getBearerToken(req);

  const userId = validateJWT(token, config.api.secret);

  const body = req.body as CreateUserBody;
  const { email, password } = body;
  if (typeof email !== 'string' || email.length === 0) {
    throw new BadRequestError('Invalid email.');
  }
  if (typeof password !== 'string' || password.length === 0) {
    throw new BadRequestError('Invalid password.');
  }

  const hash = await hashPassword(password);

  const user = await updateUser(userId, { email, hashedPassword: hash });

  if (!user) {
    throw new BadRequestError('Duplicate email!');
  }

  const { hashedPassword, ...userResponse } = user;

  res.status(200).json(userResponse);
};

export const loginHandler: RequestHandler = async (req: Request, res: Response<UserResponse & { token: string; refreshToken: string }>) => {
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

  const refreshToken = makeRefreshToken();

  const createdToken = createRefreshToken({
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 60 * 24 * 3600 * 1000),
  });

  if (!createdToken) {
    throw new Error('Could not create Refresh Token');
  }

  const token = makeJWT(user.id, 3600, config.api.secret);

  const { hashedPassword, ...userResponse } = user;

  res.status(200).json({ ...userResponse, token, refreshToken });
};

export const refreshHandler: RequestHandler = async (req, res) => {
  const token = getBearerToken(req);

  const details = await getTokenDetails(token);
  const now = new Date();

  if (details === null || details.users === null || details.refresh_tokens.revokedAt !== null || now > details.refresh_tokens.expiresAt) {
    throw new UnauthorizedError('Invalid refresh token!');
  }

  const updatedJWT = makeJWT(details.users.id, 3600, config.api.secret);

  res.status(200).json({ token: updatedJWT });
};

export const revokeHandler: RequestHandler = async (req, res) => {
  const token = getBearerToken(req);

  const result = await revokeToken(token);

  if (!result) {
    throw new UnauthorizedError('Invalid refresh token!');
  }

  res.status(204).send();
};

export const upgradeUserHandler: RequestHandler = async (req, res) => {
  type WebhookBody = {
    event: unknown;
    data: {
      userId: unknown;
    };
  };

  const apiKey = getAPIKey(req);

  if (apiKey !== config.api.polkaAPIKey) {
    throw new UnauthorizedError();
  }

  const body = req.body as WebhookBody;
  const { event, data } = body;
  const { userId } = data;

  if (typeof event !== 'string' || event.length === 0) {
    throw new BadRequestError('Missing event.');
  }
  if (typeof userId !== 'string' || userId.length === 0) {
    throw new BadRequestError('Missing userId.');
  }

  if (event !== 'user.upgraded') {
    res.status(204).send();
    return;
  }

  const user = upgradeUser(userId);

  if (!user) {
    throw new NotFoundError('User not found!');
  }

  res.status(204).send();
};
