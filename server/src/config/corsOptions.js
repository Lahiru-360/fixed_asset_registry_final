const allowedOrigins = [
  "http://localhost:5173", // Vite frontend
  "http://localhost:3000", // React or fallback
  process.env.FRONTEND_URL,
  // Add production URL here later:
  // "https://your-production-domain.com",
];

export const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },

  credentials: true, // Allow cookies / tokens
  optionsSuccessStatus: 200,
};
