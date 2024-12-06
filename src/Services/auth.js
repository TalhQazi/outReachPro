import { gapi } from "gapi-script";

// Initialize the GAPI client with Gmail API
export const initGapiClient = async () => {
  return new Promise((resolve, reject) => {
    gapi.load("client:auth2", () => {
      gapi.client
        .init({
          apiKey: import.meta.env.VITE_API_KEY, // Your API key here
          clientId: import.meta.env.VITE_CLIENT_ID, // Your Client ID here
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
          ],
          scope:
            "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.modify",
        })
        .then(() => {
          const authInstance = gapi.auth2.getAuthInstance();
          resolve(authInstance);
        })
        .catch((err) => reject(err));
    });
  });
};

// Function to authenticate the user
export const authenticateUser = async () => {
  return new Promise((resolve, reject) => {
    window.gapi.auth2
      .getAuthInstance()
      .signIn()
      .then((user) => {
        const authResult = {
          accessToken: user.getAuthResponse().access_token,
          profile: user.getBasicProfile(),
        };
        resolve(authResult);
      })
      .catch((error) => {
        console.error("Authentication failed:", error);
        reject(error);
      });
  });
};
