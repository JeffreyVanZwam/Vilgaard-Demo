const userSessions = new Map();

function storeRefreshToken(userId, refreshToken) {
  userSessions.set(userId, refreshToken);
}

function getRefreshToken(userId) {
  return userSessions.get(userId);
}

export { storeRefreshToken, getRefreshToken };
