import React, {useState} from 'react';
import { createPost, getUploadUrl } from '../../services/api';

export default function Editor({token}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  async function handlePublish(){
    const res = await createPost(token, {title, content, status: 'published'});
    alert('Created: ' + res.slug);
  }
  async function handleImage(file){
    const {url, key} = await getUploadUrl(token, file.name);
    await fetch(url, {method:'PUT', body: file}); // upload directly to R2 signed URL
    // then save media record via /api/media endpoint (not shown)
  }

  return (
    <div>
      <h2>Editor</h2>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title"/>
      <textarea value={content} onChange={e=>setContent(e.target.value)} />
      <button onClick={handlePublish}>Publish</button>
      <input type="file" onChange={e=>handleImage(e.target.files[0])}/>
    </div>
  );
}
