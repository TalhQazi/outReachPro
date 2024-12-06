import React, { useState, useEffect } from "react";
import { gapi } from "gapi-script";
import { authenticateUser } from "../../Services/auth";

const TrackingReport = () => {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initializeSheetsAPI = () => {
    return new Promise((resolve, reject) => {
      window.gapi.load("client:auth2", async () => {
        try {
          await window.gapi.client.init({
            apiKey: import.meta.env.VITE_API_KEY,
            clientId: import.meta.env.VITE_CLIENT_ID,
            discoveryDocs: [
              "https://sheets.googleapis.com/$discovery/rest?version=v4",
              "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
            ],
            scope:
              "https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/spreadsheets.readonly",
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  const fetchAllSheets = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.gapi.client.drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet'",
        fields: "files(id, name)",
      });
      setSheets(response.result.files || []);
    } catch (error) {
      console.error("Error fetching sheets:", error);
      setError(
        "An error occurred while fetching your Google Sheets. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadSheetsAPI = async () => {
      try {
        await initializeSheetsAPI();
        fetchAllSheets();
      } catch (error) {
        console.error("Error initializing Sheets API:", error);
        setError(
          "Failed to initialize Google Sheets API. Please refresh the page."
        );
      }
    };
    loadSheetsAPI();
  }, []);

  return (
    <div className="container p-6 mx-auto bg-white rounded-lg shadow-md">
      <h2 className="mb-4 text-2xl font-semibold text-center text-gray-800">
        Your Google Sheets
      </h2>
      {error && <div className="mb-4 text-center text-red-600">{error}</div>}
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 border-b-2 border-gray-900 rounded-full animate-spin"></div>
        </div>
      ) : (
        <ul className="space-y-3">
          {sheets.length > 0 ? (
            sheets.map((sheet) => (
              <li key={sheet.id} className="p-3 bg-gray-100 rounded-lg shadow">
                <a
                  href={`https://docs.google.com/spreadsheets/d/${sheet.id}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-3xl font-medium text-blue-600 hover:text-blue-800"
                >
                  {sheet.name}
                </a>
              </li>
            ))
          ) : (
            <p className="text-center text-gray-700">
              No Google Sheets found in your account.
            </p>
          )}
        </ul>
      )}
    </div>
  );
};

export default TrackingReport;
