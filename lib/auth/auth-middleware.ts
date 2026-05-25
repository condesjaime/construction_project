import { NextRequest } from 'next/server';

import { verifyToken } from './auth';

export function getUserFromRequest(
  request: NextRequest
) {

  const authHeader =
    request.headers.get('Authorization');

  if (!authHeader) {
    throw new Error('UNAUTHORIZED');
  }

  const token = authHeader.replace(
    'Bearer ',
    ''
  );

  if (!token) {
    throw new Error('UNAUTHORIZED');
  }

  return verifyToken(token);
}