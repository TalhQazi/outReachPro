import React, { useState } from "react";

const MergeFieldsMapper = ({ emailData }) => {
  const [fieldMapping, setFieldMapping] = useState({
    FirstName: "", // Initially empty
    LastName: "",
    Email: "", // Initially empty
  });

  const handleMappingChange = (placeholder, field) => {
    setFieldMapping((prevMapping) => ({
      ...prevMapping,
      [placeholder]: field,
    }));
  };

  const availableFields = Object.keys(emailData[0] || {});

  return (
    <div className="p-4 mt-12 text-3xl bg-white rounded-lg shadow-sm ">
      <h3 className="mb-2 text-3xl font-medium text-center text-gray-700 ">
        Map Merge Fields
      </h3>
      <p className="mb-8 text-base text-center ">
        Please Select the Corresponding Columns in the File
      </p>

      {/* First Name Field Mapping */}
      <div className="mb-8">
        <label className="block mb-2 font-medium text-gray-700">
          First Name Field:
        </label>
        <select
          value={fieldMapping.FirstName} // Controlled value
          onChange={(e) => handleMappingChange("FirstName", e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
        >
          <option value="">Select a field</option>
          {availableFields.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
      </div>

      {/* Last Name Field Mapping */}
      <div className="mb-8">
        <label className="block mb-2 font-medium text-gray-700">
          Last Name Field:
        </label>
        <select
          value={fieldMapping.LastName} // Controlled value
          onChange={(e) => handleMappingChange("LastName", e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
        >
          <option value="">Select a field</option>
          {availableFields.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
      </div>

      {/* Extra Field Mapping */}
      <div className="mb-4">
        <label className="block mb-2 font-medium text-gray-700">
          Email Field:
        </label>
        <select
          value={fieldMapping.Email} // Controlled value
          onChange={(e) => handleMappingChange("Email", e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
        >
          <option value="">Select a field</option>
          {availableFields.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
      </div>

      {/* Display Current Mapping */}
      <h4 className="mt-8 mb-6 font-medium text-center text-gray-700">
        Current Mapping
      </h4>
      <pre className="p-4 mt-2 text-lg bg-gray-100 rounded-lg sm:text-base">
        {JSON.stringify(fieldMapping, null, 2)}
      </pre>
    </div>
  );
};

export default MergeFieldsMapper;
