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

export const contactAssignEmailTemplate = (name, contact) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Assignment</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Contact Assignment Email</h1>
    </div>
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <p>Hello, <strong>${name}</strong>,</p>
        <p>We are pleased to inform you that a new contact <strong>${contact}</strong> has been assigned to your account for follow-up and management.</p>
        <p>If you have any questions or need further assistance, please do not hesitate to reach out to our support team.</p>
        <p>Thank you for your commitment and for being a valued part of [Your App Name].</p>
        <p>Best regards,<br>The [Your App Name] Team</p>
    </div>
    <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
        <p>This is an automated message. Please do not reply to this email.</p>
    </div>
</body>
</html>

`; 

export const leadAssignEmailTemplate = (name, lead) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lead Assignment</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Lead Assignment Email</h1>
    </div>
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <p>Hello, <strong>${name}</strong>,</p>
        <p>We are pleased to inform you that a new lead <strong>${lead}</strong> has been assigned to your account for follow-up and management.</p>
        <p>If you have any questions or need further assistance, please do not hesitate to reach out to our support team.</p>
        <p>Thank you for your commitment and for being a valued part of [Your App Name].</p>
        <p>Best regards,<br>The [Your App Name] Team</p>
    </div>
    <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
        <p>This is an automated message. Please do not reply to this email.</p>
    </div>
</body>
</html>

`; 
export const opportunityCreateEmailTemplate = (recipientName, opportunityName, assignedTo) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Opportunity Created</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Opportunity Created Successfully</h1>
    </div>
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <p>Hello <strong>${recipientName}</strong>,</p>
        <p>We are pleased to inform you that your opportunity has been successfully created.</p>
        <p>Here are the details:</p>
        <ul style="margin: 10px 0; padding-left: 20px;">
            <li><strong>Opportunity Name:</strong> ${opportunityName}</li>
            <li><strong>Assigned To Name:</strong> ${assignedTo}</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Thank you for being a part of our platform!</p>
        <p>Best regards,<br>Your App Team</p>
    </div>
    <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
        <p>This is an automated message. Please do not reply to this email.</p>
    </div>
</body>
</html>
`;


export const opportunityStageUpdateEmailTemplate = (name, opportunity, stage) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Opportunity Update Successfully</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Opportunity Update Successfully</h1>
    </div>
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
       <p>Dear ${name},</p>
        <p>The stage for your opportunity "<strong>${opportunity}</strong>" has been updated to "<strong>${stage}</strong>" in the pipeline.</p>
        <p>If you have any questions or need further assistance, please do not hesitate to reach out to our support team.</p>
        <p>Thank you for your trust and for being a valued part of [Your App Name].</p>
        <p>Best regards,<br>The [Your App Name] Team</p>
    </div>
    <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
        <p>This is an automated message. Please do not reply to this email.</p>
    </div>
</body>
</html>
`;

