import { google } from "googleapis";

// Function to get tracking data from Google Sheets
export const getTrackingData = async () => {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: "110mfw8ebhkF_RrWq4W9yKU0Z2rWRrTtjyTOnFb-g2DU",
    range: "Sheet1!A1:F1", // Adjust range as per your Google Sheet layout
  });

  const rows = response.data.values;
  if (rows.length) {
    return rows.map((row) => ({
      email: row[0],
      opens: row[1] || 0,
      clicks: row[2] || 0,
      responses: row[3] || 0,
      bounced: row[4] === "Yes",
      unsubscribed: row[5] === "Yes",
    }));
  } else {
    return [];
  }
};
