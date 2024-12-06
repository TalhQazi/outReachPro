import React, { useState } from "react";
import CSVImport from "./CSVImport";

const EmailListManager = () => {
  const [emailData, setEmailData] = useState([]);

  const handleCSVUpload = (data) => {
    setEmailData(data); // Store uploaded CSV data
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-bold">Import Email List</h2>
      <CSVImport onUpload={handleCSVUpload} />
      {emailData.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold">Email Data</h3>
          <pre className="p-4 mt-4 bg-gray-100 rounded-lg">
            {JSON.stringify(emailData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default EmailListManager;
