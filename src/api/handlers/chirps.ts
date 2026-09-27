import { Request, RequestHandler, Response } from 'express';
import { createChirp, deleteChirp, getChirpById, getChirps } from '../../db/queires/index.js';
import { config } from '../../types/config.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../types/errors.js';
import { getBearerToken, validateJWT } from '../../utils/auth.js';

export async function createChirpHandler(req: Request, res: Response) {
  type ChirpBody = {
    body?: unknown;
  };

  const token = getBearerToken(req);
  const userId = validateJWT(token, config.api.secret);

  const reqBody = req.body as ChirpBody;
  const { body } = reqBody;
  if (typeof body !== 'string' || body.length === 0) {
    throw new BadRequestError('Invalid body.');
  }
  if (body.length > 140) {
    throw new BadRequestError('Chirp is too long. Max length is 140');
  }
  if (typeof userId !== 'string' || userId.length == 0) {
    throw new BadRequestError('Invalid userId.');
  }
  const badWords = new Set(['kerfuffle', 'sharbert', 'fornax']);

  const cleanChirp = body
    .split(' ')
    .map((word) => {
      if (badWords.has(word.toLowerCase())) {
        return '****';
      }
      return word;
    })
    .join(' ');

  const chirp = await createChirp(cleanChirp, userId);

  if (!chirp) {
    throw new Error('Could not create chirp');
  }

  res.status(201).json(chirp);
}

export const getChirpsHandler: RequestHandler = async (req, res) => {
  let authorId = undefined;
  const authorIdQuery = req.query.authorId;
  if (typeof authorIdQuery === 'string') {
    authorId = authorIdQuery;
  }

  let sort = 'asc';
  const sortQuery = req.query.sort;
  if (typeof sortQuery === 'string') {
    sort = sortQuery;
  }

  if (sort !== 'asc' && sort !== 'desc') {
    throw new BadRequestError('Invalid sort value');
  }

  const chirps = await getChirps(sort, authorId);
  res.json(chirps);
};

export const getChirpHandler = async (req: Request<{ id: string }>, res: Response) => {
  const id = req.params.id;

  const chirp = await getChirpById(id);

  if (!chirp) {
    throw new NotFoundError('Chirp not found!');
  }

  res.json(chirp);
};

export const deleteChirpHandler = async (req: Request<{ id: string }>, res: Response) => {
  const token = getBearerToken(req);
  const userId = validateJWT(token, config.api.secret);

  const id = req.params.id;

  const chirp = await getChirpById(id);

  if (!chirp) {
    throw new NotFoundError('Chirp not found!');
  }

  if (chirp.userId !== userId) {
    throw new ForbiddenError();
  }

  await deleteChirp(chirp.id);

  res.status(204).send();
};
