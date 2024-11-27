const fireBaseAdmin = {
  auth: jest.fn().mockReturnThis(),
  credential: {
    cert: jest.fn(),
  },
  initializeApp: jest.fn().mockReturnThis(),
};

export default fireBaseAdmin;
