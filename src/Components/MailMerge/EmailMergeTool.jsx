import  { useState } from "react";
import CSVImport from "./CSVImport";
import MergeFieldsMapper from "./MergeFieldMapper";
import EmailSender from "../EmailSend/EmailSender";
import { createSpreadsheet } from "../../Services/sheetsAPI";


const EmailMergeTool = () => {
  const [emailData, setEmailData] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({});
  const [template, setTemplate] = useState(
    "Hello {FirstName}, this is a test email."
  );

  const handleCSVUpload = async(data) => {
    // const accessToken = sessionStorage.getItem("access_token");
    // await createSpreadsheet(accessToken, "Email Record Sheet")
    setEmailData(data); // Store uploaded CSV data
  };

  const handleSendEmails = (emailData, template, fieldMapping) => {
    // You can add your email sending logic here.
    console.log("Sending emails:", emailData);
  };

  return (
    <div className="min-h-screen p-6 text-3xl bg-gray-50">
      <h2 className="mb-6 text-4xl font-bold">OutReachpro Merge Tool</h2>
      <CSVImport onUpload={handleCSVUpload} />
      {emailData.length > 0 && (
        <>
          <MergeFieldsMapper
            emailData={emailData}
            onMappingChange={setFieldMapping}
          />
          <div className="mt-8">
            <label className="block mb-6 text-3xl font-semibold text-center text-gray-700">
              Email Template:
            </label>
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded"
              rows="5"
            />
          </div>
          <EmailSender
            emailData={emailData}
            template={template}
            fieldMapping={{
              FirstName: "FirstName",
              LastName: "LastName",
              Email: "Email",
            }}
            onSend={handleSendEmails}
          />
        </>
      )}
    </div>
  );
};

export default EmailMergeTool;
