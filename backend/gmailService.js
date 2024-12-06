import dotenv from "dotenv"
import { google } from "googleapis";

dotenv.config()

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
];

const getAuthURL = () => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this URL:", authUrl);
};

// Run this
getAuthURL();


export const getDraftDetails = async (draftId) => {
  // const access_token = await oauth2Client.getAccessToken();
  // console.log(access_token);
  try {
    const draftData = await gmail.users.drafts.get({ userId: "me", id: draftId });
    console.log(draftData)
    const message = draftData.data.message;
    const subjectHeader = message.payload.headers.find(
      (header) => header.name === "Subject"
    );
    const subject = subjectHeader ? subjectHeader.value : "No Subject";
    const body = message.snippet || "No Body";
  
    return { id: draftId, subject, body };
    
  } catch (error) {
    console.log(error);
  }
};

export const sendEmail = async (to, subject, text) => {
  const accessToken = await oauth2Client.getAccessToken();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL_ADDRESS,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });

  await transporter.sendMail({
    from: `"Your Name" <${process.env.EMAIL_ADDRESS}>`,
    to,
    subject,
    text,
  });
};

