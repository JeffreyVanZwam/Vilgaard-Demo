import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { storeRefreshToken } from "~/server/api/utils/userSession"; // Import the function to store the refresh token

export default defineNuxtPlugin((nuxtApp) => {
  const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
  };

  initializeApp(firebaseConfig);

  const auth = getAuth();

  // On successful authentication, store the refresh token
  onAuthStateChanged(auth, (user) => {
    if (user) {
      user
        .getIdToken(true) // Force refresh the token to get the latest refresh token
        .then((refreshToken) => {
          // Store the refresh token on the server-side
          const userId = user.uid; // You should have a way to identify the user for their session
          storeRefreshToken(userId, refreshToken);
        })
        .catch((error) => {
          console.error("Error refreshing token:", error);
        });
    }
  });

  return {
    provide: {
      auth: async () => await auth,
      authDirect: () => auth,
      //   demo: () => "Dit is een random string",
    },
  };
});
