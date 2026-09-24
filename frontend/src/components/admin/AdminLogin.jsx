import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { apiFetch, setToken } from '../../lib/api';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const data = await apiFetch('/api/admin/login', { method: 'POST', body: form });
      setToken(data.access_token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl animate-blob" />
      <form onSubmit={submit} className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 space-y-5">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-full bg-gold-500/10 border border-gold-500/30 mb-3">
            <Lock className="text-gold-500" size={20} />
          </div>
          <h1 className="text-xl font-bold">NEXUS AI <span className="text-gold-500">Admin</span></h1>
          <p className="text-xs text-gray-500 mt-1">Knowledge base & lead management</p>
        </div>
        <input required placeholder="Username" value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500/50" />
        <input required type="password" placeholder="Password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500/50" />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button type="submit" disabled={busy}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-gold-600 to-gold-400 text-black font-semibold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <Link to="/" className="flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gold-500">
          <ArrowLeft size={12} /> Back to site
        </Link>
      </form>
    </div>
  );
}
