import Joi from 'joi';
import User from '../models/UserModel';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AuthFailureError, InternalError } from '../middleware/ApiError';
import { TOKEN_INFO } from '../config';
import UserHelper from './UserHelper';
import crypto from 'crypto';
import { Types } from 'mongoose';

const generateTokenKey = () => {
  return crypto.randomBytes(64).toString('hex');
};

const validateTokenData = (payload: JwtPayload): boolean => {
  if (
    !payload ||
    !payload.iss ||
    !payload.sub ||
    !payload.aud ||
    payload.iss !== TOKEN_INFO.issuer ||
    payload.aud !== TOKEN_INFO.audience ||
    !Types.ObjectId.isValid(payload.sub)
  )
    throw new AuthFailureError('Invalid Token');
  return true;
};

const createTokens = (user: User): Tokens => {
  const payload = {
    sub: user._id,
    email: user.email,
    name: UserHelper.fullName(user.firstname, user.lastname),
    iss: TOKEN_INFO.issuer,
    iat: Math.floor(Date.now() / 1000),
  };

  const options = {
    issuer: TOKEN_INFO.issuer,
    audience: TOKEN_INFO.audience,
  };

  const accessToken = jwt.sign(
    {
      ...payload,
      exp: TOKEN_INFO.accessTokenValidity,
    },
    TOKEN_INFO.accessTokenSecret,
    {
      ...options,
      expiresIn: TOKEN_INFO.accessTokenValidity,
    }
  );

  if (!accessToken) throw new InternalError();

  const refreshToken = jwt.sign(
    {
      ...payload,
      exp: TOKEN_INFO.refreshTokenValidity,
    },
    TOKEN_INFO.refreshTokenSecret,
    {
      ...options,
      expiresIn: TOKEN_INFO.refreshTokenValidity,
    }
  );
  if (!refreshToken) throw new InternalError();

  return {
    accessToken,
    refreshToken,
  } as Tokens;
};

export const AUTH_JOI_REFRESH_TOKEN_SCHEMA: Joi.ObjectSchema = Joi.object({
  refreshToken: Joi.string().required().min(1),
});

export default {
  createTokens,
  generateTokenKey,
  validateTokenData,
};
