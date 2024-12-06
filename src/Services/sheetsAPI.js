import { gapi } from "gapi-script";
import { authenticateUser } from "./auth";
import axios from "axios";

const initializeSheetsAPI = () => {
  return new Promise((resolve, reject) => {
    window.gapi.load("client:auth2", async () => {
      try {
        await window.gapi.client.init({
          apiKey: import.meta.env.VITE_API_KEY, // Replace with your API key
          clientId: import.meta.env.VITE_CLIENT_ID, // Replace with your client ID
          discoveryDocs: [
            "https://sheets.googleapis.com/$discovery/rest?version=v4",
          ],
          scope:
            "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file",
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
};

export const createSpreadsheet = async (accessToken, title) => {
  try {
    const data = {
      accessToken,
      title,
    };
    const res = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/sheets/createSpreadSheet`,
      data
    );
    sessionStorage.setItem("sheet_id", res.data.spreadsheetId);
    console.log(res.data.spreadsheetUrl);
    return res.data.spreadsheetId;
  } catch (error) {
    console.log(error);
  }
};

// Function to add headers to the sheet
export const addHeadersToSheet = async (spreadsheetId, accessToken) => {
  const headers = [["Email", "Status", "Open", "Responded", "Date"]];
  const body = {
    values: headers,
  };

  const range = "Sent Emails!A1:E1"; // Header row range

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&access_token=${accessToken}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    console.error("Failed to add headers:", await response.text());
  }
};

export const updateEmailStatusInSheet = async (
  email,
  status,
  open,
  responded,
  accessToken
) => {
  const sheet_id = sessionStorage.getItem("sheet_id");
  const data = {
    email,
    status,
    open,
    responded,
    accessToken,
    sheet_id,
  };
};
