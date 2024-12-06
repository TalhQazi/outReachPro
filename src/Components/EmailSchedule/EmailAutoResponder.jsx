import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { sendEmail } from "../../Services/gmailApi";

const EmailAutoResponder = () => {
  const [responses, setResponses] = useState([]);
  const [replyEmail, setReplyEmail] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize Gmail API and set the "From" email
  const initializeGmailAPI = () => {
    const scopes = [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/gmail.compose",
    ].join(" ");
    return new Promise((resolve, reject) => {
      window.gapi.load("client:auth2", async () => {
        try {
          await window.gapi.client.init({
            apiKey: import.meta.env.VITE_API_KEY,
            clientId: import.meta.env.VITE_CLIENT_ID,
            clientSecret: import.meta.env.VITE_CLIENT_SECRET,
            redirectUri: import.meta.env.VITE_REDIRECT_URI,
            discoveryDocs: [
              "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
            ],
            scope: scopes,
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  const handleCustomReply = async () => {
    if (!replyEmail) {
      alert("Please enter a valid email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(replyEmail)) {
      alert("Please enter a valid email address format.");
      return;
    }

    const message = `Thank You for showing interest!`;
    setLoading(true);

    try {
      const emails = [{ Email: replyEmail }];
      await sendEmail(replyEmail, "Custom Reply", message, emails, 1);
      alert(`Reply sent to ${replyEmail}`);
      setResponses((prev) => [...prev, `Reply sent to: ${replyEmail}`]);
    } catch (error) {
      console.error(`Failed to send email to ${replyEmail}:`, error);
      alert("Failed to send email. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeGmailAPI();
        console.log("Gmail API initialized successfully.");
        const storedEmail = sessionStorage.getItem("email");
        if (storedEmail) {
          setEmail(storedEmail);
        }
      } catch (error) {
        console.error("Error initializing Gmail API:", error);
      }
    };

    initialize();
  }, []);

  return (
    <motion.div
      className="p-4 mt-6 bg-white border border-gray-300 rounded-lg shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h3
        className="text-3xl font-bold text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Email Auto Responder
      </motion.h3>

      <motion.div
        className="mt-4"
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <label className="block text-xl font-semibold">From:</label>
        <input
          type="text"
          value={email}
          readOnly
          className="w-full p-2 mt-2 border border-gray-300 rounded"
        />
      </motion.div>

      <motion.div
        className="mt-4"
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <label className="block text-xl font-semibold">To:</label>
        <input
          type="email"
          value={replyEmail}
          onChange={(e) => setReplyEmail(e.target.value)}
          placeholder="Enter recipient email"
          className="w-full p-2 mt-2 border border-gray-300 rounded"
        />
      </motion.div>

      <motion.button
        onClick={handleCustomReply}
        disabled={loading}
        className={`w-full px-4 py-2 mt-4 font-semibold text-white rounded ${
          loading ? "bg-gray-500" : "bg-green-500 hover:bg-green-600"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {loading ? "Sending..." : "Send Custom Reply"}
      </motion.button>

      <motion.h4
        className="mt-6 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        Responses:
      </motion.h4>
      <motion.ul
        className="pl-5 list-disc"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        {responses.map((response, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {response}
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
};

export default EmailAutoResponder;
