import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginButton from "./Layout/UI/LoginButton";
import Home from "./Pages/Home/Home";
import Navbar from "./Components/Navbar/Navbar";
import EmailMergeTool from "./Components/MailMerge/EmailMergeTool";
import EmailAutoResponder from "./Components/EmailSchedule/EmailAutoResponder";
import SendCcBccPage from "./Components/CC&BCC Columns/SendCcBccPage";
import TrackingReport from "./Components/Tracking/TrackingReport";
import EmailPreview from "./Components/EmailPreview/EmailPreview";
import EmailDraftSender from "./Components/EmailDraft/EmailDraftSender";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path={"/"} element={<Home />} />

          <Route path={"/login"} element={<LoginButton />} />
          <Route path={"/test"} element={<EmailPreview />} />

          <Route path={"/send"} element={<EmailMergeTool />} />
          <Route path={"/draft"} element={<EmailDraftSender />} />

          <Route path={"/bcc"} element={<SendCcBccPage />} />
          <Route path={"/tracking"} element={<TrackingReport />} />

          <Route path={"/send/responde"} element={<EmailAutoResponder />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
