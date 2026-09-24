import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, LogOut, RefreshCw, Trash2, UploadCloud, Users } from 'lucide-react';
import { apiFetch, clearToken, getToken } from '../../lib/api';

const STATUS_STYLES = {
  queued: 'bg-amber-400/10 text-amber-400 border-amber-400/30',
  processing: 'bg-blue-400/10 text-blue-400 border-blue-400/30',
  ready: 'bg-green-400/10 text-green-400 border-green-400/30',
  failed: 'bg-red-400/10 text-red-400 border-red-400/30',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [leads, setLeads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef(null);

  useEffect(() => { if (!getToken()) navigate('/admin'); }, [navigate]);

  const refresh = useCallback(async () => {
    try {
      const [d, l] = await Promise.all([
        apiFetch('/api/admin/documents', { auth: true }),
        apiFetch('/api/admin/leads', { auth: true }),
      ]);
      setDocs(d); setLeads(l);
    } catch (e) { setMsg(e.message); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!docs.some((d) => d.status === 'queued' || d.status === 'processing')) return;
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [docs, refresh]);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setMsg('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await apiFetch('/api/admin/upload-pdf', { method: 'POST', formData: fd, auth: true });
      setMsg(`"${res.filename}" accepted — chunking & embedding in the background…`);
      refresh();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeDoc = async (id) => {
    try { await apiFetch(`/api/admin/documents/${id}`, { method: 'DELETE', auth: true }); refresh(); }
    catch (e) { setMsg(e.message); }
  };

  const logout = () => { clearToken(); navigate('/admin'); };

  return (
    <div className="min-h-screen bg-dark text-white">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <h1 className="text-xl font-bold"><span className="text-gold-500">NEXUS AI</span> · Admin</h1>
        <div className="flex gap-3">
          <button onClick={refresh} className="flex items-center gap-2 text-sm px-4 py-2 border border-white/10 rounded-full hover:border-gold-500/40 transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={logout} className="flex items-center gap-2 text-sm px-4 py-2 border border-white/10 rounded-full hover:border-red-400/40 transition-colors">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        {msg && <div className="text-sm text-gold-400 border border-gold-500/30 bg-gold-500/5 rounded-lg px-4 py-3">{msg}</div>}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-lg font-semibold mb-4">Knowledge Base — PDF Ingestion</h2>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gold-500/30 rounded-xl py-12 cursor-pointer hover:border-gold-500/60 hover:bg-gold-500/5 transition-colors">
            <UploadCloud className="text-gold-500 mb-3" size={36} />
            <span className="text-sm text-gray-300">{uploading ? 'Uploading…' : 'Click to upload a PDF (max 20 MB)'}</span>
            <span className="text-xs text-gray-500 mt-1">Recursive semantic chunking + Gemini embeddings + reranking-ready RAG</span>
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={upload} disabled={uploading} />
          </label>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-4">Documents</h2>
          <div className="rounded-2xl border border-white/10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-gray-400">
                <tr>
                  <th className="text-left px-4 py-3">File</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Pages</th>
                  <th className="text-right px-4 py-3">Chunks</th>
                  <th className="text-left px-4 py-3">Uploaded</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} className="border-t border-white/5">
                    <td className="px-4 py-3 flex items-center gap-2"><FileText size={14} className="text-gold-500" />{d.filename}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full border text-xs ${STATUS_STYLES[d.status] || ''}`}>{d.status}</span>
                      {d.status === 'failed' && d.error && (
                        <div className="text-xs text-red-400 mt-1 max-w-xs truncate" title={d.error}>{d.error}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">{d.page_count ?? '—'}</td>
                    <td className="px-4 py-3 text-right">{d.chunk_count ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(d.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => removeDoc(d.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
                {!docs.length && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No documents uploaded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Users size={18} className="text-gold-500" /> Captured Leads</h2>
          <div className="rounded-2xl border border-white/10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-gray-400">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Phone</th>
                  <th className="text-left px-4 py-3">Source</th>
                  <th className="text-left px-4 py-3">Message</th>
                  <th className="text-left px-4 py-3">Received</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-t border-white/5">
                    <td className="px-4 py-3">{l.name}</td>
                    <td className="px-4 py-3 text-gold-400">{l.email || '—'}</td>
                    <td className="px-4 py-3">{l.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full border text-xs ${l.source === 'chat' ? 'bg-blue-400/10 text-blue-400 border-blue-400/30' : 'bg-gold-500/10 text-gold-500 border-gold-500/30'}`}>
                        {l.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 max-w-xs truncate" title={l.message || ''}>{l.message || '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(l.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {!leads.length && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No leads yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
