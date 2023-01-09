import createLogger from 'pino';
import dayjs from 'dayjs';

export const logger = createLogger({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
        },
    },
    base: {
        pid: false,
    },
    timestamp: () => `, "time":"${dayjs().format()}"`,
});
