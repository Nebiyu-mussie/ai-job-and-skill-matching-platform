import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    const errorMsg = '❌ CRITICAL: MONGODB_URI environment variable is not defined';
    console.error(errorMsg);
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Log connection attempt (mask password in URI)
  const maskedURI = mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.log(`🔌 Attempting MongoDB connection to: ${maskedURI}`);
  logger.info(`Attempting MongoDB connection to: ${maskedURI}`);

  const options = {
    autoIndex: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000, // Increased from 5s to 10s for Render cold starts
    socketTimeoutMS: 45000,
    family: 4,
  };

  // Event: Successfully connected
  mongoose.connection.on('connected', () => {
    const msg = '✅ Mongoose successfully connected to MongoDB';
    console.log(msg);
    logger.info(msg);
    console.log(`📊 Database Name: ${mongoose.connection.name}`);
    console.log(`📡 Connection State: ${getConnectionState(mongoose.connection.readyState)}`);
  });

  // Event: Connection error (after initial connection)
  mongoose.connection.on('error', (err) => {
    const errorMsg = '❌ Mongoose connection error (ongoing):';
    console.error(errorMsg, err);
    logger.error(errorMsg, err);
    
    // Check if it's a MongoDB Atlas IP whitelist issue
    if (err.message && err.message.includes('bad auth')) {
      console.error('🔒 Authentication failed - Check your MongoDB credentials');
    }
    if (err.message && (err.message.includes('ECONNREFUSED') || err.message.includes('connection refused'))) {
      console.error('🚫 Connection refused - MongoDB server may be unreachable');
    }
    if (err.message && err.message.includes('timeout')) {
      console.error('⏱️  Connection timeout - Check MongoDB Atlas IP whitelist or network access');
    }
  });

  // Event: Disconnected
  mongoose.connection.on('disconnected', () => {
    const msg = '⚠️  Mongoose disconnected from MongoDB';
    console.warn(msg);
    logger.warn(msg);
    console.log(`📡 Connection State: ${getConnectionState(mongoose.connection.readyState)}`);
  });

  // Event: Reconnected
  mongoose.connection.on('reconnected', () => {
    const msg = '🔄 Mongoose reconnected to MongoDB';
    console.log(msg);
    logger.info(msg);
  });

  // Event: Reconnect failed
  mongoose.connection.on('reconnectFailed', () => {
    const msg = '❌ Mongoose reconnection failed';
    console.error(msg);
    logger.error(msg);
  });

  try {
    // Attempt connection with explicit error catching
    await mongoose.connect(mongoURI, options);
    console.log('✅ Initial mongoose.connect() completed successfully');
  } catch (err: any) {
    const errorMsg = '❌ CRITICAL: Failed to connect to MongoDB on initial attempt';
    console.error(errorMsg);
    console.error('Error details:', err);
    logger.error(errorMsg, err);
    
    // Provide detailed diagnostics
    if (err.message) {
      console.error(`📝 Error Message: ${err.message}`);
      
      if (err.message.includes('bad auth') || err.message.includes('authentication failed')) {
        console.error('\n🔐 DIAGNOSIS: Authentication Failed');
        console.error('   - Check MONGODB_URI username and password');
        console.error('   - Verify MongoDB Atlas user has correct permissions');
        console.error('   - Ensure special characters in password are URL-encoded');
      } else if (err.message.includes('timeout') || err.message.includes('ETIMEDOUT')) {
        console.error('\n⏱️  DIAGNOSIS: Connection Timeout');
        console.error('   - MongoDB Atlas may be blocking this IP address');
        console.error('   - Add 0.0.0.0/0 to Network Access in MongoDB Atlas (allows all IPs)');
        console.error('   - OR add your specific Render IP to the whitelist');
        console.error('   - Check if MongoDB cluster is paused or sleeping');
      } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
        console.error('\n🌐 DIAGNOSIS: DNS Resolution Failed');
        console.error('   - Check MONGODB_URI hostname is correct');
        console.error('   - Verify internet connectivity from Render');
      } else if (err.message.includes('ECONNREFUSED')) {
        console.error('\n🚫 DIAGNOSIS: Connection Refused');
        console.error('   - MongoDB server is not accepting connections');
        console.error('   - Check if MongoDB cluster is running');
      }
    }
    
    throw err; // Re-throw to be caught by server.ts
  }
};

// Helper function to get human-readable connection state
function getConnectionState(state: number): string {
  const states: { [key: number]: string } = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized',
  };
  return states[state] || 'unknown';
}

// Export helper to check database health
export const checkDatabaseHealth = (): { connected: boolean; state: string; name?: string } => {
  const state = mongoose.connection.readyState;
  return {
    connected: state === 1,
    state: getConnectionState(state),
    name: state === 1 ? mongoose.connection.name : undefined,
  };
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};
