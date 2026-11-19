import { NextResponse } from 'next/server';
import { verifyEmailConfig } from '@/lib/email-service';
import nodemailer from 'nodemailer';

export async function GET() {
  try {
    const status = await verifyEmailConfig();
    return NextResponse.json({
      status: status.success ? 'CONNECTED' : 'FAILED',
      ...status,
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'ERROR', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const targetEmail = body.to || process.env.EMAIL_USER || 'houseofaviraorders@gmail.com';

    const user = (process.env.EMAIL_USER || 'houseofaviraorders@gmail.com').trim().replace(/^["']|["']$/g, '');
    let pass = (process.env.EMAIL_PASS || '').trim().replace(/^["']|["']$/g, '');
    const cleanPass = pass.replace(/\s+/g, '');
    if (cleanPass.length === 16) {
      pass = cleanPass;
    }

    if (!user || !pass) {
      return NextResponse.json({
        success: false,
        error: 'Missing EMAIL_USER or EMAIL_PASS environment variables.'
      }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });

    const info = await transporter.sendMail({
      from: `"House of Avira Test" <${user}>`,
      to: targetEmail,
      subject: '✅ House of Avira — Email System Test',
      text: 'This is a test email confirming that the House of Avira automated mail system is active and functioning properly.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e0e0e0;">
          <h2 style="color: #000000; margin-top: 0;">HOUSE OF AVIRA</h2>
          <p style="color: #166534; font-weight: bold; font-size: 16px;">✅ Email System Verified Successfully</p>
          <p style="color: #444444; font-size: 14px; line-height: 1.6;">
            Your backend email service is working properly. Automated order confirmations and shipping invoice emails are ready to send.
          </p>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          <p style="color: #888888; font-size: 12px; margin: 0;">
            Sent from: ${user}<br>
            Timestamp: ${new Date().toISOString()}
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      recipient: targetEmail,
    });
  } catch (error) {
    console.error('Test email failed:', error);
    return NextResponse.json({
      success: false,
      code: error.code || 'UNKNOWN',
      error: error.message,
    }, { status: 500 });
  }
}
