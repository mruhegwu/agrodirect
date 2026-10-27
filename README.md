# AgroDirect

AgroDirect is an agricultural software project organized as a Node.js monorepo with separate client and server applications.

## Verified repository structure

The root `package.json` defines scripts for running the client and server, building both applications, seeding the server, and invoking a compiled server test file. This documentation does not assert that ordering, inventory, payment processing, or other business features are implemented or production-ready.

## Prerequisites

- Node.js and npm compatible with the client and server manifests.
- Any external services or environment variables required by the client or server (inspect their configuration before starting).

## Local setup

```bash
git clone https://github.com/mruhegwu/agrodirect.git
cd agrodirect
npm install
npm install --prefix server
npm install --prefix client
npm run dev
```

The root development command starts both `server` and `client` using `concurrently`. Check the nested package manifests and configuration files for actual ports, prerequisites, and required environment variable names.

## Available root scripts

```bash
npm run dev
npm run dev:server
npm run dev:client
npm run build
npm run seed
npm test
```

The root `test` script points to `server/dist/test.js`, so build requirements and test coverage must be verified before relying on its results. Running `seed` may modify configured data; use a non-production database and review the seed implementation first.

## Deployment and security

Deployment provider, hosting configuration, database schema, and operational readiness have not been independently verified. Do not commit credentials, production connection strings, or `.env` files. Review client/server configuration, access controls, and payment/data handling before production use.

## Status

Documentation updated 2026-10-27. No production readiness or end-to-end feature verification is claimed.
