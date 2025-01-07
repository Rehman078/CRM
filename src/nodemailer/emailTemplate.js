export const loginSuccessEmailTemplate = (name) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Successful</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Login Successful</h1>
    </div>
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <p>Hello, <strong>${name}</strong>,</p>
        <p>We are thrilled to inform you that you have successfully logged into your account.</p>
        <p>If you didn’t log in or suspect any unauthorized activity, please contact our support team immediately.</p>
        <p>Thank you for choosing [Your App Name]. We’re here to ensure your experience is seamless and secure.</p>
        <p>Best regards,<br>The [Your App Name] Team</p>
    </div>
    <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
        <p>This is an automated message. Please do not reply to this email.</p>
    </div>
</body>
</html>
`;
