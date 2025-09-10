import nodemailer from 'nodemailer';
import { EmailTemplate, EmailTemplateService } from './email-templates';
import { Quote, Customer, User } from '@prisma/client';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: Array<{
    filename: string;
    path: string;
    contentType?: string;
  }>;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || ''
      }
    };

    this.transporter = nodemailer.createTransport(config);
  }

  private async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: `"Trakya Solar" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments || []
      });

      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendQuoteDeliveryEmail(
    quote: Quote & { customer: Customer | null; createdBy: User },
    customerEmail: string,
    customerName: string,
    companyName: string,
    pdfPath?: string
  ): Promise<boolean> {
    const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/quotes/public/${quote.deliveryToken}`;
    
    const templateData = {
      quote,
      customerName,
      companyName,
      viewUrl
    };

    const template = EmailTemplateService.getQuoteDeliveryTemplate(templateData);
    
    const attachments = [];
    if (pdfPath) {
      attachments.push({
        filename: `Teklif-${quote.quoteNumber}.pdf`,
        path: pdfPath,
        contentType: 'application/pdf'
      });
    }

    return this.sendEmail({
      to: customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      attachments
    });
  }

  async sendQuoteStatusNotification(
    quote: Quote & { customer: Customer | null; createdBy: User },
    customerName: string,
    companyName: string,
    status: 'viewed' | 'approved' | 'rejected'
  ): Promise<boolean> {
    const templateData = {
      quote,
      customerName,
      companyName,
      viewUrl: ''
    };

    let template: EmailTemplate;
    
    switch (status) {
      case 'viewed':
        template = EmailTemplateService.getQuoteViewedNotificationTemplate(templateData);
        break;
      case 'approved':
        template = EmailTemplateService.getQuoteApprovedNotificationTemplate(templateData);
        break;
      case 'rejected':
        template = EmailTemplateService.getQuoteRejectedNotificationTemplate(templateData);
        break;
    }

    return this.sendEmail({
      to: quote.createdBy.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendQuoteExpiryWarning(
    quote: Quote & { customer: Customer | null; createdBy: User },
    customerName: string,
    companyName: string
  ): Promise<boolean> {
    const templateData = {
      quote,
      customerName,
      companyName,
      viewUrl: ''
    };

    const template = EmailTemplateService.getQuoteExpiryWarningTemplate(templateData);

    return this.sendEmail({
      to: quote.createdBy.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP connection test failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();