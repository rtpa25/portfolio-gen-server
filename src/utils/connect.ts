import { connect } from 'mongoose';
import { logger } from './logger';

export const connectToDB = async () => {
  const dbUri = process.env.DB_URI || '';
  try {
    if (dbUri.length === 0) {
      await connect('mongodb://127.0.0.1:27017', {
        dbName: 'portfolio-gen',
      });
    } else {
      logger.info(`trying to connect to database: ${dbUri}`);
      await connect(dbUri);
    }
    logger.info('connected to DB 😎');
  } catch (e) {
    logger.error('error while connecting to DB', e);
    process.exit(1);
  }
};
