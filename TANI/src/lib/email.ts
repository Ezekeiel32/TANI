import { Resend } from 'resend';
import { format } from 'date-fns';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@example.com';

function checkEmailEnabled() {
  if (!resend) {
    console.warn('Resend not configured - skipping email');
    return false;
  }
  return true;
}

export async function sendBookingConfirmation(params: {
  to: string;
  userName: string;
  serviceName: string;
  startTime: Date;
  endTime: Date;
  bookingId: string;
}) {
  if (!checkEmailEnabled()) return;
  const { to, userName, serviceName, startTime, endTime, bookingId } = params;
  
  await resend!.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Booking Confirmed - ' + serviceName,
    html: `
      <h2>Booking Confirmed!</h2>
      <p>Hi ${userName},</p>
      <p>Your booking has been confirmed:</p>
      <ul>
        <li><strong>Service:</strong> ${serviceName}</li>
        <li><strong>Date:</strong> ${format(startTime, 'EEEE, MMMM d, yyyy')}</li>
        <li><strong>Time:</strong> ${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}</li>
        <li><strong>Booking ID:</strong> ${bookingId}</li>
      </ul>
      <p><strong>Cancellation Policy:</strong> You can cancel up to 24 hours before your session.</p>
      <p><strong>Payment:</strong> Your card will be charged automatically after the session.</p>
      <p>We look forward to seeing you!</p>
      <hr>
      <p><a href="${process.env.NEXT_PUBLIC_URL}/booking/${bookingId}">View Booking</a> | 
         <a href="${process.env.NEXT_PUBLIC_URL}/booking/${bookingId}/cancel">Cancel Booking</a></p>
    `,
  });
}

export async function sendBookingReminder(params: {
  to: string;
  userName: string;
  serviceName: string;
  startTime: Date;
  hoursUntil: number;
  bookingId: string;
}) {
  if (!checkEmailEnabled()) return;
  const { to, userName, serviceName, startTime, hoursUntil, bookingId } = params;
  
  await resend!.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Reminder: ${serviceName} in ${hoursUntil} hours`,
    html: `
      <h2>Upcoming Session Reminder</h2>
      <p>Hi ${userName},</p>
      <p>This is a reminder about your upcoming session:</p>
      <ul>
        <li><strong>Service:</strong> ${serviceName}</li>
        <li><strong>Date & Time:</strong> ${format(startTime, 'EEEE, MMMM d, yyyy h:mm a')}</li>
        <li><strong>Time until session:</strong> ${hoursUntil} hours</li>
      </ul>
      ${hoursUntil === 24 ? '<p>You can still cancel this session without charge.</p>' : ''}
      <p>See you soon!</p>
      <hr>
      <p><a href="${process.env.NEXT_PUBLIC_URL}/booking/${bookingId}">View Booking</a></p>
    `,
  });
}

export async function sendPaymentReceipt(params: {
  to: string;
  userName: string;
  serviceName: string;
  amount: number;
  currency: string;
  paymentIntentId: string;
}) {
  if (!checkEmailEnabled()) return;
  const { to, userName, serviceName, amount, currency, paymentIntentId } = params;
  
  await resend!.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Payment Receipt - ' + serviceName,
    html: `
      <h2>Payment Receipt</h2>
      <p>Hi ${userName},</p>
      <p>Thank you for your payment:</p>
      <ul>
        <li><strong>Service:</strong> ${serviceName}</li>
        <li><strong>Amount:</strong> ${currency} ${(amount / 100).toFixed(2)}</li>
        <li><strong>Payment ID:</strong> ${paymentIntentId}</li>
        <li><strong>Date:</strong> ${format(new Date(), 'MMMM d, yyyy')}</li>
      </ul>
      <p>Thank you for training with us!</p>
    `,
  });
}

export async function sendPaymentFailedNotice(params: {
  to: string;
  userName: string;
  serviceName: string;
  bookingId: string;
  reason?: string;
}) {
  if (!checkEmailEnabled()) return;
  const { to, userName, serviceName, bookingId, reason } = params;
  
  await resend!.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Payment Failed - Action Required',
    html: `
      <h2>Payment Failed</h2>
      <p>Hi ${userName},</p>
      <p>We were unable to process your payment for ${serviceName}.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>Please update your payment method to avoid service interruption.</p>
      <p><a href="${process.env.NEXT_PUBLIC_URL}/booking/${bookingId}/payment">Update Payment Method</a></p>
    `,
  });
}

export async function sendCancellationConfirmation(params: {
  to: string;
  userName: string;
  serviceName: string;
  startTime: Date;
}) {
  if (!checkEmailEnabled()) return;
  const { to, userName, serviceName, startTime } = params;
  
  await resend!.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Booking Cancelled - ' + serviceName,
    html: `
      <h2>Booking Cancelled</h2>
      <p>Hi ${userName},</p>
      <p>Your booking has been cancelled:</p>
      <ul>
        <li><strong>Service:</strong> ${serviceName}</li>
        <li><strong>Original Date:</strong> ${format(startTime, 'EEEE, MMMM d, yyyy h:mm a')}</li>
      </ul>
      <p>We hope to see you again soon!</p>
      <p><a href="${process.env.NEXT_PUBLIC_URL}/booking">Book Another Session</a></p>
    `,
  });
}
