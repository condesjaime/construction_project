import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');

  const passwordHash = await bcrypt.hash(
    password + salt,
    SALT_ROUNDS
  );

  return {
    passwordHash,
    passwordSalt: salt,
  };
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
  passwordSalt: string
) {
  return bcrypt.compare(
    password + passwordSalt,
    passwordHash
  );
}