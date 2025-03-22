import type { EventHandlerResponse } from 'h3';
import { type CachedEventHandlerOptions } from 'nitropack';

export const cacheOneWeek =
	(): CachedEventHandlerOptions<EventHandlerResponse> => ({
		maxAge: 60 * 60 * 24 * 7, // 1 week
	});

export const cacheOneDay =
	(): CachedEventHandlerOptions<EventHandlerResponse> => ({
		maxAge: 60 * 60 * 24, // 1 day
	});
