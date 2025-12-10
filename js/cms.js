// CMS Functions - No Firebase Storage, only Firestore

// Generate slug from title
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 100);
}

// Load recent posts for homepage
async function loadRecentPosts(limit = 3) {
    try {
        const postsRef = db.collection('posts');
        const snapshot = await postsRef
            .where('published', '==', true)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
        
        displayPosts(snapshot, 'postsContainer');
        
    } catch (error) {
        console.error('Error loading posts:', error);
        const container = document.getElementById('postsContainer');
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
        
        displayPosts(snapshot, 'blogPostsContainer');
        
    } catch (error) {
        console.error('Error loading posts:', error);
        const container = document.getElementById('blogPostsContainer');
        if (container) {
            container.innerHTML = '<p class="error">Error loading posts. Please try again later.</p>';
        }
    }
}

// Display posts in container
function displayPosts(snapshot, containerId) {
    const container = document.getElementById(containerId);
    
    if (!snapshot || snapshot.empty) {
        container.innerHTML = '<p class="no-posts">No posts yet. Check back soon!</p>';
        return;
    }
    
    let html = '<div class="post-grid">';
    
    snapshot.forEach(doc => {
        const post = doc.data();
        const date = post.createdAt ? post.createdAt.toDate() : new Date();
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Use default image if none provided
        const imageUrl = post.featuredImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=200&fit=crop';
        
        // Truncate content for excerpt
        const excerpt = post.excerpt || 
            (post.content ? post.content.substring(0, 150) + '...' : 'Read more...');
        
        html += `
            <div class="post-card">
                <img src="${imageUrl}" alt="${post.title}" class="post-image" onerror="this.src='https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=200&fit=crop'">
                <div class="post-content">
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-date">${formattedDate}</p>
                    <p class="post-excerpt">${excerpt}</p>
                    <a href="single-post.html?id=${doc.id}" class="read-more">Read More →</a>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Load all posts for admin panel
async function loadAllPostsForAdmin() {
    try {
        const postsRef = db.collection('posts');
        const snapshot = await postsRef
            .orderBy('createdAt', 'desc')
            .get();
        
        const container = document.getElementById('allPosts');
        
        if (!snapshot || snapshot.empty) {
            container.innerHTML = '<p class="no-posts">No posts created yet.</p>';
            return;
        }
        
        let html = '<div class="admin-posts-grid">';
        
        snapshot.forEach(doc => {
            const post = doc.data();
            const date = post.createdAt ? post.createdAt.toDate() : new Date();
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Status badge
            const statusBadge = post.published 
                ? '<span class="badge published">Published</span>' 
                : '<span class="badge draft">Draft</span>';
            
            html += `
                <div class="admin-post-card">
                    <div class="admin-post-header">
                        <h4>${post.title || 'Untitled'}</h4>
                        ${statusBadge}
                    </div>
                    <div class="admin-post-info">
                        <span>📅 ${formattedDate}</span>
                        <span>👤 ${post.authorName || post.author || 'Admin'}</span>
                    </div>
                    <div class="admin-post-preview">
                        ${(post.content || '').substring(0, 100)}...
                    </div>
                    <div class="admin-post-actions">
                        <button onclick="editPost('${doc.id}')" class="btn-action edit">✏️ Edit</button>
                        <button onclick="togglePublish('${doc.id}', ${!post.published})" class="btn-action ${post.published ? 'unpublish' : 'publish'}">
                            ${post.published ? '📭 Unpublish' : '📤 Publish'}
                        </button>
                        <button onclick="deletePost('${doc.id}')" class="btn-action delete">🗑️ Delete</button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('allPosts').innerHTML = '<p class="error">Error loading posts: ' + error.message + '</p>';
    }
}

// Create new post
async function createPost() {
    if (!auth.currentUser) {
        showMessage('Please login first', 'error');
        return;
    }
    
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    const excerpt = document.getElementById('postExcerpt').value.trim();
    const slug = document.getElementById('postSlug').value.trim() || generateSlug(title);
    const imageUrl = document.getElementById('featuredImageUrl').value.trim();
    const published = document.getElementById('postPublished').checked;
    
    if (!title || !content) {
        showMessage('Title and content are required', 'error');
        return;
    }
    
    try {
        const postData = {
            title,
            content,
            excerpt: excerpt || content.substring(0, 200) + '...',
            slug: slug || generateSlug(title),
            featuredImage: imageUrl || '',
            published: published,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            author: auth.currentUser.email,
            authorName: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
            authorPhoto: auth.currentUser.photoURL || ''
        };
        
        await db.collection('posts').add(postData);
        
        // Clear form
        document.getElementById('postTitle').value = '';
        document.getElementById('postContent').value = '';
        document.getElementById('postExcerpt').value = '';
        document.getElementById('postSlug').value = '';
        document.getElementById('featuredImageUrl').value = '';
        document.getElementById('imagePreview').innerHTML = '';
        
        showMessage(`Post ${published ? 'published' : 'saved as draft'} successfully!`, 'success');
        
        // Load updated posts list
        loadAllPostsForAdmin();
        
        // Switch to posts section after 2 seconds
        setTimeout(() => {
            showSection('posts');
        }, 2000);
        
    } catch (error) {
        console.error('Error creating post:', error);
        showMessage('Error creating post: ' + error.message, 'error');
    }
}

// Save as draft
async function saveDraft() {
    document.getElementById('postPublished').checked = false;
    await createPost();
}

// Delete post
async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
    
    try {
        await db.collection('posts').doc(postId).delete();
        showMessage('Post deleted successfully!', 'success');
        loadAllPostsForAdmin();
    } catch (error) {
        console.error('Error deleting post:', error);
        showMessage('Error deleting post: ' + error.message, 'error');
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
        showMessage('Error updating post: ' + error.message, 'error');
    }
}

