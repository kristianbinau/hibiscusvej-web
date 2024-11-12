# Hibiscusvej - Web

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

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

Locally preview production build:

```bash
npm run build
npx wrangler dev .output/server/index.mjs --assets .output/public/
```

Deploy to Cloudflare Workers:

```bash
npx wrangler deploy
```
