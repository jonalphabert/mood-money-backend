import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { GlobalExceptionFilter } from '../global-exception.filter';
import { NotFoundError, CustomDatabaseError } from 'src/utils/custom_error';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockHost: Partial<ArgumentsHost>;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      url: '/test',
      method: 'GET',
    };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    };

    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle NotFoundError correctly', () => {
    const exception = new NotFoundError('Currency not found');

    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      error: 'NotFoundError',
      message: 'Currency not found',
      path: '/test',
      timestamp: expect.any(String),
    });

    expect(console.error).toHaveBeenCalled();
  });

  it('should handle CustomDatabaseError correctly', () => {
    const exception = new CustomDatabaseError('DB connection failed');

    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'DatabaseError',
      message: 'Database operation failed',
      path: '/test',
      timestamp: expect.any(String),
    });
  });

  it('should handle BadRequestException correctly', () => {
    const exception = new BadRequestException('Invalid input');

    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'BadRequestException',
      message: 'Invalid input',
      path: '/test',
      timestamp: expect.any(String),
    });

    expect(console.error).toHaveBeenCalled();
  });

  it('should handle generic Error correctly', () => {
    const exception = new Error('Generic error');

    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Error',
      message: 'Generic error',
      path: '/test',
      timestamp: expect.any(String),
    });
  });

  //   it('should handle HttpException with getStatus() method', () => {
  //     const exception = {
  //       getStatus: jest.fn().mockReturnValue(HttpStatus.FORBIDDEN),
  //       message: 'Forbidden resource',
  //       name: 'ForbiddenException',
  //     };

  //     filter.catch(exception as any, mockHost as ArgumentsHost);

  //     expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
  //     expect(mockResponse.json).toHaveBeenCalledWith({
  //       statusCode: HttpStatus.FORBIDDEN,
  //       error: 'ForbiddenException',
  //       message: 'Forbidden resource',
  //       path: '/test',
  //       timestamp: expect.any(String),
  //     });
  //   });

  it('should handle unknown errors safely', () => {
    const exception = 'This is a string error';

    filter.catch(exception as any, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'InternalError',
      message: 'Internal server error',
      path: '/test',
      timestamp: expect.any(String),
    });
  });

  it('should extract message from BadRequestException response object', () => {
    const exception = new BadRequestException({
      message: ['Validation failed'],
      error: 'Bad Request',
      statusCode: 400,
    });

    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: ['Validation failed'],
      }),
    );
  });

  it('should extract message from BadRequestException response object', () => {
    const exception = new BadRequestException({
      message: ['Validation failed'],
      error: 'Bad Request',
      statusCode: 400,
    });

    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: ['Validation failed'],
      }),
    );
  });

  it('should handle generic errors', () => {
    const exception = new Error('Generic error');

    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Error',
        message: 'Generic error',
        path: '/test',
        timestamp: expect.any(String),
      }),
    );
  });
});
