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
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization error:", error);
}

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Set Firestore settings (important for web)
db.settings({ 
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED 
});

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});
