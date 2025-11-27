import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Register(){
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const router = useRouter();

  const submit = async () => {
    try {
      await axios.post(
        process.env.NEXT_PUBLIC_API_URL + '/api/auth/register',
        { name, email, password }
      );

      alert("Registration successful! Please login.");
      router.push('/login');   // 👈 correct redirect
    } catch (e:any) {
      alert(e.response?.data?.error || 'Register failed');
    }
  };

  return (
    <div className="auth">
      <h2>Register</h2>
      <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button onClick={submit}>Register</button>
    </div>
  );
}
