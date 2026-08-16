import express from 'express';
import cors from 'cors';
import { config } from './config';
import { initDatabase } from './db';
import { runSeed } from './seed';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/authRoutes';
import farmerRoutes from './routes/farmerRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import logisticsRoutes from './routes/logisticsRoutes';
import walletRoutes from './routes/walletRoutes';
import settlementRoutes from './routes/settlementRoutes';
import disputeRoutes from './routes/disputeRoutes';
import reviewRoutes from './routes/reviewRoutes';
import bulkOrderRoutes from './routes/bulkOrderRoutes';
import adminRoutes from './routes/adminRoutes';
import notificationRoutes from './routes/notificationRoutes';

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'AgroDirect API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/bulk-orders', bulkOrderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use(errorHandler);

// Start server and initialize database
async function startServer() {
  try {
    initDatabase();
    await runSeed();

    app.listen(config.port, () => {
      console.log(`🚀 AgroDirect Backend API is running on http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
