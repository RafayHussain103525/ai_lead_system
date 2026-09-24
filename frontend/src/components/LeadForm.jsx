import { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { apiFetch } from '../lib/api';

const EMPTY = { name: '', email: '', phone: '', company: '', message: '' };
const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 transition-colors';

export default function LeadForm() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending'); setError('');
    try {
      await apiFetch('/api/lead', {
        method: 'POST',
        body: { ...form, session_id: localStorage.getItem('nexus_session') || null },
      });
      setStatus('sent'); setForm(EMPTY);
    } catch (err) {
      setStatus('error'); setError(err.message);
    }
  };

  if (status === 'sent') {
    return (
      <div className="rounded-2xl border border-gold-500/30 bg-gold-500/5 p-10 text-center">
        <CheckCircle2 className="text-gold-500 mx-auto mb-3" size={32} />
        <p className="text-lg font-semibold">Request received.</p>
        <p className="text-sm text-gray-400 mt-1">Our team will contact you shortly.</p>
        <button onClick={() => setStatus('idle')} className="mt-4 text-xs text-gold-500 hover:underline">Send another request</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <input required placeholder="Full name *" value={form.name} onChange={set('name')} className={inputCls} />
        <input required type="email" placeholder="Work email *" value={form.email} onChange={set('email')} className={inputCls} />
        <input placeholder="Phone" value={form.phone} onChange={set('phone')} className={inputCls} />
        <input placeholder="Company" value={form.company} onChange={set('company')} className={inputCls} />
      </div>
      <textarea rows={4} placeholder="What are you trying to build?" value={form.message} onChange={set('message')} className={inputCls} />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button type="submit" disabled={status === 'sending'}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-gold-600 to-gold-400 text-black font-semibold rounded-full text-sm hover:scale-105 transition-transform disabled:opacity-50">
        {status === 'sending' ? 'Sending…' : 'Request consultation'} <Send size={14} />
      </button>
    </form>
  );
}