// Edit post (basic implementation)
async function editPost(postId) {
    try {
        const doc = await db.collection('posts').doc(postId).get();
        if (doc.exists) {
            const post = doc.data();
            
            // Populate form with post data
            document.getElementById('postTitle').value = post.title || '';
            document.getElementById('postContent').value = post.content || '';
            document.getElementById('postExcerpt').value = post.excerpt || '';
            document.getElementById('postSlug').value = post.slug || '';
            document.getElementById('featuredImageUrl').value = post.featuredImage || '';
            document.getElementById('postPublished').checked = post.published || false;
            
            // Show image preview
            if (post.featuredImage) {
                document.getElementById('imagePreview').innerHTML = 
                    `<img src="${post.featuredImage}" alt="Preview" style="max-width: 300px; margin-top: 10px;">`;
            }
            
            // Switch to edit mode
            showSection('new-post');
            document.querySelector('#newPostSection h2').textContent = 'Edit Post';
            
            // Change button to update
            const publishBtn = document.querySelector('#newPostSection .btn-primary');
            if (publishBtn) {
                publishBtn.textContent = 'Update Post';
                publishBtn.onclick = function() { updatePost(postId); };
            }
        }
    } catch (error) {
        console.error('Error loading post:', error);
        showMessage('Error loading post: ' + error.message, 'error');
    }
}

// Update post
async function updatePost(postId) {
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    const excerpt = document.getElementById('postExcerpt').value.trim();
    const slug = document.getElementById('postSlug').value.trim() || generateSlug(title);
    const imageUrl = document.getElementById('featuredImageUrl').value.trim();
    const published = document.getElementById('postPublished').checked;
    
    if (!title || !content) {
        showMessage('Title and content are required', 'error');
        return;
    }
    
    try {
        await db.collection('posts').doc(postId).update({
            title,
            content,
            excerpt: excerpt || content.substring(0, 200) + '...',
            slug: slug || generateSlug(title),
            featuredImage: imageUrl || '',
            published: published,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showMessage('Post updated successfully!', 'success');
        loadAllPostsForAdmin();
        
        // Switch back to posts section
        setTimeout(() => {
            showSection('posts');
            // Reset form
            document.querySelector('#newPostSection h2').textContent = 'Create New Post';
            const publishBtn = document.querySelector('#newPostSection .btn-primary');
            if (publishBtn) {
                publishBtn.textContent = 'Publish Post';
                publishBtn.onclick = function() { createPost(); };
            }
        }, 1500);
        
    } catch (error) {
        console.error('Error updating post:', error);
        showMessage('Error updating post: ' + error.message, 'error');
    }
}

// Load single post for single-post.html
async function loadSinglePost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    if (!postId) {
        document.getElementById('postContent').innerHTML = '<p>Post not found</p>';
        return;
    }
    
    try {
        const doc = await db.collection('posts').doc(postId).get();
        
        if (doc.exists) {
            const post = doc.data();
            
            // Update page title
            document.title = post.title + ' - My Website';
            
            // Display post
            const date = post.createdAt ? post.createdAt.toDate() : new Date();
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            const html = `
                <article class="single-post">
                    ${post.featuredImage ? `
                        <img src="${post.featuredImage}" alt="${post.title}" class="featured-image">
                    ` : ''}
                    
                    <header class="post-header">
                        <h1>${post.title}</h1>
                        <div class="post-meta">
                            <span class="post-date">📅 ${formattedDate}</span>
                            <span class="post-author">👤 ${post.authorName || post.author}</span>
                        </div>
                    </header>
                    
                    <div class="post-content">
                        ${post.content.replace(/\n/g, '<br>')}
                    </div>
                    
                    <div class="post-footer">
                        <a href="blog.html" class="btn">← Back to Blog</a>
                    </div>
                </article>
            `;
            
            document.getElementById('postContent').innerHTML = html;
        } else {
            document.getElementById('postContent').innerHTML = '<p>Post not found</p>';
        }
    } catch (error) {
        console.error('Error loading post:', error);
        document.getElementById('postContent').innerHTML = '<p>Error loading post</p>';
    }
}
