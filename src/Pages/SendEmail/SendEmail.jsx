import React, { useEffect, useState } from "react";
import axios from "axios";

const SendEmail = () => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const getToken = async () => {
      const token = await axios.get(
        "http://localhost:5000/api/auth/google/callback"
      );
      console.log(token);
    };
    getToken();
  }, []);

  const handleSendEmail = async () => {
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(
        "https://www.googleapis.com/auth/gmail.send",
        {
          to,
          subject,
          body: body,
        }
      );
      setSuccess(response.data.message);
      setTo("");
      setSubject("");
      setBody("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to send email");
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Send Email</h1>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <input
        type="email"
        placeholder="Recipient Email"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />
      <textarea
        placeholder="Email Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />

      <button
        onClick={handleSendEmail}
        className="p-2 text-white bg-blue-500 rounded"
      >
        Send Email
      </button>
    </div>
  );
};

export default SendEmail;
