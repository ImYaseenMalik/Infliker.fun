// CMS Functions

// Load recent posts for homepage
async function loadRecentPosts(limit = 3) {
    try {
        const postsRef = db.collection('posts');
        const snapshot = await postsRef
            .where('published', '==', true)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
        
        const postsContainer = document.getElementById('postsContainer');
        const blogPostsContainer = document.getElementById('blogPostsContainer');
        
        if (snapshot.empty) {
            const container = postsContainer || blogPostsContainer;
            if (container) {
                container.innerHTML = '<p class="no-posts">No posts yet. Check back soon!</p>';
            }
            return;
        }
        
        let html = '<div class="post-grid">';
        
        snapshot.forEach(doc => {
            const post = doc.data();
            const date = post.createdAt.toDate();
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            html += `
                <div class="post-card">
                    ${post.featuredImage ? `<img src="${post.featuredImage}" alt="${post.title}" class="post-image">` : ''}
                    <div class="post-content">
                        <h3 class="post-title">${post.title}</h3>
                        <p class="post-date">${formattedDate}</p>
                        <p class="post-excerpt">${post.content.substring(0, 150)}...</p>
                        <a href="#" onclick="viewPost('${doc.id}')" class="read-more">Read More</a>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        if (postsContainer) {
            postsContainer.innerHTML = html;
        }
        if (blogPostsContainer) {
            blogPostsContainer.innerHTML = html;
        }
        
    } catch (error) {
        console.error('Error loading posts:', error);
        const container = document.getElementById('postsContainer') || document.getElementById('blogPostsContainer');
        if (container) {
            container.innerHTML = '<p class="error">Error loading posts. Please try again later.</p>';
        }
    }
}

// Load all posts for blog page
async function loadAllPosts() {
    try {
        const postsRef = db.collection('posts');
        const snapshot = await postsRef
            .where('published', '==', true)
            .orderBy('createdAt', 'desc')
            .get();
        
        const container = document.getElementById('blogPostsContainer');
        
        if (snapshot.empty) {
            container.innerHTML = '<p class="no-posts">No posts yet. Check back soon!</p>';
            return;
        }
        
        let html = '<div class="post-grid">';
        
        snapshot.forEach(doc => {
            const post = doc.data();
            const date = post.createdAt.toDate();
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            html += `
                <div class="post-card">
                    ${post.featuredImage ? `<img src="${post.featuredImage}" alt="${post.title}" class="post-image">` : ''}
                    <div class="post-content">
                        <h3 class="post-title">${post.title}</h3>
                        <p class="post-date">${formattedDate}</p>
                        <p class="post-excerpt">${post.content.substring(0, 150)}...</p>
                        <a href="#" onclick="viewPost('${doc.id}')" class="read-more">Read More</a>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading posts:', error);
        const container = document.getElementById('blogPostsContainer');
        container.innerHTML = '<p class="error">Error loading posts. Please try again later.</p>';
    }
}

// Load all posts for admin panel
async function loadAllPostsForAdmin() {
    try {
        const postsRef = db.collection('posts');
        const snapshot = await postsRef
            .orderBy('createdAt', 'desc')
            .get();
        
        const container = document.getElementById('allPosts');
        
        if (snapshot.empty) {
            container.innerHTML = '<p>No posts yet.</p>';
            return;
        }
        
        let html = '<div class="admin-posts">';
        
        snapshot.forEach(doc => {
            const post = doc.data();
            const date = post.createdAt.toDate();
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            html += `
                <div class="admin-post-card">
                    <h4>${post.title}</h4>
                    <p>Published: ${post.published ? 'Yes' : 'No'} | Date: ${formattedDate}</p>
                    <div class="admin-post-actions">
                        <button onclick="editPost('${doc.id}')" class="btn-small">Edit</button>
                        <button onclick="togglePublish('${doc.id}', ${!post.published})" class="btn-small">
                            ${post.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button onclick="deletePost('${doc.id}')" class="btn-small btn-danger">Delete</button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('allPosts').innerHTML = '<p class="error">Error loading posts.</p>';
    }
}

// Create new post
async function createPost() {
    if (!auth.currentUser) {
        showMessage('Please login first', 'error');
        return;
    }
    
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const imageFile = document.getElementById('featuredImage').files[0];
    
    if (!title || !content) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    let imageUrl = '';
    
    try {
        // Upload image if exists
        if (imageFile) {
            const storageRef = storage.ref();
            const imageRef = storageRef.child(`posts/${Date.now()}_${imageFile.name}`);
            await imageRef.put(imageFile);
            imageUrl = await imageRef.getDownloadURL();
        }
        
        // Save post to Firestore
        const postData = {
            title,
            content,
            featuredImage: imageUrl,
            published: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            author: auth.currentUser.email
        };
        
        await db.collection('posts').add(postData);
        
        // Clear form
        document.getElementById('postTitle').value = '';
        document.getElementById('postContent').value = '';
        document.getElementById('featuredImage').value = '';
        document.getElementById('imagePreview').innerHTML = '';
        
        showMessage('Post created successfully!', 'success');
        
        // Load updated posts list
        loadAllPostsForAdmin();
        
    } catch (error) {
        console.error('Error creating post:', error);
        showMessage('Error creating post: ' + error.message, 'error');
    }
}

// Delete post
async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
        await db.collection('posts').doc(postId).delete();
        showMessage('Post deleted successfully!', 'success');
        loadAllPostsForAdmin();
    } catch (error) {
        console.error('Error deleting post:', error);
        showMessage('Error deleting post', 'error');
    }
}

// Toggle publish status
async function togglePublish(postId, publish) {
    try {
        await db.collection('posts').doc(postId).update({
            published: publish,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showMessage(`Post ${publish ? 'published' : 'unpublished'} successfully!`, 'success');
        loadAllPostsForAdmin();
    } catch (error) {
        console.error('Error updating post:', error);
        showMessage('Error updating post', 'error');
    }
}

// Image preview
document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('featuredImage');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('imagePreview').innerHTML = 
                        `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

// View single post (you can expand this)
function viewPost(postId) {
    // Store post ID and redirect to single post page
    localStorage.setItem('currentPostId', postId);
    alert('Single post view would open here. You can create post.html for detailed view.');
}
