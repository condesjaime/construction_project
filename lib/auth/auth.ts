import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export interface AuthUserPayload extends jwt.JwtPayload {
  userId: string;
  email: string;
  status: string;
}

export function generateToken(
  payload: AuthUserPayload
) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h',
  });
}

export function verifyToken(
  token: string
): AuthUserPayload {

  try {

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    if (typeof decoded === 'string') {
      throw new Error('INVALID_TOKEN');
    }

    return decoded as AuthUserPayload;

  } catch (error: any) {

    if (
      error.name === 'TokenExpiredError'
    ) {
      throw new Error(
        'ACCESS_TOKEN_EXPIRED'
      );
    }

    throw new Error('INVALID_TOKEN');
  }
}

export function generateAccessToken(
  user: {
    userId: string;
    email: string;
    status: string;
  }
) {
  return jwt.sign(user, JWT_SECRET, {
    expiresIn: '15m',
  });
}

export function generateRefreshToken(
  user: {
    userId: string;
    email: string;
  }
) {
  return jwt.sign(user, REFRESH_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyAccessToken(
  token: string
) {
  return jwt.verify(token, JWT_SECRET);
}

export function verifyRefreshToken(
  token: string
) {
  return jwt.verify(token, REFRESH_SECRET);
}