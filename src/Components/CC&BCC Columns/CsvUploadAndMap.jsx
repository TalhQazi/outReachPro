import React, { useEffect, useState } from "react";
import CSVReader from "react-csv-reader";
import { sendEmail } from "../../Services/gmailApi"; // Update this path to your email API

const CsvUploadAndMap = () => {
  const [csvData, setCsvData] = useState([]);
  const [selectedCcColumn, setSelectedCcColumn] = useState("");
  const [selectedBccColumn, setSelectedBccColumn] = useState("");
  const [selectedToColumn, setSelectedToColumn] = useState("");
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  // Handle CSV file upload and parsing
  useEffect(() => {
    const loadClient = async () => {
      await gapi.load("client:auth2", () => {
        gapi.client.init({
          apiKey: import.meta.env.VITE_API_KEY,
          clientId: import.meta.env.VITE_CLIENT_ID,
          scope: "https://www.googleapis.com/auth/gmail.send",
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
          ],
        });
        setIsClientLoaded(true); // Set client loaded to true
      });
    };
    loadClient();
  }, []);

  const handleCsvUpload = (data) => {
    setCsvData(data);
  };

  // Handle form submission to send emails
  const handleSendEmails = async () => {
    if (!selectedToColumn || (!selectedCcColumn && !selectedBccColumn)) {
      alert("Please select the To, CC, and/or BCC columns.");
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (let row of csvData) {
      const to = row[selectedToColumn];
      const cc = selectedCcColumn ? row[selectedCcColumn] : "";
      const bcc = selectedBccColumn ? row[selectedBccColumn] : "";

      if (to) {
        const emailBody = `
          ${Object.values(row).join("\t")}

          Thank you!
        `.trim();

        try {
          await sendEmail(to, "Subject of Email", emailBody, cc, bcc);
          console.log(`Email sent to ${to} with CC: ${cc} and BCC: ${bcc}`);
          successCount++;
        } catch (error) {
          console.error("Error sending email to", to, error);
          errorCount++;
        }
      }
    }

    // Display success and error messages after processing all emails
    if (successCount > 0) {
      alert(`Successfully sent ${successCount} email(s)!`);
    }
  };

  return (
    <div className="max-w-lg p-8 mx-auto mt-6 bg-white border border-gray-300 rounded-lg shadow-lg">
      <h3 className="mb-6 text-3xl font-bold text-center text-gray-800">
        Upload CSV & Map CC/BCC
      </h3>

      {/* CSV File Upload */}
      <CSVReader
        cssClass="csv-reader-input"
        label="Select CSV file"
        onFileLoaded={handleCsvUpload}
        inputId="csv-upload"
        inputStyle={{ color: "blue" }}
      />

      {csvData.length > 0 && (
        <>
          <div className="mt-6">
            <label className="block mb-2 text-lg font-semibold text-gray-700">
              Select 'To' Column:
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSelectedToColumn(e.target.value)}
            >
              {Object.keys(csvData[0]).map((column, index) => (
                <option key={index} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className="block mb-2 text-lg font-semibold text-gray-700">
              Select 'CC' Column:
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSelectedCcColumn(e.target.value)}
            >
              <option value="">None</option>
              {Object.keys(csvData[0]).map((column, index) => (
                <option key={index} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className="block mb-2 text-lg font-semibold text-gray-700">
              Select 'BCC' Column:
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSelectedBccColumn(e.target.value)}
            >
              <option value="">None</option>
              {Object.keys(csvData[0]).map((column, index) => (
                <option key={index} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSendEmails}
            className="w-full px-4 py-3 mt-6 text-lg font-semibold text-white transition duration-200 bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Send Emails
          </button>
        </>
      )}
    </div>
  );
};

export default CsvUploadAndMap;
