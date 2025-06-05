import mongoose from 'mongoose';

// Cache the connection to avoid multiple connections in development
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDb = (handler) => async (req, res) => {
  try {
    // If we have a cached connection, use it
    if (cached.conn) {
      return handler(req, res);
    }

    // Set connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    if (!process.env.MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable');
    }

    // Create a new connection if one doesn't exist
    if (!cached.promise) {
      cached.promise = mongoose.connect(process.env.MONGODB_URI, options);
    }

    try {
      // Wait for the connection to be established
      cached.conn = await cached.promise;
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      cached.promise = null; // Clear the promise to allow retry
      return res.status(500).json({ success: false, message: 'Database connection failed' });
    }

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      cached.conn = null;
      cached.promise = null;
    });

    // Call the handler
    return handler(req, res);
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default connectDb;