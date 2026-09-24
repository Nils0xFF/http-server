import { createChirp, getChirpById, getChirps } from '../../db/queires/index.js';
import { BadRequestError, NotFoundError } from '../../types/errors.js';
import { Request, RequestHandler, Response } from 'express';
import { getBearerToken, validateJWT } from '../../utils/auth.js';
import { config } from '../../types/config.js';

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
  const chirps = await getChirps();
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
