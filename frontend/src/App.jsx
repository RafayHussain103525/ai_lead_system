import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <div className="min-h-screen relative font-sans selection:bg-gold-500 selection:text-black">
      {/* Background Liquid Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-600/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold-500/10 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="w-full p-6 flex justify-between items-center fixed top-0 z-40 bg-black/20 backdrop-blur-md border-b border-white/5">
        <h1 className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
          NEXUS AI
        </h1>
        <div className="hidden md:flex gap-8 text-sm tracking-widest text-gray-300">
          <a href="#vision" className="hover:text-gold-500 transition-colors">VISION</a>
          <a href="#services" className="hover:text-gold-500 transition-colors">SERVICES</a>
          <a href="#pricing" className="hover:text-gold-500 transition-colors">PRICING</a>
        </div>
        <button className="px-6 py-2 bg-transparent border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-black rounded text-sm tracking-wider transition-all">
          BOOK CONSULTATION
        </button>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 px-6 max-w-6xl mx-auto space-y-32 pb-32">
        
        <section className="min-h-[70vh] flex flex-col justify-center items-start">
          <h2 className="text-5xl md:text-7xl font-light text-white mb-6 leading-tight">
            Enterprise AI Architecture <br/>
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-yellow-200">
              & Custom Software Engineering
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
            In an era where 'AI-enabled' is often a buzzword, we provide the architectural integrity and mathematical rigor required to move beyond the sandbox.
          </p>
        </section>

        {/* Services Glass Cards */}
        <section id="services" className="space-y-12">
          <h3 className="text-3xl font-light text-white tracking-widest border-b border-gold-500/20 pb-4 inline-block">CORE SERVICES</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-gold-500/50 transition-colors group">
              <h4 className="text-xl text-gold-400 font-semibold mb-4">End-to-End Custom AI & ML</h4>
              <p className="text-gray-400 text-sm leading-relaxed">We treat data as a high-fidelity asset. Implementation of robust ETL pipelines using SQL, Python, and specialized feature stores to replace manual data wrangling.</p>
            </div>

            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-gold-500/50 transition-colors">
              <h4 className="text-xl text-gold-400 font-semibold mb-4">Generative AI & Agentic Systems</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Moving past basic 'chatbots' to build Agentic Workflows that perform autonomous reasoning and task execution via Advanced RAG architectures.</p>
            </div>

            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-gold-500/50 transition-colors">
              <h4 className="text-xl text-gold-400 font-semibold mb-4">MLOps & Deployment</h4>
              <p className="text-gray-400 text-sm leading-relaxed">A model is only as good as its deployment. We focus on 'Zero-Downtime' updates, Docker containerization, and full CI/CD for Machine Learning.</p>
            </div>

            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-gold-500/50 transition-colors">
              <h4 className="text-xl text-gold-400 font-semibold mb-4">Full-Stack Engineering</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Modular React/Node.js or Flutter applications designed to act as the 'nervous system' for your AI 'brains', prioritizing clean code and type-safety.</p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="p-12 rounded-3xl bg-gradient-to-br from-gold-900/20 to-black border border-gold-500/20">
          <h3 className="text-3xl font-light text-white tracking-widest mb-8">ENGAGEMENT MODELS</h3>
          <ul className="space-y-6">
            <li className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-gray-300">Phase 1: Discovery & MVP</span>
              <span className="text-gold-400 font-mono">$25,000 - $75,000</span>
            </li>
            <li className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-gray-300">Phase 2: Production Scaling</span>
              <span className="text-gold-400 font-mono">$150,000+</span>
            </li>
            <li className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-gray-300">Phase 3: Managed MLOps</span>
              <span className="text-gold-400 font-mono">$5,000/mo Retainer</span>
            </li>
          </ul>
        </section>

      </main>

      {/* Render the custom Chat Widget */}
      <ChatWidget />
      
    </div>
  );
}

export default App;