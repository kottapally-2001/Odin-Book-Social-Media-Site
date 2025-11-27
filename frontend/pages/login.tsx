import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const router = useRouter();

  const submit = async () => {
    try{
      const res = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + '/api/auth/login',
        { email, password }
      );

      localStorage.setItem('token', res.data.token);
      router.push('/');
    } catch(e:any){
      alert(e.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="auth">
      <h2>Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={submit}>Login</button>

      {/* 👇 Added Register Link */}
      <p style={{ marginTop: "10px" }}>
        Don't have an account?{" "}
        <Link href="/register" style={{ color: "blue", textDecoration: "underline" }}>
          Register here
        </Link>
      </p>
    </div>
  );
}
