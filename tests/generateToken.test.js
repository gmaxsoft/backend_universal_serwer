import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { generateToken } from '../src/utils/generateToken.js';

describe('generateToken', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      cookie: jest.fn(),
    };
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_EXPIRES_IN = '7d';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a token and set cookie', () => {
    const userId = 1;
    const mockToken = 'mock_token';
    jest.spyOn(jwt, 'sign').mockReturnValue(mockToken);

    const result = generateToken(userId, mockRes);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: userId },
      'test_secret',
      { expiresIn: '7d' }
    );
    expect(mockRes.cookie).toHaveBeenCalledWith('jwt', mockToken, {
      httpOnly: true,
      secure: false, // NODE_ENV is not production
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    expect(result).toBe(mockToken);
  });

  it('should use default expiresIn if not set', () => {
    delete process.env.JWT_EXPIRES_IN;
    const userId = 1;
    const mockToken = 'mock_token';
    jest.spyOn(jwt, 'sign').mockReturnValue(mockToken);

    generateToken(userId, mockRes);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: userId },
      'test_secret',
      { expiresIn: '7d' }
    );
  });
});