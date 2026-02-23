import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/error-handler.js';
import { readLimiter } from './middleware/rate-limiter.js';
import healthRoutes from './routes/health.js';
import kpiRoutes from './routes/kpis.js';
import trendRoutes from './routes/trends.js';
import comparisonRoutes from './routes/comparisons.js';
import insightRoutes from './routes/insights.js';
import shiftRoutes from './routes/shifts.js';
import configRoutes from './routes/config.js';
import collectRoutes from './routes/collect.js';
import teamRoutes from './routes/teams.js';

const app: Express = express();
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
    hsts: NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false,
  }),
);

// CORS
const allowedOrigins =
  NODE_ENV === 'production'
    ? [process.env.DASHBOARD_URL || 'http://localhost:3000']
    : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(readLimiter);

// Routes
app.use(healthRoutes);
app.use(kpiRoutes);
app.use(trendRoutes);
app.use(comparisonRoutes);
app.use(insightRoutes);
app.use(shiftRoutes);
app.use(configRoutes);
app.use(collectRoutes);
app.use(teamRoutes);

// Ping
app.get('/api/ping', (_req, res) => {
  res.json({ status: 'ok' });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`DevPulse server running on port ${PORT}`);
});

export default app;
