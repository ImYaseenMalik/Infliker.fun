// Authentication functions
let currentUser = null;

// Check authentication state
function checkAuthState() {
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        if (user) {
            // User is logged in
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            showSection('posts');
            loadAllPostsForAdmin();
            
            // Update admin link on all pages
            const adminLinks = document.querySelectorAll('#adminLink');
            adminLinks.forEach(link => {
                link.textContent = 'Dashboard';
            });
        } else {
            // User is logged out
            document.getElementById('loginSection').style.display = 'block';
            document.getElementById('dashboard').style.display = 'none';
        }
    });
}

// Login function
function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            showMessage('Login successful!', 'success');
        })
        .catch((error) => {
            document.getElementById('loginError').textContent = error.message;
            document.getElementById('loginError').style.display = 'block';
        });
}

// Logout function
function logout() {
    auth.signOut()
        .then(() => {
            window.location.href = 'admin.html';
        })
        .catch((error) => {
            console.error('Logout error:', error);
        });
}

// Show different sections
function showSection(section) {
    // Hide all sections
    document.getElementById('postsSection').style.display = 'none';
    document.getElementById('newPostSection').style.display = 'none';
    
    // Show selected section
    if (section === 'posts') {
        document.getElementById('postsSection').style.display = 'block';
        loadAllPostsForAdmin();
    } else if (section === 'new-post') {
        document.getElementById('newPostSection').style.display = 'block';
    }
}

// Show message
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}
