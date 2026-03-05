# Hibiscusvej - Web

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Prerequisites

- NodeJS (v24.5.0)

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

## Commands

Generate migrations:

```bash
npm run db:generate
```

Check for TypeScript errors:

```bash
npm run types
```

Check for Lint errors:

```bash
npm run lint
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

## Aerial Pictures

We will need to update aerial video and pictures when construction is done.

We have used:

- [Google Earth Studio](https://www.google.com/earth/studio/), for the aerial video.
- [Skråfoto](https://skraafoto.dataforsyningen.dk/?center=586212.77294979%2C6139665.65069059&item=2023_83_36_1_0010_00001234&year=2023&orientation=nadir), is a good source for aerial pictures in Denmark.
- [Dataforsyningen](https://dataforsyningen.dk/map/981), yearly updated aerial pictures of Denmark.
