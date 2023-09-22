import asyncHandler from 'express-async-handler';
import Logger from '../middleware/Logger';
import {
  SuccessResponse,
  TokenRefreshResponse,
} from '../middleware/ApiResponse';
import UserHelper from '../helpers/UserHelper';
import { AuthFailureError, BadRequestError } from '../middleware/ApiError';
import bcrypt from 'bcrypt';
import AuthHelper from '../helpers/AuthHelper';
import { COOKIE, TOKEN_INFO } from '../config';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';

class AuthController {
  test = asyncHandler(async (req, res) => {
    Logger.info('User test');

    new SuccessResponse('Test successfully!', {}).send(res);
  });

  login = asyncHandler(async (req, res) => {
    const user = await UserHelper.findByEmail(req.body.email);
    if (!user || !user.password)
      throw new BadRequestError(
        'Your email address or your password is incorrect'
      );

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) throw new AuthFailureError('Your credentials are incorrect');

    const tokens: Tokens = AuthHelper.createTokens(user);

    // create secure cookie with refresh token
    res.cookie(COOKIE.login, tokens.refreshToken, {
      httpOnly: true, // //accessible only by web server
      secure: true, // https
      sameSite: true, // cross-site cookie
      signed: true, // signed
      maxAge: COOKIE.maxAge, // cookie expiry: set to match refreshTokenValidity
    });

    new SuccessResponse('User logged in successfully', {
      accessToken: tokens.accessToken,
    }).send(res);
  });

  refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = (req.cookies && req.cookies[COOKIE.login]) ?? null;

    if (!refreshToken) {
      throw new AuthFailureError('Invalid Authorization');
    }

    const refreshTokenPayload = jwt.verify(
      refreshToken,
      TOKEN_INFO.refreshTokenSecret
    );
    AuthHelper.validateTokenData(<JwtPayload>refreshTokenPayload);

    const user = await UserHelper.findById(
      new Types.ObjectId((<JwtPayload>refreshTokenPayload).sub)
    );
    if (!user) throw new AuthFailureError('Unauthorized');

    const tokens: Tokens = AuthHelper.createTokens(user);

    new TokenRefreshResponse('Token Issued', tokens.accessToken).send(res);
  });

  register = asyncHandler(async (req, res) => {
    Logger.info('User registration');
  });

  logout = asyncHandler(async (req, res) => {
    Logger.info('User logged out successfully!');
  });
}

export default new AuthController();
