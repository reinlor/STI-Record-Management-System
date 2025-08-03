const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASS = process.env.EMAIL_PASS

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

// Controller function for sending email
const sendEmail = async (req, res) => {
    const { to, subject, text } = req.body;
    if (!to || !subject || !text) {
        return res.status(400).json({ error: "Missing required fields" })
    }

    const mailOptions = {
        from: EMAIL_USER,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({
            message: "Email sent successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            error: "Failed to send email",
            details: error.message
        });
    }
};

module.exports = { sendEmail }