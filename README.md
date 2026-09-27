# Chirpy

A small Twitter-style REST API built with Express 5, PostgreSQL and Drizzle ORM. Users sign up, log in and post short messages ("chirps") that can be searched, sorted and deleted.

Built as part of the Boot.dev course [Learn HTTP Servers in TypeScript](https://www.boot.dev/courses/learn-http-servers-typescript).

[![Boot.dev Learn HTTP Servers in TypeScript certificate](https://qvault-webapp-dynamic-assets.storage.googleapis.com/certificates/b28884f5-e973-4a75-bc9a-309c60478201.jpeg?v=1790524625)](https://www.boot.dev/certificates/b28884f5-e973-4a75-bc9a-309c60478201)

## Why care?

It's a compact, readable example of a real-world backend: JWT auth with refresh tokens, argon2 password hashing, database migrations, API-key-protected webhooks and centralized error handling, all in plain TypeScript without heavy framework magic.

## Getting started

Requirements: Node.js 22 (see `.nvmrc`) and a running PostgreSQL database.

```sh
npm install
cp .env.example .env   # then fill in your values
npm run dev            # builds and starts the server
```

Database migrations are applied automatically on startup. The server runs at `http://localhost:$PORT`. Check it with `GET /api/healthz`.

Run the tests with `npm test`.
