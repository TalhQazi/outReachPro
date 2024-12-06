import { GoogleLogin } from "@react-oauth/google";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { initGapiClient } from "../../Services/auth";

const LoginButton = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const id = sessionStorage.getItem("id");
    if (id) {
      navigate("/");
    }
  }, [navigate]);

  const successMessage = async (credentialResponse) => {
    try {
      await initGapiClient();

      const GoogleAuth = window.gapi.auth2.getAuthInstance();
      const user = await GoogleAuth.signIn();

      const accessToken = user.getAuthResponse().access_token;

      sessionStorage.setItem("access_token", accessToken);
      alert("Login successful");
      navigate("/");
      if (credentialResponse) {
        const jwtToken = credentialResponse.credential;
        sessionStorage.setItem("id", credentialResponse.clientId);
        sessionStorage.setItem("data", jwtToken);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const errorMessage = () => {
    console.log("Login Failed");
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <GoogleLogin onSuccess={successMessage} onError={errorMessage} />
    </div>
  );
};

export default LoginButton;
