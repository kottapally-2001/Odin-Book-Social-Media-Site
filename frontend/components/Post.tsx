import axios from 'axios';
import { useState } from 'react';

export default function Post({ post, user, onDelete }: { post: any, user: any, onDelete: any }) {
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [likeLoading, setLikeLoading] = useState(false);
  const [unlikeLoading, setUnlikeLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // helper to show errors
  const handleError = (err: any) => {
    console.error('API error:', err);
    const msg = err?.response?.data?.error || err?.message || 'Unknown error';
    alert('Error: ' + msg);
  };

  const like = async () => {
    if (!token) return alert('Login first');
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      console.log('Liking post', post.id);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post.id}/like`,
        {},
        { headers: { Authorization: 'Bearer ' + token } }
      );
      console.log('Like response', res);
      setLikes((l: number) => l + 1);
    } catch (err) {
      handleError(err);
    } finally {
      setLikeLoading(false);
    }
  };

  const unlike = async () => {
    if (!token) return alert('Login first');
    if (unlikeLoading) return;
    setUnlikeLoading(true);
    try {
      console.log('Unliking post', post.id);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post.id}/unlike`,
        {},
        { headers: { Authorization: 'Bearer ' + token } }
      );
      console.log('Unlike response', res);
      setLikes((l: number) => Math.max(0, l - 1));
    } catch (err) {
      handleError(err);
    } finally {
      setUnlikeLoading(false);
    }
  };

  const deletePost = async () => {
    if (!token) return alert("Login first");
    const confirmDelete = confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;
    try {
      console.log('Deleting post', post.id);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post.id}`,
        { headers: { Authorization: 'Bearer ' + token } }
      );
      onDelete(post.id);
    } catch (err) {
      handleError(err);
    }
  };

  const addComment = async () => {
    if (!token) return alert('Login first');
    if (!commentText || commentText.trim() === '') return alert('Enter comment');
    if (commentLoading) return;
    setCommentLoading(true);
    try {
      console.log('Adding comment to', post.id, 'text', commentText);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post.id}/comment`,
        { content: commentText },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      console.log('Comment response', res);
      setComments((prev: any) => [...prev, res.data]);
      setCommentText('');
    } catch (err) {
      handleError(err);
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <article className="post" style={{ position: 'relative' }}>
      <div className="post-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="avatar" style={{ width: 38, height: 38, borderRadius: 9999, background: '#ddd' }} />
          <strong>{post.author?.name || 'Unknown'}</strong>
        </div>
        <span className="time">{new Date(post.createdAt).toLocaleString()}</span>
      </div>

      {post.content && <p>{post.content}</p>}

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="post"
          style={{
            maxWidth: '300px',
            maxHeight: '300px',
            width: '100%',
            borderRadius: '10px',
            objectFit: 'cover',
            marginTop: 10,
            position: 'relative',
            zIndex: 1,
            pointerEvents: 'auto'
          }}
        />
      )}

      {/* ACTIONS: ensure these are above image (z-index) and clickable */}
      <div className="actions" style={{ position: 'relative', zIndex: 20, pointerEvents: 'auto', display: 'flex', gap: 8, marginTop: 10 }}>
        <button
          onClick={like}
          disabled={likeLoading}
          style={{ position: 'relative', zIndex: 30, padding: '6px 10px', cursor: 'pointer' }}
        >
          {likeLoading ? 'Liking...' : `Like (${likes})`}
        </button>

        <button
          onClick={unlike}
          disabled={unlikeLoading}
          style={{ position: 'relative', zIndex: 30, padding: '6px 10px', cursor: 'pointer' }}
        >
          {unlikeLoading ? 'Unliking...' : 'Unlike'}
        </button>

        {user && user.id === post.authorId && (
          <button
            onClick={deletePost}
            style={{ marginLeft: 10, color: 'red', position: 'relative', zIndex: 30, padding: '6px 10px', cursor: 'pointer' }}
          >
            Delete
          </button>
        )}
      </div>

      <div className="comments" style={{ marginTop: 12 }}>
        <h4 style={{ margin: '6px 0' }}>Comments</h4>

        {comments.map((c: any) => (
          <div key={c.id} className="comment" style={{ padding: '6px 0', borderBottom: '1px solid #f1f1f1' }}>
            <b>{c.author?.name}</b>: {c.content}
          </div>
        ))}

        <div className="commentbox" style={{ marginTop: 8 }}>
          <input
            placeholder="Write a comment"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ddd' }}
          />
          <button
            onClick={addComment}
            disabled={commentLoading}
            style={{ marginTop: 8, padding: '6px 10px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            {commentLoading ? 'Posting...' : 'Comment'}
          </button>
        </div>
      </div>
    </article>
  );
}
