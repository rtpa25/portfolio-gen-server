import nodemailer from 'nodemailer';

export async function sendEmail(to: string, html: string) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'ew75zmwfylwf5e25@ethereal.email', // generated ethereal user
            pass: 'Fe4xe5zcaE7Kzr9DGH', // generated ethereal password
        },
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to, // list of receivers
        subject: 'Change Password', // Subject line
        html,
    });

    console.log('Message sent: %s', info.messageId);

    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}
