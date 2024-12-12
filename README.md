# Hibiscusvej - Web

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Prerequisites

- NodeJS (v22.11.0)

## Setup

Make sure to install dependencies:

```bash
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Preview deployment:

```bash
npx nuxthub preview
```

Deploy to production:

```bash
npx nuxthub deploy
```

## Commands

Generate migrations:

```bash
npm run db:generate
```

Check for TypeScript errors:

```bash
npx nuxi typecheck
```

Format code:

```bash
npm run format
```

Check for dependencies updates:

```bash
npm run update-dependencies
```

Update dependencies:

```bash
npm run update-dependencies -- -u
```
