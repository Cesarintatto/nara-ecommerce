import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { getSitemap } from './controllers/sitemap.controller';

const app = express();

// Detrás del Load Balancer de Google + Cloud Run, la IP real de la clienta llega en
// X-Forwarded-For ("<cliente>, <load-balancer>"). Sin esto, req.ip sería la del proxy y
// el rate limit de abajo se compartiría entre TODAS las visitantes. 2 = LB + Cloud Run.
// En local no hay proxies (0). Se puede ajustar con TRUST_PROXY_HOPS.
const trustProxyHops = Number(
  process.env.TRUST_PROXY_HOPS ?? (process.env.NODE_ENV === 'production' ? 2 : 0),
);
app.set('trust proxy', trustProxyHops);

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

app.get('/sitemap.xml', getSitemap);

app.use('/api/v1', routes);

export { app };
