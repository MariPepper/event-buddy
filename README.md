# EventBuddy App

EventBuddy is a mobile app built with React Native, Firebase, and the Expo managed workflow. It allows users to authenticate, view and manage events, with configuration safely handled via the `.env` file — which is not included in this repo.

---

# Features

- Firebase Authentication
- Firestore Database
- Environment-based configuration
- Modular Firebase setup
- Expo compatibility

---

# EventBuddy App Setup Instructions (Using Firebase with .env)

npm install
npm install react-native-dotenv

---

# Create a .env file in the root of your project with the following content:
FIREBASE_API_KEY=your-api-key

FIREBASE_AUTH_DOMAIN=your-auth-domain

FIREBASE_PROJECT_ID=your-project-id

FIREBASE_STORAGE_BUCKET=your-storage-bucket

FIREBASE_MESSAGING_SENDER_ID=your-sender-id

FIREBASE_APP_ID=your-app-id

---

# Start the app
npm start

