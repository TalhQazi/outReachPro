import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { initializeGmailAPI, sendEmail } from "../../Services/gmailApi";

const EmailPreview = () => {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [isClientLoaded, setIsClientLoaded] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages

    try {
      // Await the email sending logic
      initializeGmailAPI();
      const emails = [{ Email: email }];
      await sendEmail(email, subject, body, emails, 1);
      setMessage("Email sent successfully!"); // Success message
    } catch (error) {
      console.error("Error sending email:", error); // Log error for debugging
      setMessage("Error sending email. Please try again."); // Error message
    }
  };

  return (
    <motion.div
      className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.h2
        className="text-2xl font-semibold text-center text-gray-800 mb-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Email Preview
      </motion.h2>

      <motion.form
        className="space-y-4"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div>
          <label className="block text-gray-700 font-medium">Email:</label>
          <motion.input
            type="email"
            className="mt-1 block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            whileFocus={{ scale: 1.02 }}
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Subject:</label>
          <motion.input
            type="text"
            className="mt-1 block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            whileFocus={{ scale: 1.02 }}
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Body:</label>
          <motion.textarea
            className="mt-1 block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500 h-32 resize-none"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            whileFocus={{ scale: 1.02 }}
          />
        </div>
        <motion.button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Send Test Email
        </motion.button>
      </motion.form>

      {message && (
        <motion.p
          className={`text-center mt-4 ${
            message.includes("successfully") ? "text-green-600" : "text-red-600"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
};

export default EmailPreview;
