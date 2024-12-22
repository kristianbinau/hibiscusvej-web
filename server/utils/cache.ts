import type { H3Event, EventHandlerResponse } from 'h3';
import { CachedEventHandlerOptions } from 'nitropack';

export const cacheOneWeek =
	(): CachedEventHandlerOptions<EventHandlerResponse> => ({
		maxAge: 60 * 60 * 24 * 7, // 1 week
	});

export const cacheOneDay =
	(): CachedEventHandlerOptions<EventHandlerResponse> => ({
		maxAge: 60 * 60 * 24, // 1 day
	});
