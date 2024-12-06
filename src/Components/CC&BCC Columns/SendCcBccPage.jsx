import React from "react";
import CsvUploadAndMap from "../CC&BCC Columns/CsvUploadAndMap"; // Update the path to the component

const SendCcBccPage = () => {
  return (
    <div className="container p-4 mx-auto">
      <h1 className="my-6 text-4xl font-bold text-center">
        Send Emails with CC/BCC
      </h1>
      <CsvUploadAndMap />
    </div>
  );
};

export default SendCcBccPage;
