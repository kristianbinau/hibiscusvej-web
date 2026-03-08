import { sentryCloudflareNitroPlugin } from '@sentry/nuxt/module/plugins';

export default defineNitroPlugin(
	sentryCloudflareNitroPlugin({
		dsn: 'https://dbd7afe46617456824df2a9eae0b88f2@o430463.ingest.us.sentry.io/4508625110827008',
		tracesSampleRate: 1.0,
	}),
);
