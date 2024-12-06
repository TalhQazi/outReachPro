import express from "express";
import fetch from "node-fetch";
const router = express.Router();
import dotenv from "dotenv";

dotenv.config();

router.post("/createSpreadSheet", async (req, res) => {
  try {
    // Helper function to add headers to the sheet
    const addHeadersToSheet = async (spreadsheetId, accessToken) => {
      const headers = [["Email", "Status", "Open", "Responded", "Date"]];
      const body = { values: headers };
      const range = "Sent Emails!A1:E1"; // Specify the range for headers

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error("Failed to add headers:", error);
        throw new Error("Failed to add headers to sheet");
      }
    };

    // Extract access token and title from the request body
    const { accessToken, title } = req.body;
    // console.log(accessToken, title);
    // Define the initial spreadsheet structure
    const spreadsheet = {
      properties: {
        title: title || "New Spreadsheet", // Use a default title if not provided
      },
      sheets: [
        {
          properties: {
            title: "Sent Emails", // Name of the first sheet
            gridProperties: {
              rowCount: 100,
              columnCount: 8,
            },
          },
        },
      ],
    };

    // Create the spreadsheet
    const response = await fetch(
      "https://sheets.googleapis.com/v4/spreadsheets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(spreadsheet),
      }
    );

    // Handle errors during spreadsheet creation
    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to create spreadsheet:", error);
      return res
        .status(400)
        .json({ error: "Failed to create spreadsheet", details: error });
    }

    const data = await response.json(); // Parse the response JSON
    console.log("Spreadsheet created:", data.spreadsheetUrl);

    // Add headers to the newly created spreadsheet
    await addHeadersToSheet(data.spreadsheetId, accessToken);

    // Respond with the spreadsheet ID and URL
    res.status(200).json({
      spreadsheetId: data.spreadsheetId,
      spreadsheetUrl: data.spreadsheetUrl,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});
router.post("/updateSheetStatus", async (req, res) => {
  const { email, status, open, responded, accessToken, sheet_id } = req.body;

  const values = [[email, status, open, responded, new Date().toISOString()]];
  const body = {
    values,
  };

  // Use only the sheet name for dynamic appending
  const range = "Sent Emails";

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheet_id}/values/${range}:append?valueInputOption=USER_ENTERED&access_token=${accessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      console.log("Failed to update email status:", res.data);
      return res.status(response.status).send(res.data);
    }

    res.status(200).send("Row appended successfully");
  } catch (error) {
    console.error("Error updating email status:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
