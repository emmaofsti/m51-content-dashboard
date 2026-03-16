// EMAIL SENDING IS DISABLED
// All email functionality has been turned off.

export const sendEmail = async (to: string, subject: string, html: string, options?: { noCc?: boolean }) => {
    console.log(`[EMAIL DISABLED] Would have sent "${subject}" to ${to} — but email is turned off.`);
    return { data: { messageId: 'disabled' }, error: undefined };
};
