import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.sender_email = os.getenv('EMAIL_SENDER')
        self.password = os.getenv('EMAIL_PASSWORD')

    def send_otp(self, to_email, otp_code):
        """
        Send OTP email to the user.
        Args:
            to_email (str): Recipient email
            otp_code (str): The OTP code to send
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.sender_email or not self.password:
            print("⚠️  Email configuration missing. Printing OTP to console instead.")
            print(f"📧  [MOCK EMAIL] To: {to_email} | OTP: {otp_code}")
            return True

        try:
            msg = MIMEMultipart()
            msg['From'] = self.sender_email
            msg['To'] = to_email
            msg['Subject'] = "Your FinZora Verification Code"

            body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">FinZora</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p>Hello,</p>
                        <p>Thank you for signing up with FinZora. Please use the verification code below to complete your registration:</p>
                        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
                            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #4F46E5;">{otp_code}</span>
                        </div>
                        <p>This code will expire in 10 minutes.</p>
                        <p>If you didn't request this code, you can safely ignore this email.</p>
                    </div>
                    <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
                        &copy; 2026 FinZora Financial AI. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(body, 'html'))

            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.sender_email, self.password)
            text = msg.as_string()
            server.sendmail(self.sender_email, to_email, text)
            server.quit()
            
            print(f"✓ OTP sent to {to_email}")
            return True
            
        except Exception as e:
            print(f"❌ Error sending email: {str(e)}")
            # Fallback for development if email fails
            print(f"📧  [FALLBACK] To: {to_email} | OTP: {otp_code}")
            return False
