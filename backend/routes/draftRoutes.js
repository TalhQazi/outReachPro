import  express from 'express';
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config()

// const { getDrafts } = require('../controllers/draftController.js');
const router = express.Router()
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );
  

router.get('/getDrafts', async(req,res) => {
    oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    try {
        const response = await gmail.users.drafts.list({ userId: "me" });
        console.log(response)
        const drafts =  response.data.drafts || [];
        res.status(200).json(drafts)
    } catch (error) {
        console.log(error);
    }
})

export default router