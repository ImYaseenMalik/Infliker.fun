// Replace with your Firebase config from Step 3
const firebaseConfig = {
  apiKey: "AIzaSyAwNuq_h5KkDpm55RUYVGLkZnO3wRluYzs",
  authDomain: "inflikercms.firebaseapp.com",
  projectId: "inflikercms",
  storageBucket: "inflikercms.firebasestorage.app",
  messagingSenderId: "1035107054478",
  appId: "1:1035107054478:web:a2a7851cf94a2ee8626adf"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize services (NO storage)
const auth = firebase.auth();
const db = firebase.firestore();

// Firebase Auth providers
const googleProvider = new firebase.auth.GoogleAuthProvider();
