import React, { useState, useRef } from "react";
import { authenticateUser } from "../../Services/auth";
import { sendEmail } from "../../Services/gmailApi";
import applyMergeFields from "../MailMerge/appyMergeField";
import ScheduleManager from "../EmailSchedule/ScheduleManager";
import { updateEmailStatusInSheet } from "../../Services/sheetsAPI";

const EmailSender = ({ emailData, template, fieldMapping }) => {
  const [status, setStatus] = useState("Idle");
  const [subject, setSubject] = useState("");
  const [linkText, setLinkText] = useState("");
  const [url, setUrl] = useState("");
  // const [currentBatch, setCurrentBatch] = useState(0);
  // const [progress, setProgress] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [shouldStop, setShouldStop] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailsSent, setEmailsSent] = useState(0);
  const [minDelay, setMinDelay] = useState(10000);
  const [maxDelay, setMaxDelay] = useState(60000);
  const [emailsSentLog, setEmailsSentLog] = useState([]);
  // const BATCH_SIZE = 100;
  // const DELAY_BETWEEN_BATCHES = 10000;

  // Refs for pause and stop functionality
  const pauseRef = useRef(false);
  const stopRef = useRef(false);

  const getRandomDelay = () => {
    const min = parseInt(minDelay, 10) || 1000;
    const max = parseInt(maxDelay, 10) || 5000;
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  // const sendEmailBatch = async (batch) => {
  //   for (let recipient of batch) {
  //     if (stopRef.current) {
  //       setStatus("Stopped");
  //       setIsSending(false);
  //       return;
  //     }

  //     // while (pauseRef.current) {
  //     //   await new Promise((resolve) => setTimeout(resolve, 1000)); // Check every second
  //     // }

  //     try {
  //       let personalizedEmail = applyMergeFields(
  //         template,
  //         recipient,
  //         fieldMapping
  //       );

  //       if (linkText && url) {
  //         personalizedEmail += <p><a href="${url}">${linkText}</a></p>;
  //       }

  //       await sendEmail(recipient.Email, subject, personalizedEmail, batch);
  //       setEmailsSent((prev) => prev + 1);

  //       const accessToken = sessionStorage.getItem("access_token");
  //       await updateEmailStatusInSheet(
  //         recipient.Email,
  //         "Sent",
  //         "No",
  //         "No-Reply",
  //         accessToken
  //       );

  //       const randomDelay = getRandomDelay();
  //       await new Promise((resolve) => setTimeout(resolve, randomDelay));
  //     } catch (error) {
  //       console.error("Error sending email to", recipient.Email, error);
  //       setErrorMessage(Failed to send email to ${recipient.Email});
  //     }
  //   }
  // };
  const sleep = (ms) =>
    new Promise((resolve) =>
      setTimeout(() => {
        setEmailsSent((prev) => prev + 1);
        return resolve;
      }, ms)
    );

    const startDripFeed = async () => {
      if (isSending) {
        setErrorMessage(
          "You can't start sending emails while it's already in progress."
        );
        return;
      }
    
      const confirmed = window.confirm(
        "Are you sure you want to start? You can't undo this action."
      );
      if (!confirmed) return;
    
      if (!subject.trim()) {
        setErrorMessage("Subject line is required.");
        return;
      }
    
      if (linkText && !url.trim()) {
        setErrorMessage("Please provide a valid URL if you are adding a link.");
        return;
      }
    
      try {
        setStatus("Sending");
        setIsSending(true);
        setShouldStop(false);
        setErrorMessage("");
        setEmailsSent(0);
        stopRef.current = false;
    
        
          if (stopRef.current) {
            setStatus("Stopped");
            setIsSending(false);
            return;
          }
          // if(status === "Stopped"){
          //   break;
          // }
          const recipient = ""
          try {
            let personalizedEmail = applyMergeFields(
              template,
              recipient,
              fieldMapping
            );
    
            if (linkText && url) {
              personalizedEmail += <p><a href="${url}">${linkText}</a></p>;
            }
    
            const delay = getRandomDelay();
            // if(!recipient || !recipient.Email){
            //   return
            // }
            const accessToken = sessionStorage.getItem("access_token");
            const sheet_id = sessionStorage.getItem("sheet_id");
            await sendEmail(recipient, subject, personalizedEmail,emailData,delay,sheet_id,accessToken); // Await the email send
            // setEmailsSent((prev) => prev + 1);
    
            console.log(accessToken)
            // await updateEmailStatusInSheet(
            //   recipient.Email,
            //   "Sent",
            //   "No",
            //   "No-Reply",
            //   accessToken
            // );
    
            console.log(`Email sent to ${recipient.Email}. Waiting for ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay)); // Add the delay
          } catch (error) {
            console.error("Error sending email to", recipient.Email, error);
            setErrorMessage(`Failed to send or save email to ${recipient.Email}`);
          }
        
    
        setStatus("Completed");
        setIsSending(false);
      } catch (error) {
        console.error("Error starting drip feed", error);
        setErrorMessage("Failed to send emails. Please try again.");
        setStatus("Completed");
        setIsSending(false);
      }
    };
    
  const handleStopSending = () => {
    stopRef.current = true;
    setStatus("Stopped");
    setIsSending(false);
  };

  const handlePauseResume = () => {
    pauseRef.current = !pauseRef.current;
    setStatus(pauseRef.current ? "Paused" : "Sending");
  };
  const handleEmailsSent = (email) => {
    setEmailsSentLog((prev) => [...prev, email]);
  };

  return (
    <>
      <div className="mt-4">
        <label className="block mb-6 text-3xl font-semibold text-center text-gray-700">
          Subject Line:
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full p-2 mt-1 border border-gray-300 rounded"
          placeholder="Enter the email subject"
        />
      </div>

      <div className="mt-4">
        <label className="block mb-2 text-xl font-semibold text-gray-700">
          Link Text:
        </label>
        <input
          type="text"
          value={linkText}
          onChange={(e) => setLinkText(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Enter the text for the link"
        />
      </div>

      <div className="mt-4">
        <label className="block mb-2 text-xl font-semibold text-gray-700">
          URL:
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Enter the URL"
        />
      </div>

      <div className="p-6 mx-auto mt-6 text-3xl bg-white border border-gray-300 rounded-lg shadow-sm ">
        <h3 className="mb-6 text-3xl font-bold text-center">Send Emails</h3>
        <p className="mb-4 text-center ">
          Status: <strong>{status}</strong>
        </p>
        {/* <p className="mb-4 text-center">
          Emails Sent: <strong>{emailsSent}</strong>
        </p>
        <p className="text-center">
          Remaining Emails: <strong>{emailData.length - emailsSent}</strong>
        </p> */}

        <div className="mt-4">
          <label className="block text-xl">Minimum Delay (ms):</label>
          <input
            type="number"
            value={minDelay}
            onChange={(e) => setMinDelay(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            min="10000"
          />
        </div>

        <div className="mt-4">
          <label className="block text-xl">Maximum Delay (ms):</label>
          <input
            type="number"
            value={maxDelay}
            onChange={(e) => setMaxDelay(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            min="minDelay + 1"
          />
        </div>

        {errorMessage && (
          <p className="mt-2 text-center text-red-500">{errorMessage}</p>
        )}

        {status === "Idle" && !isSending && (
          <button
            onClick={startDripFeed}
            className="w-full px-4 py-3 mt-4 font-semibold text-white bg-green-500 rounded hover:bg-green-600"
          >
            Start Sending Emails
          </button>
        )}

        {isSending && (
          <button
            onClick={handlePauseResume}
            className="w-full px-4 py-3 mt-4 font-semibold text-white bg-yellow-500 rounded hover:bg-yellow-600"
          >
            {pauseRef.current ? "Resume" : "Pause"} Sending Emails
          </button>
        )}

        {isSending && (
          <button
            onClick={handleStopSending}
            className="w-full px-4 py-3 mt-4 font-semibold text-white bg-red-500 rounded hover:bg-red-600"
          >
            Stop Sending Emails
          </button>
        )}

        {status === "Completed" && !isSending && (
          <button
            onClick={startDripFeed}
            className="w-full px-4 py-3 mt-4 font-semibold text-white bg-green-500 rounded hover:bg-green-600"
          >
            Start Sending Again
          </button>
        )}

        <ScheduleManager
          emailData={emailData}
          template={template}
          subject={subject}
          fieldMapping={fieldMapping}
          onEmailsSent={handleEmailsSent}
        />
      </div>
    </>
  );
};

export default EmailSender;