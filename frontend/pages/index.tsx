import { useEffect, useState } from 'react';
import axios from 'axios';
import Post from '../components/Post';
import { useRouter } from 'next/router';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch logged-in user info
    axios
      .get(process.env.NEXT_PUBLIC_API_URL + "/api/users/me", {
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/login");
      });

    // Fetch posts
    axios
      .get(process.env.NEXT_PUBLIC_API_URL + "/api/posts/feed", {
        headers: { Authorization: "Bearer " + token },
      })
      .then((r) => setPosts(r.data))
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/login");
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="container">
      <nav className="nav">
        <h1>MiniSocial</h1>

        {user && (
          <div>
            <strong>{user.name}</strong> ({user.email})
            <button onClick={logout} style={{ marginLeft: "10px" }}>
              Logout
            </button>
          </div>
        )}
      </nav>

      <main>
        <section className="create">
          <CreatePost onPosted={(p: any) => setPosts((prev) => [p, ...prev])} />
        </section>

        <section className="feed">
          {posts.length === 0 && <p>No posts yet</p>}
          {posts.map((p) => (
            <Post
              key={p.id}
              post={p}
              user={user}
              onDelete={(id: number) =>
                setPosts(posts.filter(post => post.id !== id))
              }
            />
          ))}
        </section>
      </main>
    </div>
  );
}

// ---------------------------------------------------------
// CREATE POST COMPONENT (TEXT + IMAGE)
// ---------------------------------------------------------

function CreatePost({ onPosted }: { onPosted: (p: any) => void }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const submit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Login first");

    const form = new FormData();
    form.append("content", content);
    if (image) form.append("image", image);

    const res = await axios.post(
      process.env.NEXT_PUBLIC_API_URL + "/api/posts",
      form,
      {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setContent("");
    setImage(null);
    onPosted(res.data);
  };

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening?"
      />

      {/* IMAGE INPUT */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />

      <button onClick={submit}>Post</button>
    </div>
  );
}
