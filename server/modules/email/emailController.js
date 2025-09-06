const { getUserCollection } = require('../../firestore/main/models/userModel');

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

// Controller function for sending password reset email
const sendResetPassword = async (req, res) => {
    const { email, link } = req.body;
    if (!email || !link) {
        return res.status(400).json({ error: "Missing required fields" })
    }

    const userCollection = getUserCollection();
    const userSnapshot = await userCollection.where('email', '==', email).get();

    if (userSnapshot.empty) {
        return res.status(404).json({
            error: "User not found with this email address.",
        });
    }


    const mailOptions = {
        from: EMAIL_USER,
        to: email,
        subject: "Password Reset",
        text: `Password Reset Link: ${link}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({
            message: "Password reset email sent successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            error: "Failed to send password reset email",
            details: error.message
        });
    }
};

module.exports = { sendEmail, sendResetPassword }