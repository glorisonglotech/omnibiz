const twilio = require('twilio');
const { emailService } = require('../config/email');

class NotificationService {
  constructor() {
    // Initialize Twilio client
    this.twilioClient = null;
    this.twilioInitialized = false;
    
    // Twilio credentials
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    
    // Check if Twilio is configured
    if (this.twilioAccountSid && this.twilioAuthToken && this.twilioPhoneNumber) {
      try {
        this.twilioClient = twilio(this.twilioAccountSid, this.twilioAuthToken);
        this.twilioInitialized = true;
        console.log('✅ Twilio SMS service initialized');
      } catch (error) {
        console.error('❌ Twilio initialization error:', error.message);
      }
    } else {
      console.warn('⚠️  Twilio SMS service not configured (missing environment variables)');
    }
  }

  /**
   * Send SMS via Twilio
   * @param {Object} options - SMS options
   * @param {string} options.to - Recipient phone number (E.164 format: +254...)
   * @param {string} options.message - SMS message content
   * @returns {Promise<Object>} SMS result
   */
  async sendSMS({ to, message }) {
    if (!this.twilioInitialized) {
      console.warn('SMS service not available, skipping SMS to:', to);
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }

    try {
      // Validate phone number format
      if (!to || !to.startsWith('+')) {
        throw new Error('Phone number must be in E.164 format (e.g., +254712345678)');
      }

      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to: to
      });

      console.log(`✅ SMS sent successfully to ${to}. SID: ${result.sid}`);
      
      return {
        success: true,
        sid: result.sid,
        status: result.status,
        to: result.to
      };
    } catch (error) {
      console.error(`❌ SMS sending failed to ${to}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send Email via Nodemailer
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML content
   * @param {string} options.text - Plain text content (optional)
   * @returns {Promise<Object>} Email result
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      const result = await emailService.sendMail({
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '') // Strip HTML if no text provided
      });

      console.log(`✅ Email sent successfully to ${to}`);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error(`❌ Email sending failed to ${to}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send notification via multiple channels
   * @param {Object} options - Notification options
   * @param {Object} options.user - User object with contact preferences
   * @param {string} options.title - Notification title
   * @param {string} options.message - Notification message
   * @param {string} options.type - Notification type (order, appointment, payment, etc.)
   * @returns {Promise<Object>} Results from all channels
   */
  async sendMultiChannelNotification({ user, title, message, type }) {
    const results = {
      email: null,
      sms: null
    };

    // Send email if user has enabled email notifications
    if (user.email && user.emailNotifications !== false) {
      const emailHtml = `
        <h2>${title}</h2>
        <p>Hi ${user.name},</p>
        <p>${message}</p>
        <p>Best regards,<br>OmniBiz Team</p>
      `;

      results.email = await this.sendEmail({
        to: user.email,
        subject: `${title} - OmniBiz`,
        html: emailHtml
      });
    }

    // Send SMS if user has enabled SMS notifications and has phone number
    if (user.phone && user.smsNotifications === true) {
      const smsMessage = `${title}\n\n${message}\n\n- OmniBiz`;
      
      results.sms = await this.sendSMS({
        to: user.phone,
        message: smsMessage
      });
    }

    return results;
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(appointment, user) {
    const appointmentTime = new Date(appointment.time).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    return this.sendMultiChannelNotification({
      user,
      title: 'Appointment Reminder',
      message: `You have an upcoming appointment for "${appointment.service}" on ${appointmentTime}. Duration: ${appointment.durationMinutes} minutes.`,
      type: 'appointment'
    });
  }

  /**
   * Send order confirmation
   */
  async sendOrderConfirmation(order, user) {
    return this.sendMultiChannelNotification({
      user,
      title: 'Order Confirmed',
      message: `Your order #${order.orderNumber || order._id} has been confirmed. Total: ${order.currency} ${order.totalAmount}. We'll notify you when it's ready.`,
      type: 'order'
    });
  }

  /**
   * Send payment confirmation
   */
  async sendPaymentConfirmation(payment, user) {
    return this.sendMultiChannelNotification({
      user,
      title: 'Payment Received',
      message: `We've received your payment of ${payment.currency} ${payment.amount}. Transaction ID: ${payment.transactionId}. Thank you!`,
      type: 'payment'
    });
  }

  /**
   * Send invoice
   */
  async sendInvoice(invoice, user) {
    const dueDate = new Date(invoice.dueDate).toLocaleDateString();
    
    return this.sendMultiChannelNotification({
      user,
      title: 'New Invoice',
      message: `Invoice #${invoice.invoiceNumber} has been generated. Amount: ${invoice.currency} ${invoice.totalAmount}. Due date: ${dueDate}.`,
      type: 'invoice'
    });
  }

  /**
   * Send custom notification
   */
  async sendCustomNotification({ user, title, message, includeEmail = true, includeSMS = false }) {
    const results = {};

    if (includeEmail && user.email) {
      results.email = await this.sendEmail({
        to: user.email,
        subject: `${title} - OmniBiz`,
        html: `
          <h2>${title}</h2>
          <p>Hi ${user.name},</p>
          <p>${message}</p>
          <p>Best regards,<br>OmniBiz Team</p>
        `
      });
    }

    if (includeSMS && user.phone) {
      results.sms = await this.sendSMS({
        to: user.phone,
        message: `${title}\n\n${message}\n\n- OmniBiz`
      });
    }

    return results;
  }

  /**
   * Send verification code
   */
  async sendVerificationCode(user, code, type = 'email') {
    const message = `Your OmniBiz verification code is: ${code}. This code will expire in 10 minutes. Do not share this code with anyone.`;

    if (type === 'email' && user.email) {
      return this.sendEmail({
        to: user.email,
        subject: 'Verification Code - OmniBiz',
        html: `
          <h2>Verification Code</h2>
          <p>Hi ${user.name},</p>
          <p>Your verification code is:</p>
          <h1 style="font-size: 32px; font-weight: bold; color: #16a34a; letter-spacing: 5px;">${code}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Best regards,<br>OmniBiz Team</p>
        `
      });
    }

    if (type === 'sms' && user.phone) {
      return this.sendSMS({
        to: user.phone,
        message
      });
    }

    return { success: false, error: 'Invalid verification type or missing contact info' };
  }
}

// Create singleton instance
const notificationService = new NotificationService();

module.exports = {
  notificationService,
  NotificationService
};
