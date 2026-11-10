import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config/index.js';
import { IProperty } from '../models/Property.js';
import { IEnquiry } from '../models/Enquiry.js';

let transporter: Transporter | null = null;

// Initialize transporter if SMTP credentials are provided
if (config.smtp.host && config.smtp.user && config.smtp.pass) {
  try {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
    console.log('[EmailService] SMTP Transporter initialized successfully');
  } catch (err) {
    console.warn('[EmailService] Failed to initialize SMTP transporter:', err);
    transporter = null;
  }
} else {
  console.log('[EmailService] Optional SMTP not fully configured. Email notifications skipped.');
}

/**
 * Notifies administrator when a new property is submitted.
 */
export const notifyAdminNewProperty = async (property: IProperty): Promise<boolean> => {
  if (!transporter) return false;

  try {
    const adminLink = `${config.frontendUrl}/admin/properties/pending`;
    const mailOptions = {
      from: config.smtp.from,
      to: config.smtp.adminEmail,
      subject: `[New Property Submission] ${property.title} (${property.referenceId})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-top: 0;">New Property Awaiting Moderation</h2>
          <p style="color: #475569; font-size: 14px;">A new property advertisement was submitted on <strong>Property in Lahore</strong>.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; width: 35%;">Title:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${property.title}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Reference ID:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${property.referenceId}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Listing Type:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${property.listingType}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Location:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${property.location.area}, ${property.location.city}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Contact Name:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${property.contactInfo.contactName} (${property.contactInfo.whatsappNumber})</td>
            </tr>
          </table>

          <div style="margin-top: 25px;">
            <a href="${adminLink}" style="background-color: #059669; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Review in Moderation Queue
            </a>
          </div>
          
          <p style="margin-top: 30px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            This is an automated notification from Property in Lahore Administration.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Admin new property notification sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.warn('[EmailService] Error sending new property notification email:', error);
    return false;
  }
};

/**
 * Notifies administrator when a new customer enquiry is submitted for a property.
 */
export const notifyAdminNewEnquiry = async (enquiry: IEnquiry): Promise<boolean> => {
  if (!transporter) return false;

  try {
    const adminLink = `${config.frontendUrl}/admin/enquiries`;
    const mailOptions = {
      from: config.smtp.from,
      to: config.smtp.adminEmail,
      subject: `[New Lead Enquiry] ${enquiry.customerName} for "${enquiry.propertyTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-top: 0;">New Lead Enquiry Received</h2>
          <p style="color: #475569; font-size: 14px;">A customer has submitted a prospective enquiry on <strong>Property in Lahore</strong>.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; width: 35%;">Customer Name:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${enquiry.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">WhatsApp Number:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${enquiry.customerPhone}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Email:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${enquiry.customerEmail || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Property:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${enquiry.propertyTitle} (${enquiry.propertyReferenceId || 'Ref N/A'})</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Preferred Channel:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${enquiry.preferredContactMethod}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; vertical-align: top;">Message:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; border-radius: 4px;">
                "${enquiry.message}"
              </td>
            </tr>
          </table>

          <div style="margin-top: 25px;">
            <a href="${adminLink}" style="background-color: #059669; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Manage Enquiry in Admin Lead Portal
            </a>
          </div>
          
          <p style="margin-top: 30px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            Property in Lahore Lead Notification Engine
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Admin new enquiry notification sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.warn('[EmailService] Error sending new enquiry notification email:', error);
    return false;
  }
};

/**
 * Notifies property submitter when their listing is approved or rejected (if submitter email is present).
 */
export const notifySubmitterModerationDecision = async (
  property: IProperty,
  decision: 'APPROVED' | 'REJECTED',
  reason?: string
): Promise<boolean> => {
  if (!transporter || !property.submitterEmail) return false;

  try {
    const isApproved = decision === 'APPROVED';
    const propertyUrl = `${config.frontendUrl}/property/${property.slug}`;

    const mailOptions = {
      from: config.smtp.from,
      to: property.submitterEmail,
      subject: isApproved
        ? `[Approved & Live] Your Property Listing: ${property.title}`
        : `[Listing Update] Your Property Listing Status: ${property.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: ${isApproved ? '#059669' : '#dc2626'}; margin-top: 0;">
            ${isApproved ? 'Listing Approved & Published!' : 'Listing Submission Update'}
          </h2>
          <p style="color: #475569; font-size: 14px;">
            Dear ${property.contactInfo.contactName},
          </p>
          <p style="color: #475569; font-size: 14px;">
            ${
              isApproved
                ? `Great news! Your property listing <strong>"${property.title}"</strong> (Ref: ${property.referenceId}) has been reviewed, approved, and is now actively published on Property in Lahore.`
                : `Thank you for submitting your listing <strong>"${property.title}"</strong> (Ref: ${property.referenceId}) to Property in Lahore. Our moderation team has reviewed your advertisement and noted the following:`
            }
          </p>

          ${
            !isApproved && reason
              ? `<div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 6px; color: #991b1b; font-size: 14px; margin: 15px 0;">
                  <strong>Reason:</strong> ${reason}
                </div>`
              : ''
          }

          ${
            isApproved
              ? `<div style="margin-top: 25px;">
                  <a href="${propertyUrl}" style="background-color: #059669; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    View Live Listing
                  </a>
                </div>`
              : ''
          }

          <p style="margin-top: 30px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            Property in Lahore Customer Support &bull; www.propertyinlahore.online
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Submitter moderation notification sent to ${property.submitterEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.warn('[EmailService] Error sending submitter moderation email:', error);
    return false;
  }
};
