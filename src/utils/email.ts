import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, html: string) => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD;

    if (!user || !pass) {
        console.error('Missing EMAIL_USER or EMAIL_PASSWORD environment variables');
        return { error: 'Missing email configuration' };
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user,
                pass,
            },
        });

        const info = await transporter.sendMail({
            from: `M51 Content Dashboard <${user}>`,
            to,
            cc: to === 'emma@m51.no' ? undefined : 'emma@m51.no',
            subject,
            html,
        });

        console.log('Message sent: %s', info.messageId);
        return { data: info };
    } catch (error: any) {
        console.error('Error sending email:', error);
        return { error: error.message || 'Unknown error' };
    }
};
