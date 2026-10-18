const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const resolveDateTime  = (input) => {
    if (input === undefined || input === null || input === '') {
        return undefined;
    }

    // Date only, e.g. "2026-10-18"
    if (typeof input === 'string' && DATE_ONLY_REGEX.test(input.trim())) {
        const [year, month, day] = input.trim().split('-').map(Number);
        const now = new Date();

        // Build in UTC so the stored value is consistent regardless of server timezone
        const result = new Date(Date.UTC(
            year,
            month - 1,
            day,
            now.getUTCHours(),
            now.getUTCMinutes(),
            now.getUTCSeconds(),
            now.getUTCMilliseconds()
        ));

        // Guards against rollover like "2026-02-31"
        if (
            result.getUTCFullYear() !== year ||
            result.getUTCMonth() !== month - 1 ||
            result.getUTCDate() !== day
        ) {
            return null;
        }

        return result;
    }

    // Full date-time, e.g. "2026-10-18T14:30:00Z" or "2026-10-18 14:30"
    const parsed = new Date(input);
    return isNaN(parsed.getTime()) ? null : parsed;
};

const parseBoundary = (input, isEnd) => {
    if (input === undefined || input === null || input === '') {
        return undefined; // not provided
    }

    // Date only, e.g. "2026-10-18"
    if (typeof input === 'string' && DATE_ONLY_REGEX.test(input.trim())) {
        const [year, month, day] = input.trim().split('-').map(Number);

        // fromDate -> start of day, toDate -> end of day (so toDate is inclusive)
        const result = isEnd
            ? new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))
            : new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

        // Guards against rollover like "2026-02-31"
        if (
            result.getUTCFullYear() !== year ||
            result.getUTCMonth() !== month - 1 ||
            result.getUTCDate() !== day
        ) {
            return null;
        }

        return result;
    }

    // Full date-time
    const parsed = new Date(input);
    return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Returns { from, to, error }
 * from / to are Date objects or undefined (when not provided)
 */
export const resolveDateRange = (fromDate, toDate) => {
    const from = parseBoundary(fromDate, false);
    const to = parseBoundary(toDate, true);

    if (from === null) return { error: 'Invalid fromDate' };
    if (to === null) return { error: 'Invalid toDate' };

    if (from && to && from > to) {
        return { error: 'fromDate cannot be after toDate' };
    }

    return { from, to };
};