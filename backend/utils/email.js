const nodemailer = require('nodemailer');
// eslint-disable-next-line import/no-extraneous-dependencies
const { google } = require('googleapis');

// These id's and secrets should come from .env file.

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLEMAIL_REDIRECT_URL,
);
oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLEMAIL_REFRESH_TOKEN,
});

exports.sendMail = async ({ emailAddress, subject, text, html }) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.AUTHORIZED_MAIL,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLEMAIL_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: `BEADS BY KAPH <${process.env.AUTHORIZED_MAIL}>`,
      to: emailAddress,
      subject,
      text,
      html,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.log(error);
  }
};
