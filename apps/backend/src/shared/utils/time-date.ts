import { add } from "date-fns";


export const thirtyDaysFromNow = (): Date => {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}

export const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

export const fortyFiveMinutesFromNow = (): Date => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 45);
    return now;
}

export const calculateExpirationDate = (expiresIn: string = "15m"): Date => {
    const match = expiresIn.match(/^(\d+)([mhd])$/);
    if(!match) throw new Error('Invalid expiresIn format. use "15m", "1h" ' );
    const [, value, unit] = match;
    const expirationDate = new Date();

    switch (unit) {
        case "m": // minutes
            return add(expirationDate, { minutes: parseInt(value) });
        case "h": // hours
            return add(expirationDate, { hours: parseInt(value) });
        case "d": // days
            return add(expirationDate, { days: parseInt(value) });
        default:
            throw new Error('Invalid unit. use "m", "h", "d" ');
    }
}