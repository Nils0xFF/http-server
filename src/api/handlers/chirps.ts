import { createChirp, getChirpById, getChirps, getUserById } from '../../db/queires/index.js';
import { BadRequestError, NotFoundError } from '../../types/errors.js';
import { Request, RequestHandler, Response } from 'express';

export async function createChirpHandler(req: Request, res: Response) {
  type ChirpBody = {
    body?: unknown;
    userId?: unknown;
  };

  const reqBody = req.body as ChirpBody;
  const { body, userId } = reqBody;
  if (typeof body !== 'string' || body.length === 0) {
    throw new BadRequestError('Invalid body.');
  }
  if (body.length > 140) {
    throw new BadRequestError('Chirp is too long. Max length is 140');
  }
  if (typeof userId !== 'string' || body.length == 0) {
    throw new BadRequestError('Invalid userId.');
  }

  const user = await getUserById(userId);

  if (!user) {
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

  const chirp = await createChirp(cleanChirp, user.id);

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
