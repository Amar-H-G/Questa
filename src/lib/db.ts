import mongoose, { ConnectOptions } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "⚠️ Please define the MONGODB_URI environment variable in .env.local"
  );
}

// Configure Mongoose to suppress warnings
mongoose.set("debug", false);
mongoose.set("strictQuery", true); // Recommended for Next.js compatibility

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend Node.js global to hold a cache across hot reloads
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache;
}

const globalCache = global as typeof globalThis & {
  _mongooseCache?: MongooseCache;
};

if (!globalCache._mongooseCache) {
  globalCache._mongooseCache = { conn: null, promise: null };
}

const cached = globalCache._mongooseCache;

export async function connectToDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const options: ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    };

    try {
      cached.promise = mongoose
        .connect(MONGODB_URI as string, options)
        .then((mongoose) => {
          console.log("✅ MongoDB connection established");
          return mongoose;
        });
    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      throw error;
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Clear the promise on error to allow retries
    throw error;
  }

  return cached.conn;
}

// Optional: Add error handlers for connection events
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {});

mongoose.connection.on("reconnected", () => {});
