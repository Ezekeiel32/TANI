export const logger = {
  info: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') console.log('[INFO]', ...args);
  },
  error: (...args: any[]) => console.error('[ERROR]', ...args),
};


