// Email template helper for consistent, professional emails

export const emailTemplates = {
  // Welcome email for new registration
  welcomeEmail: (userName, appUrl) => ({
    subject: 'Welcome to DeliveryTracker!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin-top: 10px; }
            .footer { text-align: center; padding: 10px; font-size: 12px; color: #666; border-top: 1px solid #ddd; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 Welcome to DeliveryTracker</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              <p>Thank you for registering with DeliveryTracker! Your account is now active and ready to use.</p>
              <p>You can now:</p>
              <ul>
                <li>Track your packages in real-time</li>
                <li>View delivery history and analytics</li>
                <li>Receive instant notifications</li>
                <li>Manage multiple deliveries</li>
              </ul>
              <p>
                <a href="${appUrl}/dashboard" class="button">Go to Dashboard</a>
              </p>
              <p>If you have any questions, feel free to contact us.</p>
              <p>Best regards,<br/>The DeliveryTracker Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 DeliveryTracker. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Welcome to DeliveryTracker, ${userName}! Your account is now active.`
  }),

  // Package created notification
  packageCreatedEmail: (trackingNumber, senderName, recipientName, estimatedDelivery, trackingUrl) => ({
    subject: `Package Created: ${trackingNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; background: #f9f9f9; }
            .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin-top: 10px; }
            .footer { text-align: center; padding: 10px; font-size: 12px; color: #666; border-top: 1px solid #ddd; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 Package Shipment Created</h1>
            </div>
            <div class="content">
              <p>Your package has been successfully created in our system!</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0;">Tracking Number</h3>
                <p style="font-size: 24px; font-weight: bold; color: #667eea; margin: 10px 0;">${trackingNumber}</p>
              </div>

              <div class="info-box">
                <h3 style="margin-top: 0;">Package Details</h3>
                <p><strong>From:</strong> ${senderName}</p>
                <p><strong>To:</strong> ${recipientName}</p>
                <p><strong>Estimated Delivery:</strong> ${new Date(estimatedDelivery).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              <p>
                <a href="${trackingUrl}" class="button">Track Your Package</a>
              </p>
              
              <p>You will receive updates as your package progresses through our delivery network.</p>
              <p>Best regards,<br/>The DeliveryTracker Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 DeliveryTracker. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Package ${trackingNumber} created for shipment to ${recipientName}`
  }),

  // Package status update notification
  packageStatusUpdateEmail: (trackingNumber, status, location, trackingUrl) => ({
    subject: `Package Update: ${trackingNumber} - ${status.replace(/_/g, ' ').toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; background: #f9f9f9; }
            .status-box { background: white; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin-top: 10px; }
            .footer { text-align: center; padding: 10px; font-size: 12px; color: #666; border-top: 1px solid #ddd; margin-top: 20px; }
            .status-label { display: inline-block; padding: 8px 16px; background: #10b981; color: white; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📍 Package Status Update</h1>
            </div>
            <div class="content">
              <p>Great news! Your package has been updated.</p>
              
              <div class="status-box">
                <h3 style="margin-top: 0;">Tracking Number</h3>
                <p style="font-size: 24px; font-weight: bold; color: #667eea; margin: 10px 0;">${trackingNumber}</p>
                <div class="status-label">${status.replace(/_/g, ' ').toUpperCase()}</div>
              </div>

              <div class="status-box">
                <h3 style="margin-top: 0;">Current Location</h3>
                <p><strong>${location}</strong></p>
                <p style="color: #666;">Updated at ${new Date().toLocaleString()}</p>
              </div>

              <p>
                <a href="${trackingUrl}" class="button">View Full Details</a>
              </p>
              
              <p>You will receive further updates as your package progresses.</p>
              <p>Best regards,<br/>The DeliveryTracker Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 DeliveryTracker. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Package ${trackingNumber} status updated to ${status.replace(/_/g, ' ')} at ${location}`
  }),

  // Delivery completed notification
  deliveryCompletedEmail: (trackingNumber, recipientName, trackingUrl) => ({
    subject: `Package Delivered: ${trackingNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; background: #f9f9f9; }
            .success-box { background: white; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0; text-align: center; }
            .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 4px; margin-top: 10px; }
            .footer { text-align: center; padding: 10px; font-size: 12px; color: #666; border-top: 1px solid #ddd; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Package Delivered!</h1>
            </div>
            <div class="content">
              <div class="success-box">
                <h2 style="margin: 10px 0; color: #10b981;">Your package has been successfully delivered!</h2>
                <p style="font-size: 18px; font-weight: bold; color: #667eea; margin: 15px 0;">${trackingNumber}</p>
                <p>Delivered to <strong>${recipientName}</strong></p>
              </div>

              <p>Thank you for using DeliveryTracker. Your package delivery is complete.</p>
              <p>
                <a href="${trackingUrl}" class="button">View Delivery Details</a>
              </p>
              
              <p>If you have any feedback or concerns, please don't hesitate to contact us.</p>
              <p>Best regards,<br/>The DeliveryTracker Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 DeliveryTracker. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Your package ${trackingNumber} has been successfully delivered to ${recipientName}`
  }),

  // Delivery failed notification
  deliveryFailedEmail: (trackingNumber, reason, trackingUrl) => ({
    subject: `Delivery Issue: ${trackingNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; background: #f9f9f9; }
            .warning-box { background: white; padding: 15px; border-left: 4px solid #ef4444; margin: 15px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 4px; margin-top: 10px; }
            .footer { text-align: center; padding: 10px; font-size: 12px; color: #666; border-top: 1px solid #ddd; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Delivery Issue</h1>
            </div>
            <div class="content">
              <p>We encountered an issue with your package delivery.</p>
              
              <div class="warning-box">
                <h3 style="margin-top: 0;">Tracking Number</h3>
                <p style="font-size: 24px; font-weight: bold; color: #ef4444; margin: 10px 0;">${trackingNumber}</p>
              </div>

              <div class="warning-box">
                <h3 style="margin-top: 0;">Issue Details</h3>
                <p><strong>${reason}</strong></p>
                <p>Our team is working to resolve this issue. Please check back for updates.</p>
              </div>

              <p>
                <a href="${trackingUrl}" class="button">View Package Details</a>
              </p>
              
              <p>For assistance, please contact our support team immediately.</p>
              <p>Best regards,<br/>The DeliveryTracker Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 DeliveryTracker. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `An issue occurred with package ${trackingNumber}: ${reason}`
  })
};

export default emailTemplates;
