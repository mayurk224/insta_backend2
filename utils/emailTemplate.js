const welcomeTemplate = (username, verifyEmailUrl) => {
  return `
    <h2>Welcome to Instagram, ${username}!</h2>
    <p>Thank you for signing up. We're excited to have you on board!</p>
    <p>Please verify your email to get started:</p>
    <a href="${verifyEmailUrl}">Verify Email</a>
    <p>${verifyEmailUrl}</p>
    <p>This link expires in 24 hours.</p>
    `;
};

const resendVerifyEmailTemplate = (username, verifyEmailUrl) => {
  return `
    <h2>Hi ${username}, please verify your email</h2>
    <p>Click the link below to verify your email address:</p>
    <a href="${verifyEmailUrl}">Verify Email</a>
    <p>This link expires in 24 hours.</p>
  `;
};

const resetPasswordTemplate = (resetUrl) => {
  return `
    <h2>Password Reset</h2>
    <p>Click below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link expires in 15 minutes.</p>
  `;
};

const resetPasswordSucessTemplate = () => {
  return `
    <h2>Password Reset Successful</h2>
    <p>Your password has been successfully reset. You can now log in with your new password.</p>
  `;
};

module.exports = {
  welcomeTemplate,
  resendVerifyEmailTemplate,
  resetPasswordTemplate,
  resetPasswordSucessTemplate,
};
