# CRM Backend API

A RESTful Customer Relationship Management (CRM) backend built with Express.js and MongoDB. This API helps businesses manage their sales pipeline by tracking contacts, leads, and opportunities through customizable stages.

**Live Demo:** [https://crm-backend-kappa-six.vercel.app](https://crm-backend-kappa-six.vercel.app)

## What This App Does

**Customer & Lead Tracking**
- Store and manage customer contact information
- Track leads from various sources (website, referral, campaigns)
- Monitor lead status progression (New → Contacted → Qualified → Won/Lost)

**Sales Pipeline Management**
- Create custom sales pipelines with multiple stages
- Track opportunities with expected revenue and close dates
- Assign leads and contacts to sales representatives

**Team Collaboration**
- Role-based access (Admin, Manager, SalesRep)
- Assign contacts and leads to team members
- Attach notes and files to any record

**Automated Notifications**
- Email alerts for new assignments
- Daily reminders for upcoming opportunity close dates

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT, bcryptjs
- **Email:** Nodemailer
- **Validation:** Joi

## Author

**Rehman Naveed** - Full Stack Web Developer - [LinkedIn](https://www.linkedin.com/in/rehmannaveed/)