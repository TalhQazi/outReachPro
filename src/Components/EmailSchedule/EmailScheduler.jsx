// EmailScheduler.js
import React, { useState } from "react";

const EmailScheduler = ({ onSchedule }) => {
  const [scheduleTime, setScheduleTime] = useState("");

  const handleSchedule = () => {
    const scheduledDate = new Date(scheduleTime);
    const currentTime = new Date();

    if (scheduledDate <= currentTime) {
      alert("Please select a future time.");
      return;
    }

    // Pass scheduledDate to the parent via the onSchedule callback
    onSchedule(scheduledDate);
    alert(`Email scheduled to be sent at ${scheduledDate.toString()}`);
  };

  return (
    <div className="p-4 mt-6 bg-white border border-gray-300 rounded-lg shadow-sm">
      <h3 className="text-xl font-bold">Schedule Emails</h3>
      <input
        type="datetime-local"
        value={scheduleTime}
        onChange={(e) => setScheduleTime(e.target.value)}
        className="p-2 border border-gray-300 rounded"
      />
      <button
        onClick={handleSchedule}
        className="px-4 py-2 mt-4 font-semibold text-white bg-blue-500 rounded hover:bg-blue-600"
      >
        Schedule Email
      </button>
    </div>
  );
};

export default EmailScheduler;
