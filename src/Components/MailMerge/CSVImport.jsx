import React, { useState } from "react";
import Papa from "papaparse"; // For CSV parsing
import * as XLSX from "xlsx"; // For Excel parsing
import { createSpreadsheet } from "../../Services/sheetsAPI";

const CSVImport = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = async (e) => {
    setFile(e.target.files[0]);
    const accessToken = sessionStorage.getItem("access_token");
    try {
      const res = await createSpreadsheet(accessToken, "Email Report");
      console.log(res)
      
    } catch (error) {
      console.log(error)
    }
  };

  const handleUpload = () => {
    if (!file) {
      setError("Please upload a valid CSV or Excel file.");
      return;
    }

    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (fileExtension === "csv") {
      parseCSV(file);
    } else if (fileExtension === "xls" || fileExtension === "xlsx") {
      parseExcel(file);
    } else {
      setError("Invalid file format. Please upload a CSV or Excel file.");
    }
  };

  // Parse CSV using PapaParse
  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        onUpload(result.data);
      },
      error: (err) => setError("File Parsing Error: " + err.message),
    });
  };

  // Parse XLS/XLSX using XLSX library
  const parseExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryString = e.target.result;
      const workbook = XLSX.read(binaryString, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
      });

      // Convert Excel data into JSON format (array of objects)
      const headers = sheet[0];
      const rows = sheet.slice(1).map((row) =>
        headers.reduce((acc, header, i) => {
          acc[header] = row[i] || "";
          return acc;
        }, {})
      );
      onUpload(rows);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-4 text-3xl bg-white border border-gray-300 rounded-lg shadow-sm">
      <input
        type="file"
        accept=".csv, .xls, .xlsx"
        onChange={handleFileChange}
        className="block w-full mb-4 text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
      />
      <button
        onClick={handleUpload}
        className="px-4 py-2 mt-4 font-semibold text-white bg-blue-500 rounded hover:bg-blue-600"
      >
        Upload File
      </button>
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
};

export default CSVImport;
