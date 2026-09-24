import { Routes, Route } from 'react-router-dom';
import ChatWidget from './components/ChatWidget';
import LeadForm from './components/LeadForm';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';

const SERVICES = [
  { title: 'End-to-End Custom AI & ML', text: "We treat data as a high-fidelity asset. Implementation of robust ETL pipelines using SQL, Python, and specialized feature stores to replace manual data wrangling." },
  { title: 'Generative AI & Agentic Systems', text: "Moving past basic 'chatbots' to build Agentic Workflows that perform autonomous reasoning and task execution via Advanced RAG architectures." },
  { title: 'MLOps & Deployment', text: "A model is only as good as its deployment. We focus on 'Zero-Downtime' updates, Docker containerization, and full CI/CD for Machine Learning." },
  { title: 'Full-Stack Engineering', text: "Modular React/Node.js or Flutter applications designed to act as the 'nervous system' for your AI 'brains', prioritizing clean code and type-safety." },
];

const PRICING = [
  { name: 'Phase 1: Discovery & MVP', price: '$25,000 – $75,000' },
  { name: 'Phase 2: Production Scaling', price: '$150,000+' },
  { name: 'Phase 3: Managed MLOps', price: '$5,000/mo Retainer' },
];

function Landing() {
  return (
    <div className="min-h-screen bg-dark text-white relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 -right-32 w-[28rem] h-[28rem] bg-gold-600/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '3.5s' }} />
      </div>
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5 backdrop-blur-sm">
        <span className="text-gold-500 text-2xl font-bold tracking-wider">NEXUS AI</span>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
          <a href="#vision" className="hover:text-gold-500 transition-colors">VISION</a>
          <a href="#services" className="hover:text-gold-500 transition-colors">SERVICES</a>
          <a href="#pricing" className="hover:text-gold-500 transition-colors">PRICING</a>
          <a href="#contact" className="px-4 py-2 bg-gradient-to-r from-gold-600 to-gold-400 text-black rounded-full font-semibold hover:scale-105 transition-transform">BOOK CONSULTATION</a>
        </div>
      </nav>
      <header id="vision" className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Enterprise <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">AI Architecture</span> & Custom Software Engineering
        </h1>
        <p className="mt-6 text-gray-400 max-w-2xl mx-auto text-lg">
          In an era where 'AI-enabled' is often a buzzword, we provide the architectural integrity and mathematical rigor required to move beyond the sandbox.
        </p>
        <a href="#contact" className="inline-block mt-8 px-8 py-3 bg-gradient-to-r from-gold-600 to-gold-400 text-black font-semibold rounded-full shadow-lg shadow-gold-500/30 hover:scale-105 transition-transform">
          Talk to our AI
        </a>
      </header>
      <section id="services" className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-center text-3xl font-bold mb-12"><span className="text-gold-500">CORE</span> SERVICES</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {SERVICES.map((s) => (
            <div key={s.title} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 hover:border-gold-500/30 transition-colors">
              <h3 className="text-xl font-semibold text-gold-400">{s.title}</h3>
              <p className="mt-3 text-sm text-gray-400 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section id="pricing" className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-center text-3xl font-bold mb-12"><span className="text-gold-500">ENGAGEMENT</span> MODELS</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {PRICING.map((p, i) => (
            <div key={p.name} className={`rounded-2xl border p-8 text-center ${i === 1 ? 'border-gold-500/40 bg-gold-500/5' : 'border-white/10 bg-white/5'}`}>
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-4 text-2xl font-bold text-gold-400">{p.price}</p>
            </div>
          ))}
        </div>
      </section>
      <section id="contact" className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-center text-3xl font-bold mb-4">Book a <span className="text-gold-500">Consultation</span></h2>
        <p className="text-center text-gray-400 mb-10">Leave your details — our team (and our AI) will reach out.</p>
        <LeadForm />
      </section>
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Nexus AI — Enterprise AI Architecture
      </footer>
      <ChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}
