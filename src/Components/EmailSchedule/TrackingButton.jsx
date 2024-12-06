import React from "react";

const TrackingButton = ({ onFetch }) => {
  return (
    <button
      onClick={onFetch}
      className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
    >
      Update Tracking Report
    </button>
  );
};

export default TrackingButton;
