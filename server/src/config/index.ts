import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: (() => {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) throw new Error('JWT_SECRET must be set to at least 32 characters');
    return secret;
  })(),
  jwtExpiresIn: '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  platformDefaults: {
    platformFeePercentage: 0.05, // 5% default marketplace fee
    settlementDelayHours: 24, // 24h after delivery confirmation
    minimumWithdrawalAmount: 5000, // ₦5,000 min withdrawal
  },
  nigerianStates: [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
    'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ]
};
