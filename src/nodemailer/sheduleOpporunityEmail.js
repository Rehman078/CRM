import cron from "node-cron";
import Opportunity from "../../src/models/Opportunity/opportunityModel.js";
import sendMail from "../nodemailer/nodemailerIntegration.js";

const sendOpportunityReminders = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const today = new Date();
      const startOfTomorrow = new Date();
      startOfTomorrow.setDate(today.getDate() + 1);
      startOfTomorrow.setHours(0, 0, 0, 0);

      const endOfTomorrow = new Date(startOfTomorrow);
      endOfTomorrow.setHours(23, 59, 59, 999);

      // Find opportunities due tomorrow
      const opportunities = await Opportunity.find({
        close_date: {
          $gte: startOfTomorrow,
          $lt: endOfTomorrow,
        },
      }).populate("created_by");

      for (const opportunity of opportunities) {
        const assignedUserEmail = opportunity?.created_by?.email;

        if (!assignedUserEmail) {
          console.error(`No email found for opportunity: ${opportunity.name}`);
          continue;
        }

        const subject = `Reminder: Opportunity "${opportunity.name}" is Due Tomorrow`;
        const html = `
          <p>Hi,</p>
          <p>This is a reminder that the opportunity <strong>"${opportunity.name}"</strong> is due on <strong>${opportunity.close_date.toDateString()}</strong>.</p>
          <p><strong>Expected Revenue:</strong> $${opportunity.expected_revenue}</p>
          <p>Please take necessary action.</p>
          <p>Best Regards,<br>Your Team</p>
        `;

        try {
          await sendMail(assignedUserEmail, subject, html);
          console.log(`Email sent to ${assignedUserEmail} for Opportunity: ${opportunity.name}`);
        } catch (mailError) {
          console.error(`Failed to send email for opportunity: ${opportunity.name}`, mailError);
        }
      }
    } catch (error) {
      console.error("Error in sending opportunity reminders:", error);
    }
  });
};

export default sendOpportunityReminders;
