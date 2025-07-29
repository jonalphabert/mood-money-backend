import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email.service';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';

jest.mock('nodemailer');
jest.mock('fs');

describe('EmailService', () => {
  let service: EmailService;
  let configService: jest.Mocked<ConfigService>;
  let mockTransporter: jest.Mocked<nodemailer.Transporter>;

  beforeEach(async () => {
    mockTransporter = {
      sendMail: jest.fn(),
    } as any;

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
    (nodemailer.createTestAccount as jest.Mock).mockResolvedValue({
      user: 'test@ethereal.email',
      pass: 'testpass',
    });
    (nodemailer.getTestMessageUrl as jest.Mock).mockReturnValue(
      'https://ethereal.email/message/123',
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
  });

  describe('constructor', () => {
    it('should create SMTP transporter in production mode', () => {
      configService.get.mockImplementation((key, defaultValue) => {
        const values = {
          NODE_ENV: 'production',
          USE_ETHEREAL: 'false',
          SMTP_HOST: 'smtp.gmail.com',
          SMTP_PORT: 587,
          SMTP_USER: 'user@gmail.com',
          SMTP_PASS: 'password',
        };
        return values[key] || defaultValue;
      });

      new EmailService(configService);

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'user@gmail.com',
          pass: 'password',
        },
      });
    });

    it('should setup Ethereal transporter in test mode', async () => {
      configService.get.mockImplementation((key) => {
        return key === 'NODE_ENV' ? 'test' : undefined;
      });

      const emailService = new EmailService(configService);

      // Wait for async setup
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(nodemailer.createTestAccount).toHaveBeenCalled();
    });
  });

  describe('sendVerificationEmail', () => {
    beforeEach(() => {
      configService.get.mockImplementation((key, defaultValue) => {
        const values = {
          NODE_ENV: 'development',
          FROM_EMAIL: 'noreply@moodmoney.com',
        };
        return values[key] || defaultValue;
      });

      (fs.readFileSync as jest.Mock).mockReturnValue(
        '<html><body>Verify: {{VERIFICATION_URL}}</body></html>',
      );
    });

    it('should send verification email successfully', async () => {
      const email = 'test@example.com';
      const verificationUrl = 'http://localhost:3000/verify?code=123';

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      const result = await service.sendVerificationEmail(
        email,
        verificationUrl,
      );

      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('verification-email.html'),
        'utf8',
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@moodmoney.com',
        to: email,
        subject: 'Verify Your Email Address',
        html: '<html><body>Verify: http://localhost:3000/verify?code=123</body></html>',
      });

      expect(result).toEqual({ messageId: 'test-message-id' });
    });

    it('should replace verification URL placeholder', async () => {
      const email = 'test@example.com';
      const verificationUrl = 'http://example.com/verify?code=abc123';

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      await service.sendVerificationEmail(email, verificationUrl);

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.html).toContain('http://example.com/verify?code=abc123');
      expect(sentEmail.html).not.toContain('{{VERIFICATION_URL}}');
    });

    it('should log preview URL in test mode', async () => {
      configService.get.mockImplementation((key) => {
        return key === 'USE_ETHEREAL' ? 'true' : 'noreply@moodmoney.com';
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      await service.sendVerificationEmail(
        'test@example.com',
        'http://test.com',
      );

      expect(nodemailer.getTestMessageUrl).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Preview URL: %s',
        'https://ethereal.email/message/123',
      );

      consoleSpy.mockRestore();
    });

    it('should handle email sending errors', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'));

      await expect(
        service.sendVerificationEmail('test@example.com', 'http://test.com'),
      ).rejects.toThrow('SMTP Error');
    });

    it('should handle missing template file', async () => {
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('File not found');
      });

      await expect(
        service.sendVerificationEmail('test@example.com', 'http://test.com'),
      ).rejects.toThrow('File not found');
    });
  });
});
