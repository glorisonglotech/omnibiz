const nodemailer = require('nodemailer');

// Email configuration
const emailConfig = {
  // Gmail configuration (for development/testing)
  gmail: {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // Use App Password for Gmail
    }
  },
  
  // SMTP configuration (for production)
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  
  // Development configuration (Ethereal Email for testing)
  development: {
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'ethereal.user@ethereal.email',
      pass: 'ethereal.pass'
    }
  }
};

// Create transporter based on environment
const createTransporter = async () => {
  try {
    let config;
    
    // Choose config with guards and feedback
    if (process.env.NODE_ENV === 'production') {
      const hasSmtpCreds = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
      if (hasSmtpCreds) {
        config = emailConfig.smtp;
        console.log('📧 Email: using SMTP (production)');
      } else {
        console.warn('⚠️ Email: NODE_ENV=production but SMTP credentials are missing. Falling back to Ethereal test account.');
      }
    } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Use Gmail if credentials are provided
      config = emailConfig.gmail;
      console.log('📧 Email: using Gmail (development)');
    }

    if (!config) {
      // Use Ethereal for development/testing
      const testAccount = await nodemailer.createTestAccount();
      config = {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      };
      console.log('📧 Email: using Ethereal (auto-generated test account)');
      console.log('📧 Test account user:', testAccount.user);
    }
    
    const transporter = nodemailer.createTransport(config);
    
    // Verify connection
    await transporter.verify();
    console.log('📧 Email service connected successfully');
    
    return transporter;
  } catch (error) {
    console.error('❌ Email service connection failed:', error.message);
    console.error('❌ Email hint: check SMTP_HOST/SMTP_USER/SMTP_PASS for production or EMAIL_USER/EMAIL_PASS for Gmail.');
    return null;
  }
};

// Email templates
const emailTemplates = {
  // Order notifications
  orderCreated: (order, user) => ({
    subject: `Order Confirmation - ${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Order Confirmation</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for your order! We have received your order and it is being processed.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Total:</strong> $${order.total}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        
        <p>You will receive updates as your order progresses.</p>
        <p>Best regards,<br>OmniBiz Team</p>
      </div>
    `
  }),

  orderApproved: (order, user) => ({
    subject: `Order Approved - ${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Order Approved</h2>
        <p>Dear ${user.name},</p>
        <p>Great news! Your order has been approved and is now being processed.</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Admin Notes:</strong> ${order.adminNotes || 'No additional notes'}</p>
        </div>
        
        <p>We will keep you updated on the progress of your order.</p>
        <p>Best regards,<br>OmniBiz Team</p>
      </div>
    `
  }),

  orderRejected: (order, user) => ({
    subject: `Order Update - ${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Order Update Required</h2>
        <p>Dear ${user.name},</p>
        <p>We need to discuss some details about your order before we can proceed.</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Reason:</strong> ${order.rejectionReason || 'Please contact us for details'}</p>
        </div>
        
        <p>Please contact us to resolve any issues with your order.</p>
        <p>Best regards,<br>OmniBiz Team</p>
      </div>
    `
  }),

  // Service request notifications
  serviceRequestCreated: (serviceRequest, user) => ({
    subject: `Service Request Received - ${serviceRequest.requestId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Service Request Received</h2>
        <p>Dear ${user.name},</p>
        <p>We have received your service request and our team will review it shortly.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Request Details</h3>
          <p><strong>Request ID:</strong> ${serviceRequest.requestId}</p>
          <p><strong>Service Type:</strong> ${serviceRequest.serviceType}</p>
          <p><strong>Title:</strong> ${serviceRequest.title}</p>
          <p><strong>Priority:</strong> ${serviceRequest.priority}</p>
        </div>
        
        <p>We will respond to your request within 24 hours.</p>
        <p>Best regards,<br>OmniBiz Team</p>
      </div>
    `
  }),

  serviceRequestResponse: (serviceRequest, user) => ({
    subject: `Service Request Update - ${serviceRequest.requestId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Service Request Update</h2>
        <p>Dear ${user.name},</p>
        <p>We have reviewed your service request and have an update for you.</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Request Details</h3>
          <p><strong>Request ID:</strong> ${serviceRequest.requestId}</p>
          <p><strong>Status:</strong> ${serviceRequest.status}</p>
          <p><strong>Response:</strong> ${serviceRequest.adminResponse?.response || 'Please check your dashboard for details'}</p>
          ${serviceRequest.adminResponse?.estimatedCost ? `<p><strong>Estimated Cost:</strong> $${serviceRequest.adminResponse.estimatedCost}</p>` : ''}
          ${serviceRequest.adminResponse?.estimatedTimeline ? `<p><strong>Timeline:</strong> ${serviceRequest.adminResponse.estimatedTimeline}</p>` : ''}
        </div>
        
        <p>Please log in to your dashboard to view full details and respond.</p>
        <p>Best regards,<br>OmniBiz Team</p>
      </div>
    `
  }),

  // Admin notifications
  newOrderNotification: (order, client) => ({
    subject: `New Order Received - ${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">New Order Notification</h2>
        <p>A new order has been received and requires your attention.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Client:</strong> ${client.name} (${client.email})</p>
          <p><strong>Total:</strong> $${order.total}</p>
          <p><strong>Priority:</strong> ${order.priority}</p>
          <p><strong>Type:</strong> ${order.orderType}</p>
          ${order.requiresApproval ? '<p><strong>Status:</strong> Requires Approval</p>' : ''}
        </div>
        
        <p>Please log in to the admin dashboard to review and process this order.</p>
        <p>Best regards,<br>OmniBiz System</p>
      </div>
    `
  }),

  newServiceRequestNotification: (serviceRequest, client) => ({
    subject: `New Service Request - ${serviceRequest.requestId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">New Service Request</h2>
        <p>A new service request has been submitted and requires your attention.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Request Details</h3>
          <p><strong>Request ID:</strong> ${serviceRequest.requestId}</p>
          <p><strong>Client:</strong> ${client.name} (${client.email})</p>
          <p><strong>Service Type:</strong> ${serviceRequest.serviceType}</p>
          <p><strong>Title:</strong> ${serviceRequest.title}</p>
          <p><strong>Priority:</strong> ${serviceRequest.priority}</p>
        </div>
        
        <p>Please log in to the admin dashboard to review and respond to this request.</p>
        <p>Best regards,<br>OmniBiz System</p>
      </div>
    `
  })
};

// Email service functions
const emailService = {
  transporter: null,

  // Initialize email service
  async init() {
    this.transporter = await createTransporter();
    return this.transporter !== null;
  },

  // Send email
  async sendEmail(to, subject, html, attachments = []) {
    if (!this.transporter) {
      console.error('❌ Email service not initialized');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'OmniBiz <noreply@omnibiz.com>',
        to,
        subject,
        html,
        attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      // Log preview URL for Ethereal
      if (process.env.NODE_ENV !== 'production' && info.messageId) {
        console.log('📧 Email sent:', info.messageId);
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
      return false;
    }
  },

  // Send template email
  async sendTemplateEmail(templateName, to, data) {
    const template = emailTemplates[templateName];
    if (!template) {
      console.error(`❌ Email template '${templateName}' not found`);
      return false;
    }

    const { subject, html } = template(data.primary, data.user, data.additional);
    return await this.sendEmail(to, subject, html);
  }
};

module.exports = {
  emailService,
  emailTemplates
};
