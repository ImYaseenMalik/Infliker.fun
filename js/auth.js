let currentUser = null;

// Check authentication state
function checkAuthState() {
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        const adminLink = document.getElementById('adminLink');
        
        if (user) {
            console.log('User logged in:', user.email);
            // User is logged in
            const loginSection = document.getElementById('loginSection');
            const dashboard = document.getElementById('dashboard');
            
            if (loginSection) loginSection.style.display = 'none';
            if (dashboard) {
                dashboard.style.display = 'block';
                showSection('posts');
                loadAllPostsForAdmin();
            }
            
            // Update admin link on all pages
            if (adminLink) {
                adminLink.textContent = 'Dashboard';
                adminLink.style.backgroundColor = '#4CAF50';
            }
            
        } else {
            // User is logged out
            const loginSection = document.getElementById('loginSection');
            const dashboard = document.getElementById('dashboard');
            
            if (loginSection) loginSection.style.display = 'block';
            if (dashboard) dashboard.style.display = 'none';
            
            if (adminLink) {
                adminLink.textContent = 'Admin';
                adminLink.style.backgroundColor = '';
            }
        }
    });
}

// Google Login function
function loginWithGoogle() {
    auth.signInWithPopup(googleProvider)
        .then((result) => {
            showMessage('Login successful! Welcome ' + result.user.displayName, 'success');
        })
        .catch((error) => {
            console.error('Login error:', error);
            document.getElementById('loginError').textContent = error.message;
            document.getElementById('loginError').style.display = 'block';
        });
}

// Email/Password login (optional backup)
function loginWithEmail() {
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
            showMessage('Logged out successfully', 'success');
            window.location.href = 'admin.html';
        })
        .catch((error) => {
            console.error('Logout error:', error);
        });
}

// Show different sections
function showSection(section) {
    // Hide all sections
    const sections = ['postsSection', 'newPostSection', 'usersSection'];
    sections.forEach(sec => {
        const el = document.getElementById(sec);
        if (el) el.style.display = 'none';
    });
    
    // Show selected section
    if (section === 'posts') {
        document.getElementById('postsSection').style.display = 'block';
        loadAllPostsForAdmin();
    } else if (section === 'new-post') {
        document.getElementById('newPostSection').style.display = 'block';
        document.getElementById('imagePreview').innerHTML = '';
    } else if (section === 'users') {
        document.getElementById('usersSection').style.display = 'block';
    }
}

// Show message
function showMessage(message, type) {
    const messageDiv = document.getElementById('message') || document.createElement('div');
    messageDiv.id = 'message';
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // Add to DOM if not already there
    if (!document.getElementById('message')) {
        document.querySelector('.admin-main').prepend(messageDiv);
    }
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Check if user is admin (simple check)
function isAdmin() {
    return currentUser !== null;
}
