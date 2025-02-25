import Daraja from "@saverious/daraja";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();


export const partnerWithMpesa = async (req, res) => {
  // Extracting parameters from the request body
  const {
    sender_phone,
    payBillOrTillNumber,
    amount,
    callback_url,
    account_reference
  } = req.body;

  // Check if all required parameters are provided
  if (!sender_phone || !payBillOrTillNumber || !amount || !callback_url) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Initialize Daraja instance
    const daraja = new Daraja({
      consumer_key: process.env.MPESA_CONSUMER_KEY,
      consumer_secret: process.env.MPESA_CONSUMER_SECRET,
      environment: 'development'
    });

    // Perform the STK Push request
    const response = await daraja.stkPush({
      sender_phone,
      payBillOrTillNumber,
      amount,
      callback_url,
      account_reference
    });

    // Log and return the response
    console.log('safaricom response:', response);
    res.status(200).json(response);

  } catch (e) {
    // Log and return the error
    console.error('Payment error:', e.message);
    res.status(500).json({ error: e.message });
  }
};

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});


// Controller function to send email
export const sendEmail = async (req, res) => {
  const { name, email, message, subscribe, contact } = req.body;

  // Define the email options
  const mailOptions = {
    from: `"STLC Site" <${email}>`, // Sender's email
    to: process.env.EMAIL_USER, // Recipient email (from environment variable)
    subject: `Contact Form Submission from ${name}`, // Email subject
    html: `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #333333; border-bottom: 2px solid #ff9800; padding-bottom: 10px;">Contact Form Submission</h1>
          <p style="font-size: 16px; color: #666666;"><strong>Name:</strong> <span style="color: #333333;">${name}</span></p>
          <p style="font-size: 16px; color: #666666;"><strong>Email:</strong> <span style="color: #333333;">${email}</span></p>
          <p style="font-size: 16px; color: #666666;"><strong>Contact:</strong> <span style="color: #333333;">${contact}</span></p>
          <p style="font-size: 16px; color: #666666;"><strong>Message:</strong></p>
          <p style="font-size: 16px; color: #333333; background-color: #f2f2f2; padding: 10px; border-radius: 5px;">${message}</p>
          <p style="font-size: 16px; color: #666666;"><strong>Subscribe to Newsletter:</strong>
            <span style="color: ${subscribe ? '#4caf50' : '#f44336'};">
              ${subscribe ? 'Yes' : 'No'}
            </span>
          </p>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999999;">This is an automated message. Please do not reply directly to this email.</p>
        </div>
      </body>
    </html>
  ` // HTML body content of the email
  };


  try {
    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
};
