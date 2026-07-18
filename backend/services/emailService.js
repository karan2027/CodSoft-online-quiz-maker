const nodemailer = require("nodemailer");
const dns = require("dns");

// Force Node.js to prefer IPv4 over IPv6 when resolving hostnames (resolves SMTP connection issues on Render)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

/**
 * Configure the Nodemailer transporter using environment variables.
 * This instance is kept private to this module.
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true" || process.env.EMAIL_PORT == 465, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4,
});

/**
 * Verify the transporter connection on initialization.
 * Logs success or failure without crashing the application.
 */
transporter.verify((error, success) => {
  if (error) {
    console.error(` [Email Service]: Transporter verification failed - ${error.message}`);
  } else {
    console.log(" [Email Service]: Transporter is ready to send messages");
  }
});

// Common inline CSS styles for consistent email branding
const styles = {
  container: "font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;",
  header: "background-color: #4CAF50; color: white; padding: 15px; text-align: center; border-radius: 6px 6px 0 0;",
  body: "padding: 20px; color: #333333; line-height: 1.6;",
  otp: "font-size: 24px; font-weight: bold; color: #4CAF50; letter-spacing: 2px; text-align: center; margin: 20px 0;",
  footer: "margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777777; text-align: center;",
};

/**
 * Sends an email containing a One-Time Password (OTP).
 * 
 * @param {string} email - The recipient's email address.
 * @param {string} otp - The 6-digit OTP to send.
 * @returns {Promise<Object>} Success or failure status object.
 */
const sendOTPEmail = async (email, otp) => {
  try {
    const htmlContent = `
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h2 style="margin: 0;">Online Quiz Maker</h2>
        </div>
        <div style="${styles.body}">
          <p>Hello,</p>
          <p>You recently requested a One-Time Password (OTP) for your account. Please use the following code to proceed:</p>
          <div style="${styles.otp}">${otp}</div>
          <p><strong>Note:</strong> This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you did not request this, please safely ignore this email. Your account remains secure.</p>
        </div>
        <div style="${styles.footer}">
          &copy; ${new Date().getFullYear()} Online Quiz Maker. All rights reserved.
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `Online Quiz Maker <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Your OTP for Online Quiz Maker",
      html: htmlContent,
    });

    return {
      success: true,
      message: "OTP email sent successfully.",
    };
  } catch (error) {
    console.error("[Email Service - sendOTPEmail Error]:", error);
    return {
      success: false,
      message: "Failed to send OTP email.",
      error: error.message,
    };
  }
};

/**
 * Sends a welcome email upon successful user registration.
 * 
 * @param {string} email - The recipient's email address.
 * @param {string} name - The recipient's full name.
 * @returns {Promise<Object>} Success or failure status object.
 */
const sendWelcomeEmail = async (email, name) => {
  try {
    const htmlContent = `
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h2 style="margin: 0;">Welcome to Online Quiz Maker!</h2>
        </div>
        <div style="${styles.body}">
          <p>Hello ${name},</p>
          <p>Thank you for registering with Online Quiz Maker. We are thrilled to have you on board!</p>
          <p>Whether you are here to create engaging quizzes or test your own knowledge, our platform has everything you need to succeed.</p>
          <p>Log in now to get started!</p>
        </div>
        <div style="${styles.footer}">
          &copy; ${new Date().getFullYear()} Online Quiz Maker. All rights reserved.
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `Online Quiz Maker <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Welcome to Online Quiz Maker!",
      html: htmlContent,
    });

    return {
      success: true,
      message: "Welcome email sent successfully.",
    };
  } catch (error) {
    console.error("[Email Service - sendWelcomeEmail Error]:", error);
    return {
      success: false,
      message: "Failed to send welcome email.",
      error: error.message,
    };
  }
};

/**
 * Sends a notification email after a successful password reset.
 * 
 * @param {string} email - The recipient's email address.
 * @returns {Promise<Object>} Success or failure status object.
 */
const sendPasswordResetSuccessEmail = async (email) => {
  try {
    const htmlContent = `
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h2 style="margin: 0;">Online Quiz Maker</h2>
        </div>
        <div style="${styles.body}">
          <p>Hello,</p>
          <p>This is a confirmation that the password for your Online Quiz Maker account has been successfully changed.</p>
          <p>If you made this change, no further action is required.</p>
          <p style="color: #d9534f; font-weight: bold;">If you did not authorize this change, please contact our support team immediately to secure your account.</p>
        </div>
        <div style="${styles.footer}">
          &copy; ${new Date().getFullYear()} Online Quiz Maker. All rights reserved.
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `Online Quiz Maker <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Password Reset Successful - Online Quiz Maker",
      html: htmlContent,
    });

    return {
      success: true,
      message: "Password reset success email sent successfully.",
    };
  } catch (error) {
    console.error("[Email Service - sendPasswordResetSuccessEmail Error]:", error);
    return {
      success: false,
      message: "Failed to send password reset success email.",
      error: error.message,
    };
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetSuccessEmail,
};