import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Use different transporter based on environment
    if (
      this.configService.get('NODE_ENV') === 'test' ||
      this.configService.get('USE_ETHEREAL') === 'true'
    ) {
      // For testing - will be set up with Ethereal
      this.transporter = null as any;
      void this.setupEtherealTransporter();
    } else {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get('SMTP_HOST', 'localhost'),
        port: this.configService.get('SMTP_PORT', 587),
        secure: false,
        auth: {
          user: this.configService.get('SMTP_USER'),
          pass: this.configService.get('SMTP_PASS'),
        },
      });
    }
  }

  private async setupEtherealTransporter() {
    // Create Ethereal test account
    const testAccount = await nodemailer.createTestAccount();

    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('Ethereal Email Test Account Created:');
    console.log('User:', testAccount.user);
    console.log('Pass:', testAccount.pass);
  }

  async sendVerificationEmail(
    email: string,
    verificationUrl: string,
  ): Promise<void> {
    const templatePath = path.join(
      process.cwd(),
      'static',
      'verification-email.html',
    );
    let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholder with actual verification URL
    htmlTemplate = htmlTemplate.replaceAll(
      '{{VERIFICATION_URL}}',
      verificationUrl,
    );

    const mailOptions = {
      from: this.configService.get('FROM_EMAIL', 'noreply@moodmoney.com'),
      to: email,
      subject: 'Verify Your Email Address',
      html: htmlTemplate,
    };

    const info = await this.transporter.sendMail(mailOptions);

    // Log preview URL for Ethereal testing
    if (
      this.configService.get('NODE_ENV') === 'test' ||
      this.configService.get('USE_ETHEREAL') === 'true'
    ) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  }
}
