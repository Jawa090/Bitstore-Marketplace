import jwt, { SignOptions } from 'jsonwebtoken';

export const generateAccessToken = (userId: string, role?: string) => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
  };

  return jwt.sign({ id: userId, role }, secret, options);
};

export const generateRefreshToken = (userId: string) => {
  const secret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
  
  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
  };

  return jwt.sign({ id: userId }, secret, options);
};
