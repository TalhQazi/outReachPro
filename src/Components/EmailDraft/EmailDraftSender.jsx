import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { listDrafts, sendEmail } from "../../Services/gmailApi";
import {
  createSpreadsheet,
  updateEmailStatusInSheet,
} from "../../Services/sheetsAPI";
import ScheduleManager from "../EmailSchedule/ScheduleManager";
import { motion } from "framer-motion";

const EmailDraftSender = () => {
  const pageVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const [auth, setAuth] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [minDelay, setMinDelay] = useState("");
  const [maxDelay, setMaxDelay] = useState("");
  const [scheduleTime, setScheduleTime] = useState(null);
  const [MAX_RETRIES, setMAX_RETRIES] = useState(5);

  const isPausedRef = useRef(false);
  const currentIndexRef = useRef(0);
  const stopSendingRef = useRef(false);

  const initializeGmailAPI = async () => {
    const scopes = [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/gmail.compose",
    ].join(" ");

    return new Promise((resolve, reject) => {
      window.gapi.load("client:auth2", async () => {
        try {
          await window.gapi.client.init({
            apiKey: import.meta.env.VITE_API_KEY,
            clientId: import.meta.env.VITE_CLIENT_ID,
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

  const authenticateAndFetchDrafts = async () => {
    try {
      setIsLoading(true);
      await initializeGmailAPI();
      const draftsList = await listDrafts();
      setDrafts(draftsList);
    } catch (error) {
      console.error("Error initializing Gmail API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    authenticateAndFetchDrafts();
    return () => {
      stopSendingRef.current = true;
    };
  }, []);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop().toLowerCase();
    const fileNameWithoutExtension = file.name.replace(`.${fileExtension}`, "");
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = e.target.result;
      if (fileExtension === "csv") {
        Papa.parse(data, {
          header: true,
          skipEmptyLines: true,
          complete: async (result) => {
            setRecipients(result.data);
            const accessToken = sessionStorage.getItem("access_token");
            const spreadsheetId = await createSpreadsheet(
              accessToken,
              fileNameWithoutExtension
            );
            sessionStorage.setItem("sheet_id", spreadsheetId);
          },
        });
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        const workbook = XLSX.read(data, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = XLSX.utils.sheet_to_json(worksheet);
        setRecipients(excelData);
        const accessToken = sessionStorage.getItem("access_token");
        const spreadsheetId = await createSpreadsheet(
          accessToken,
          fileNameWithoutExtension
        );
        sessionStorage.setItem("sheet_id", spreadsheetId);
      } else {
        alert("Unsupported file format. Please upload a CSV or Excel file.");
      }
    };

    if (fileExtension === "csv") {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const randomDelay = () => {
    const min = parseInt(minDelay, 10) || 1000;
    const max = parseInt(maxDelay, 10) || 5000;
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const handleEmailsSent = (email) => {
    setEmailsSentLog((prev) => [...prev, email]);
  };
  const sendEmailWithRetry = async (
    recipient,
    subject,
    body,
    recipients,
    delay,
    sheet_id,
    accessToken
  ) => {
    let attempt = 0;
    while (attempt < MAX_RETRIES) {
      try {
        await sendEmail(
          recipient,
          subject,
          body,
          recipients,
          delay,
          sheet_id,
          accessToken
        );

        return true;
      } catch (error) {
        attempt++;
        console.error(
          `Failed to send email to ${recipient.Email}, attempt ${attempt}`,
          error
        );
        if (attempt === MAX_RETRIES) {
          const accessToken = sessionStorage.getItem("access_token");
          await updateEmailStatusInSheet(
            recipient.Email,
            "Failed",
            "No",
            "Error",
            accessToken
          );
          return false;
        }
        await sleep(1000); // Wait 1 second before retrying
      }
    }
    return false;
  };

  const sendEmails = async () => {
    if (!selectedDraft) {
      alert("Please select a draft to send.");
      return;
    }
    if (recipients.length === 0) {
      alert("No recipients found. Please upload a file with recipients.");
      return;
    }

    setIsSending(true);
    setIsPaused(false);
    stopSendingRef.current = false;
    currentIndexRef.current = 0;

    const { subject, body } = selectedDraft;
    setSendStatus({ sent: 0, total: recipients.length, errors: [] });

    const recipient = "";
    const delay = randomDelay();
    const sheet_id = sessionStorage.getItem("sheet_id");
    const accessToken = sessionStorage.getItem("access_token");
    const success = await sendEmailWithRetry(
      recipient,
      subject,
      body,
      recipients,
      delay,
      sheet_id,
      accessToken
    );
    console.log(success);
    for (let i = 1; i <= recipients.length; i++) {
      await sleep(randomDelay());
      setSendStatus((prev) => ({
        ...prev,
        sent: prev.sent + 1,
      }));
      if (i === recipients.length) {
        setIsSending(false);
      }
    }
  };

  const handleSendNow = async () => {
    sendEmails(); // Send emails immediately
  };

  const handleScheduleEmails = async () => {
    try {
      if (!scheduleTime) {
        alert("Please select a date and time for scheduling.");
        return;
      }

      const delayUntilSchedule = scheduleTime.getTime() - new Date().getTime();
      if (delayUntilSchedule <= 0) {
        alert("Please select a future time for scheduling.");
        return;
      }

      setTimeout(sendEmails, delayUntilSchedule); // Schedule emails to be sent later
      alert(`email scheduled ${delayUntilSchedule}`);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePauseResume = () => setIsPaused(!isPaused);
  const handleStop = () => {
    stopSendingRef.current = true;
    setIsSending(false);
    setIsPaused(false);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.5 }}
      className="p-6 mx-auto mt-6 text-xl bg-white border border-gray-300 rounded-lg shadow-sm"
    >
      <div className="p-6 mx-auto mt-6 text-xl bg-white border border-gray-300 rounded-lg shadow-sm">
        <h3 className="mb-6 text-3xl font-bold text-center">
          Send Gmail Drafts
        </h3>

        <div className="mb-6">
          <label className="block mb-2 text-lg font-semibold">
            Upload CSV or Excel file:
          </label>
          <input
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={handleFileUpload}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-lg font-semibold">
            Select Draft:
          </label>
          <select
            value={selectedDraft?.id || ""}
            onChange={(e) =>
              setSelectedDraft(
                drafts.find((draft) => draft.id === e.target.value)
              )
            }
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="" disabled>
              Select a draft
            </option>
            {drafts.map((draft) => (
              <option key={draft.id} value={draft.id}>
                {draft.subject || `Draft ID: ${draft.id}`}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-lg font-semibold">
            Minimum Delay (ms):
          </label>
          <input
            type="number"
            value={minDelay || ""}
            onChange={(e) => setMinDelay(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter minimum delay in milliseconds"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-lg font-semibold">
            Maximum Delay (ms):
          </label>
          <input
            type="number"
            value={maxDelay || ""}
            onChange={(e) => setMaxDelay(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter maximum delay in milliseconds"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-lg font-semibold">
            Schedule Send Time (optional):
          </label>
          {selectedDraft && (
            <ScheduleManager
              emailData={recipients}
              template={selectedDraft.body}
              subject={selectedDraft.subject}
              fieldMapping={{ Email: "Email" }} // Adjust field mapping as needed
            />
          )}
        </div>

        <div className="flex gap-4">
          {!isSending ? (
            <button
              onClick={handleSendNow}
              className="flex-1 px-4 py-3 mt-4 font-semibold text-white bg-green-500 rounded hover:bg-green-600"
            >
              Send Now
            </button>
          ) : (
            <>
              <button
                onClick={handlePauseResume}
                className={`flex-1 px-4 py-3 mt-4 font-semibold text-white rounded ${
                  isPaused
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
              >
                {isPaused ? "Resume Sending" : "Pause Sending"}
              </button>

              <button
                onClick={handleStop}
                className="flex-1 px-4 py-3 mt-4 font-semibold text-white bg-red-500 rounded hover:bg-red-600"
              >
                Stop Sending
              </button>
            </>
          )}
        </div>

        {isSending && (
          <div className="mt-4">
            <p className="text-3xl font-semibold text-center">
              Sending
              {isPaused && " (Paused)"}
            </p>
            {sendStatus.errors.length > 0 && (
              <p>Failed to send to: {sendStatus.errors.join(", ")}</p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EmailDraftSender;
