import admin from "firebase-admin";

export async function getNewAccessToken(refreshToken) {
  try {
    const refreshedIdToken = await admin
      .auth()
      .verifyIdToken(refreshToken, true);
    return refreshedIdToken.accessToken;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw new Error("Failed to refresh access token");
  }
}
