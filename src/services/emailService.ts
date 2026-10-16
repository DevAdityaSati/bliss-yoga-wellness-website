import { EmailLog } from '../types';

const LOCAL_STORAGE_EMAIL_LOGS = 'bliss_yoga_email_logs_db';

export function getEmailLogs(): EmailLog[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_EMAIL_LOGS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveEmailLog(log: EmailLog) {
  const logs = getEmailLogs();
  logs.unshift(log);
  localStorage.setItem(LOCAL_STORAGE_EMAIL_LOGS, JSON.stringify(logs.slice(0, 100)));
}

export interface EmailParams {
  to: string;
  template: 
    | 'booking_confirmation'
    | 'payment_confirmation'
    | 'program_confirmation'
    | 'schedule_details'
    | 'booking_approved'
    | 'booking_rejected'
    | 'booking_rescheduled'
    | 'meeting_invitation'
    | 'reminder_24h'
    | 'reminder_1h'
    | 'welcome'
    | 'password_reset'
    | 'contact_confirmation'
    | 'admin_new_booking'
    | 'admin_new_contact';
  data: Record<string, string | number | undefined>;
}

export function generateBrandedHTMLEmail(template: string, data: Record<string, string | number | undefined>): { subject: string; html: string } {
  const brandGold = '#c5a059';
  const brandDark = '#121412';
  const brandAccent = '#94a388';
  const brandBg = '#191c19';
  const textLight = '#f4f1ea';

  const headerHtml = `
    <div style="background-color: ${brandDark}; padding: 32px 24px; text-align: center; border-bottom: 2px solid ${brandGold}; font-family: 'Playfair Display', Georgia, serif;">
      <h1 style="color: ${textLight}; margin: 0; font-size: 26px; letter-spacing: 1px;">BLISS YOGA & WELLNESS</h1>
      <p style="color: ${brandAccent}; margin: 6px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Sacred Online Yoga & Holistic Healing</p>
    </div>
  `;

  const footerHtml = `
    <div style="background-color: ${brandDark}; padding: 24px; text-align: center; font-family: sans-serif; font-size: 12px; color: #888888; border-top: 1px solid rgba(255,255,255,0.1);">
      <p style="margin: 0 0 8px 0; color: ${textLight}; font-family: serif;">Bliss Yoga & Wellness Sanctuary</p>
      <p style="margin: 0 0 12px 0;">Transformative Yoga, Meditation, & Ancient Wisdom Practices Online</p>
      <p style="margin: 0; font-size: 11px;">© ${new Date().getFullYear()} Bliss Yoga & Wellness. All rights reserved.</p>
    </div>
  `;

  let subject = 'Notification from Bliss Yoga & Wellness';
  let bodyContent = '';

  switch (template) {
    case 'booking_confirmation':
      subject = `Booking Request Received: ${data.programTitle || 'Yoga Session'}`;
      bodyContent = `
        <h2 style="color: ${brandGold}; font-family: serif; margin-top: 0;">Namaste, ${data.name || 'Practitioner'}</h2>
        <p>We have received your booking request for <strong>${data.programTitle}</strong>.</p>
        <div style="background: ${brandBg}; padding: 16px; border-left: 3px solid ${brandGold}; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 4px 0;"><strong>Class Type:</strong> ${data.classType || 'Session'}</p>
          <p style="margin: 4px 0;"><strong>Date:</strong> ${data.date}</p>
          <p style="margin: 4px 0;"><strong>Time Slot:</strong> ${data.time}</p>
          <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">${data.status || 'Payment Pending Verification'}</span></p>
        </div>
        <p>Our administration will verify your payment details shortly. You can track status anytime in your Student Dashboard.</p>
      `;
      break;

    case 'payment_confirmation':
      subject = `💳 Payment Submitted: ${data.programTitle || 'Bliss Program'}`;
      bodyContent = `
        <h2 style="color: ${brandGold}; font-family: serif; margin-top: 0;">Payment Received for Verification</h2>
        <p>Dear ${data.name || 'Practitioner'},</p>
        <p>Thank you for submitting your payment for <strong>${data.programTitle}</strong>.</p>
        <div style="background: ${brandBg}; padding: 16px; border-left: 3px solid ${brandGold}; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 4px 0;"><strong>Amount Submitted:</strong> $${data.amount}</p>
          <p style="margin: 4px 0;"><strong>Transaction Reference:</strong> ${data.txnRef}</p>
          <p style="margin: 4px 0;"><strong>Payment Method:</strong> ${data.provider || 'PayPal'}</p>
          <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">Pending Verification</span></p>
        </div>
        <p>An administrator will verify your transaction and send your final program schedule and live class link to this email address.</p>
      `;
      break;

    case 'program_confirmation':
      subject = `🧘 Program Activated: ${data.programTitle || 'Premium Program'}`;
      bodyContent = `
        <h2 style="color: ${brandAccent}; font-family: serif; margin-top: 0;">Welcome to Your Premium Wellness Journey!</h2>
        <p>Dear ${data.name || 'Practitioner'},</p>
        <p>Your enrollment in <strong>${data.programTitle}</strong> has been verified and activated!</p>
        <div style="background: ${brandBg}; padding: 16px; border-left: 3px solid ${brandAccent}; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 4px 0;"><strong>Program Format:</strong> ${data.classType || 'Group'}</p>
          <p style="margin: 4px 0;"><strong>Duration:</strong> ${data.duration || 'Program Duration'}</p>
          <p style="margin: 4px 0;"><strong>Start Date:</strong> ${data.date}</p>
          <p style="margin: 4px 0;"><strong>Time Slot:</strong> ${data.time}</p>
        </div>
        <p>Log into your Student Dashboard anytime to track completed sessions, view remaining days, and join live online classes.</p>
      `;
      break;

    case 'schedule_details':
      subject = `📅 Schedule Details: ${data.programTitle || 'Bliss Yoga'}`;
      bodyContent = `
        <h2 style="color: ${brandGold}; font-family: serif; margin-top: 0;">Your Live Practice Schedule</h2>
        <p>Dear ${data.name || 'Practitioner'},</p>
        <p>Here are your confirmed class schedule details for <strong>${data.programTitle}</strong>:</p>
        <div style="background: ${brandBg}; padding: 16px; border-left: 3px solid ${brandGold}; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 4px 0;"><strong>Date:</strong> ${data.date}</p>
          <p style="margin: 4px 0;"><strong>Time:</strong> ${data.time}</p>
          <p style="margin: 4px 0;"><strong>Timezone:</strong> ${data.timezone || 'Local Time'}</p>
        </div>
        <p>Please arrive 5 minutes early to prepare your practice space.</p>
      `;
      break;

    case 'booking_approved':
      subject = `Your Bliss Yoga Class Has Been Confirmed`;
      bodyContent = `
        <p style="margin-top: 0; font-size: 16px;">Dear <strong>${data.name || 'Practitioner'}</strong>,</p>
        <p style="font-size: 15px;">Your booking has been approved.</p>
        <p style="font-size: 15px;">We are excited to welcome you to your upcoming session.</p>
        
        <div style="background: ${brandBg}; padding: 20px; border-left: 3px solid ${brandGold}; margin: 24px 0; border-radius: 8px;">
          <h3 style="color: ${brandGold}; font-family: serif; margin: 0 0 14px 0; font-size: 16px; border-bottom: 1px solid rgba(197,160,89,0.2); pb: 6px;">Class Details</h3>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Program:</strong> ${data.programTitle || 'Yoga Session'}</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Class Type:</strong> ${data.classType || 'Group'}</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Date:</strong> ${data.date}</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Time:</strong> ${data.time}</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Time Zone:</strong> ${data.timezone || 'UTC'}</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Instructor:</strong> Bliss Yoga & Wellness</p>
        </div>

        <p style="font-size: 15px;">To join your session, simply click the button below.</p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.meetingLink}" target="_blank" rel="noopener noreferrer" style="background-color: ${brandGold}; color: ${brandDark}; padding: 16px 36px; font-weight: bold; font-size: 16px; text-decoration: none; border-radius: 30px; display: inline-block; letter-spacing: 1px; box-shadow: 0 4px 20px rgba(197,160,89,0.35);">JOIN CLASS</a>
        </div>

        <p style="font-size: 13px; color: #d4af37; line-height: 1.6; background-color: rgba(197,160,89,0.1); border: 1px solid rgba(197,160,89,0.3); padding: 12px 16px; border-radius: 6px; margin: 20px 0;">
          <strong>Note for 12-Day & 15-Day Program Students:</strong> You can also access your live Jitsi "JOIN CLASS" button, attendance records, and complete curriculum anytime directly inside your <strong>Student Portal</strong> dashboard.
        </p>

        <p style="font-size: 13px; color: #bbbbbb; line-height: 1.6; background-color: rgba(255,255,255,0.03); padding: 12px 16px; border-radius: 6px;">
          • The button will open the Jitsi meeting directly.<br/>
          • No download is required.<br/>
          • No account is required.<br/>
          • Please join a few minutes before the scheduled class begins.
        </p>

        <p style="margin-top: 28px; font-size: 14px;">Thank you,<br/><strong style="color: ${brandGold}; font-serif;">Bliss Yoga & Wellness</strong></p>
      `;
      break;

    case 'booking_rejected':
      subject = `Update Regarding Your Booking Request: ${data.programTitle}`;
      bodyContent = `
        <h2 style="color: ${brandGold}; font-family: serif; margin-top: 0;">Namaste, ${data.name || 'Practitioner'}</h2>
        <p>Thank you for reaching out to Bliss Yoga & Wellness. Regrettably, we were unable to confirm your booking for <strong>${data.programTitle}</strong> at the requested date/time.</p>
        <p style="color: #888;">${data.reason || 'The requested time slot is currently unavailable or fully reserved.'}</p>
        <p>We welcome you to choose an alternative time slot through your Student Dashboard.</p>
      `;
      break;

    case 'booking_rescheduled':
      subject = `📅 Schedule Update: ${data.programTitle}`;
      bodyContent = `
        <h2 style="color: ${brandGold}; font-family: serif; margin-top: 0;">Your Session Has Been Rescheduled</h2>
        <p>Dear ${data.name || 'Practitioner'},</p>
        <p>Please note that your session for <strong>${data.programTitle}</strong> has been updated to:</p>
        <div style="background: ${brandBg}; padding: 16px; border-left: 3px solid ${brandGold}; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 4px 0;"><strong>New Date:</strong> ${data.date}</p>
          <p style="margin: 4px 0;"><strong>New Time:</strong> ${data.time}</p>
        </div>
      `;
      break;

    case 'meeting_invitation':
      subject = `🧘 Live Jitsi Meeting Link: ${data.programTitle}`;
      bodyContent = `
        <h2 style="color: ${brandGold}; font-family: serif; margin-top: 0;">Join Your Live Class</h2>
        <p>Your live online yoga class is ready!</p>
        <p style="margin: 20px 0; text-align: center;">
          <a href="${data.meetingLink}" style="background-color: ${brandGold}; color: ${brandDark}; padding: 14px 28px; font-weight: bold; text-decoration: none; border-radius: 30px; display: inline-block;">JOIN LIVE JITSI CLASS</a>
        </p>
        <p style="font-size: 12px; color: #aaa; text-align: center;">Or copy this URL: ${data.meetingLink}</p>
      `;
      break;

    case 'reminder_24h':
      subject = `⏰ Reminder: Live Yoga Class in 24 Hours`;
      bodyContent = `
        <h2 style="color: ${brandGold}; font-family: serif;">See You Tomorrow on the Mat!</h2>
        <p>This is a gentle reminder that your <strong>${data.programTitle}</strong> session starts in 24 hours (${data.startTime}).</p>
      `;
      break;

    case 'reminder_1h':
      subject = `🔔 Reminder: Your Yoga Class Starts in 1 Hour`;
      bodyContent = `
        <h2 style="color: ${brandAccent}; font-family: serif;">Class Starts in 60 Minutes!</h2>
        <p>Get your yoga mat ready! Your live session for <strong>${data.programTitle}</strong> will begin shortly.</p>
        <p><a href="${data.meetingLink}" style="color: ${brandGold}; font-weight: bold;">Click here to access class room</a></p>
      `;
      break;

    case 'welcome':
      subject = `🌸 Welcome to Bliss Yoga & Wellness Sanctuary`;
      bodyContent = `
        <h2 style="color: ${brandGold}; font-family: serif;">Welcome to Our Global Sacred Sangha</h2>
        <p>Dear ${data.name || 'Friend'},</p>
        <p>Thank you for creating your account with Bliss Yoga & Wellness. We are honored to accompany you on your path towards physical strength, mental clarity, and spiritual peace.</p>
        <p>You can now log in anytime to view programs, book private or group classes, and join live online sessions.</p>
      `;
      break;

    case 'password_reset':
      subject = `🔐 Password Reset Instructions - Bliss Yoga`;
      bodyContent = `
        <h2 style="color: ${brandGold}; font-family: serif;">Password Reset Request</h2>
        <p>We received a request to reset your password for Bliss Yoga & Wellness.</p>
        <p style="margin: 24px 0; text-align: center;">
          <a href="${data.resetLink || '#'}" style="background-color: ${brandAccent}; color: ${brandDark}; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 20px; display: inline-block;">Reset Password Request</a>
        </p>
        <p style="font-size: 12px; color: #888;">If you did not request this, you can safely ignore this email.</p>
      `;
      break;

    case 'contact_confirmation':
      subject = `Thank You for Contacting Bliss Yoga & Wellness`;
      bodyContent = `
        <h2 style="color: ${brandGold}; font-family: serif;">We Received Your Message</h2>
        <p>Dear ${data.name || 'Friend'},</p>
        <p>Thank you for reaching out to us regarding "<strong>${data.subject || 'Inquiry'}</strong>". Our dedicated support team will review your message and reply within 24 hours.</p>
      `;
      break;

    case 'admin_new_booking':
      subject = `🔔 Admin Alert: New Booking Request`;
      bodyContent = `
        <h2 style="color: ${brandGold}; font-family: serif;">New Student Booking</h2>
        <p>A new booking request has been submitted:</p>
        <ul>
          <li><strong>Student Name:</strong> ${data.name}</li>
          <li><strong>Email:</strong> ${data.email}</li>
          <li><strong>Program:</strong> ${data.programTitle}</li>
          <li><strong>Preferred Date & Time:</strong> ${data.date} at ${data.time}</li>
        </ul>
      `;
      break;

    case 'admin_new_contact':
      subject = `📬 Admin Alert: New Message Received`;
      bodyContent = `
        <h2 style="color: ${brandGold}; font-family: serif;">New Contact Message</h2>
        <p><strong>From:</strong> ${data.name} (${data.email})</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong> ${data.message}</p>
      `;
      break;

    default:
      bodyContent = `<p>${data.message || 'Thank you for connecting with Bliss Yoga & Wellness.'}</p>`;
  }

  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0c0d0c; font-family: Arial, Helvetica, sans-serif; color: ${textLight}; text-align: left;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #141714; border: 1px solid rgba(197, 160, 89, 0.3); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          ${headerHtml}
          <div style="padding: 32px 24px; color: ${textLight}; font-size: 15px; line-height: 1.6;">
            ${bodyContent}
          </div>
          ${footerHtml}
        </div>
      </body>
    </html>
  `;

  return { subject, html: fullHtml };
}

export async function sendEmailAutomation(params: EmailParams): Promise<boolean> {
  const { subject } = generateBrandedHTMLEmail(params.template, params.data);

  // Record dispatch log
  const log: EmailLog = {
    id: 'eml-' + Date.now(),
    recipient_email: params.to,
    template_type: params.template,
    subject,
    status: 'sent',
    sent_at: new Date().toISOString(),
  };

  saveEmailLog(log);
  console.log(`[EMAIL AUTOMATION DISPATCHED] To: ${params.to} | Subject: "${subject}" | Template: ${params.template}`);
  return true;
}
