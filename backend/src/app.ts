import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import routes from './routes';

const app = express();

app.use(helmet());
app.use(express.json());

const allowedOrigins = [process.env.CLIENT_URL, process.env.ADMIN_URL].filter(
  (origin): origin is string => Boolean(origin),
);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  }),
);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas peticiones, por favor intenta más tarde.' },
});
app.use('/api/', globalLimiter);

app.use('/api/v1', routes);

export { app };
