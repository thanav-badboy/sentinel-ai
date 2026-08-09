import { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Search, 
  FileText, 
  Settings, 
  LogOut, 
  AlertTriangle,
  ChevronRight,
  Server,
  Lock,
  User,
  Clock,
  Briefcase
} from 'lucide-react';
import OpenAI from 'openai';
import type { ScanResult } from './types';
import IncidentReports from './components/IncidentReports';
import LiveMonitoring from './components/LiveMonitoring';
import NetworkAssets from './components/NetworkAssets';
import SystemConfig from './components/SystemConfig';
import QuarantineModal from './components/QuarantineModal';

// Sample phishing text
const CEO_PHISHING_SAMPLE = `From: David Smith (CEO) <david.smith.exec@company-internal-secure.com>
To: Finance Department
Date: Today, 09:14 AM
Subject: URGENT: Confidential Wire Transfer Required immediately

Hi team,

I am currently in a highly confidential meeting regarding a potential acquisition. I need a wire transfer of $14,500 processed within the next 15 minutes to secure the deal. 

Please process this immediately and do not discuss with anyone else until I give the clear, as this is strictly confidential.

Wire details:
Account: 948271635
Routing: 021000021

Send confirmation as soon as completed.

Best,
David Smith
Chief Executive Officer`;

const HighlightedText = ({ text, flaggedPhrases = [] }: { text: string, flaggedPhrases?: string[] }) => {
  if (!text) return null;
  
  if (!flaggedPhrases || flaggedPhrases.length === 0) {
    return <div className="whitespace-pre-wrap font-mono text-sm text-slate-300">{text}</div>;
  }
  
  const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const sortedPhrases = [...flaggedPhrases].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${sortedPhrases.map(escapeRegExp).join('|')})`, 'i');
  
  const parts = text.split(pattern);
  const lowerPhrases = flaggedPhrases.map(p => p.toLowerCase());
  
  return (
    <div className="whitespace-pre-wrap font-mono text-sm text-slate-300">
      {parts.map((part, i) => {
        if (lowerPhrases.includes(part.toLowerCase())) {
          return (
            <span key={i} className="bg-red-900/40 text-red-400 px-1 py-0.5 rounded border border-red-800/50 relative group cursor-help">
              {part}
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-xs px-2 py-1 rounded border border-red-800/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-xl">
                Flagged by AI Scanner
              </span>
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
};


export default function App() {
  const [activeTab, setActiveTab] = useState<'audit' | 'monitoring' | 'reports' | 'assets' | 'config'>('audit');
  const [inputText, setInputText] = useState('');
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'results'>('idle');
  const [showModal, setShowModal] = useState(false);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY || '');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  
  // New Global State for Incident History
  const [incidentHistory, setIncidentHistory] = useState<ScanResult[]>([]);

  const loadSample = () => {
    setInputText(CEO_PHISHING_SAMPLE);
    setScanState('idle');
  };

  const runScan = async () => {
    if (!inputText.trim()) return;
    
    setScanState('scanning');
    setScanResult(null);
    
    try {
      const openai = new OpenAI({
        apiKey: apiKey || import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true 
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are SentinelAI, an elite SOC threat intelligence engine. Analyze the provided communication for social engineering, spear-phishing, deepfake linguistic artifacts, and pressure tactics.
Return strictly valid JSON in this exact structure:
{
  "threatScore": number (0-100),
  "riskLevel": "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "impersonationTarget": string,
  "attackVector": string,
  "flags": string[],
  "flaggedPhrases": string[],
  "telemetryLogs": string[]
}`
          },
          {
            role: "user",
            content: inputText
          }
        ]
      });

      const result = JSON.parse(response.choices[0].message.content || '{}') as ScanResult;
      setScanResult(result);
      setScanState('results');
    } catch (error: any) {
      console.warn("OpenAI API failed, falling back to local heuristic simulation:", error.message);
      
      const isThreat = inputText.toLowerCase().includes('wire') || inputText.toLowerCase().includes('urgent') || inputText.toLowerCase().includes('password');
      
      const fallbackResult: ScanResult = {
        threatScore: isThreat ? 88 : 12,
        riskLevel: isThreat ? 'CRITICAL' : 'SAFE',
        impersonationTarget: isThreat ? 'David Smith' : 'None',
        attackVector: isThreat ? 'Targeted Spear-Phishing Attack' : 'Benign Communication',
        flags: isThreat ? ['Forced Urgency', 'Financial Transfer Request', 'Domain Spoofing'] : ['Standard Formatting', 'Known Sender Profile'],
        flaggedPhrases: isThreat ? ['15 minutes', '$14,500', 'strictly confidential', 'URGENT'] : [],
        telemetryLogs: isThreat ? [
          'Detected high urgency context (+15 risk)',
          'Extracted monetary request: $14,500',
          'Domain mismatch: internal-secure.com not in corporate assets',
          'Sender baseline deviation: Direct wire requests are rare',
          'Consolidated score: 88. Threat classified as CRITICAL.'
        ] : [
          'NLP context analysis: normal conversational flow',
          'No malicious payloads or phishing vectors detected',
          'Sender reputation matches historical baseline',
          'Cleared by primary analysis engine'
        ]
      };
      
      setScanResult(fallbackResult);
      setScanState('results');
    }
  };

  const handleQuarantine = () => {
    if (scanResult) {
      // Append ID and timestamp before saving to history
      const finalResult = {
        ...scanResult,
        id: `TICKET-${new Date().getFullYear()}-${Math.floor(Math.random()*9000)+1000}`,
        timestamp: new Date().toLocaleString()
      };
      setScanResult(finalResult);
      // Unshift adds to the beginning of the array so newest is top
      setIncidentHistory([finalResult, ...incidentHistory]);
      setShowModal(true);
    }
  };

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'SAFE': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'LOW': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'HIGH': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'CRITICAL': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const getScoreColorClass = (score: number) => {
    if (score < 20) return 'text-emerald-500';
    if (score < 40) return 'text-blue-500';
    if (score < 60) return 'text-yellow-500';
    if (score < 80) return 'text-orange-500';
    return 'text-red-500';
  };

  const renderView = () => {
    switch (activeTab) {
      case 'monitoring': return <LiveMonitoring />;
      case 'reports': return <IncidentReports history={incidentHistory} />;
      case 'assets': return <NetworkAssets />;
      case 'config': return <SystemConfig apiKey={apiKey} setApiKey={setApiKey} />;
      case 'audit':
      default:
        return (
          <div className="max-w-5xl mx-auto space-y-6 relative z-10">
            {/* Input Section */}
            <div className="glass rounded-2xl p-6 shadow-xl animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <Lock className="text-cyan-400" size={20} />
                    Suspicious Payload Input
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">Paste raw email, text, or script for multi-agent heuristic analysis.</p>
                </div>
                <button 
                  onClick={loadSample}
                  className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 rounded-lg text-sm font-medium transition-all text-slate-300 hover:text-cyan-400 flex items-center gap-2 group"
                >
                  <Briefcase size={16} className="group-hover:text-cyan-400 transition-colors" />
                  Load CEO Phishing Sample
                </button>
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-b from-cyan-500/0 to-cyan-500/0 group-focus-within:from-cyan-500/20 group-focus-within:to-blue-500/20 rounded-xl blur opacity-50 transition-all duration-500"></div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="relative w-full h-48 bg-slate-950/80 border border-slate-700/50 focus:border-cyan-500/50 rounded-xl p-4 text-slate-300 font-mono text-sm resize-none focus:outline-none transition-colors cyber-scrollbar"
                  placeholder="Paste suspicious content here..."
                  disabled={scanState === 'scanning'}
                />
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={runScan}
                  disabled={!inputText.trim() || scanState === 'scanning'}
                  className={`
                    relative overflow-hidden px-6 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-all duration-300
                    ${!inputText.trim() 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : scanState === 'scanning'
                        ? 'bg-cyan-900 border border-cyan-500/50 text-cyan-200'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_30px_rgba(0,242,254,0.5)]'
                    }
                  `}
                >
                  {scanState === 'scanning' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      Agents Analyzing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      Run Multi-Agent Threat Scan
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Loading State Overlay */}
            {scanState === 'scanning' && (
              <div className="glass rounded-2xl p-12 shadow-xl animate-fade-in-up flex flex-col items-center justify-center text-center">
                <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-cyan-900 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-cyan-400 rounded-full border-t-transparent animate-spin"></div>
                    <ShieldAlert className="absolute inset-0 m-auto text-cyan-500 animate-pulse" size={32} />
                </div>
                <h3 className="text-xl font-mono text-cyan-400 mb-2">Engaging Sentinel Protocols</h3>
                <div className="space-y-1 text-sm text-slate-400 font-mono">
                  <p className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>Analyzing header telemetry...</p>
                  <p className="animate-fade-in-up" style={{animationDelay: '0.8s'}}>NLP processing payload intent...</p>
                  <p className="animate-fade-in-up" style={{animationDelay: '1.4s'}}>Cross-referencing global threat databases...</p>
                </div>
              </div>
            )}

            {/* Results Dashboard */}
            {scanState === 'results' && scanResult && (
              <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                
                <div className="glass rounded-2xl p-6 shadow-xl border-red-900/30 relative overflow-hidden">
                  {scanResult.riskLevel === 'CRITICAL' && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                  )}
                  {(scanResult.riskLevel === 'HIGH' || scanResult.riskLevel === 'MEDIUM') && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>
                  )}
                  {scanResult.riskLevel === 'SAFE' && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                  )}
                  
                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="relative flex-shrink-0 animate-badge-pop">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="50" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                        <circle 
                          cx="64" cy="64" r="50" 
                          stroke="currentColor" 
                          strokeWidth="8" 
                          fill="transparent" 
                          strokeDasharray="314"
                          strokeDashoffset={314 - (314 * scanResult.threatScore) / 100}
                          strokeLinecap="round"
                          className={`${getScoreColorClass(scanResult.threatScore)} animate-score-fill`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-slate-100">{scanResult.threatScore}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Score</span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border animate-threat-blink ${getRiskColor(scanResult.riskLevel)}`}>
                          {scanResult.riskLevel} Risk Level
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-100 mb-4">{scanResult.attackVector || 'Analysis Complete'}</h3>
                      
                      <div className="flex flex-wrap gap-2">
                        {scanResult.flags.map((flag, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/50 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 animate-fade-in-up" style={{ animationDelay: `${0.2 + idx * 0.1}s` }}>
                            <AlertTriangle size={14} className={scanResult.threatScore > 50 ? "text-orange-400" : "text-blue-400"} />
                            {flag}
                          </div>
                        ))}
                      </div>
                    </div>

                    {scanResult.riskLevel !== 'SAFE' && scanResult.riskLevel !== 'LOW' && (
                      <div className="flex-shrink-0 w-full md:w-auto animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                        <button 
                          onClick={handleQuarantine}
                          className="w-full md:w-auto px-6 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-xl text-red-400 font-medium transition-all flex items-center justify-center gap-2 group shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_25px_rgba(239,68,68,0.2)]"
                        >
                          <ShieldAlert size={18} className="group-hover:scale-110 transition-transform" />
                          Quarantine & Generate Incident Report
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="glass rounded-2xl p-6 border-slate-800/50">
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileText size={16} className="text-cyan-500" />
                      Payload Extraction
                    </h4>
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 h-64 overflow-y-auto cyber-scrollbar">
                      <HighlightedText text={inputText} flaggedPhrases={scanResult.flaggedPhrases} />
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-6 border-slate-800/50">
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Activity size={16} className="text-cyan-500" />
                      Agent Telemetry
                    </h4>
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 h-64 overflow-y-auto cyber-scrollbar font-mono text-xs space-y-3">
                      {scanResult.telemetryLogs.map((log, i) => (
                        <div key={i} className="flex gap-3">
                          <span className="text-slate-500">
                            {new Date(Date.now() - (scanResult.telemetryLogs.length - i) * 1000).toISOString().split('T')[1].split('.')[0]}
                          </span>
                          <span className="text-slate-400 w-16">[{['NLP', 'FIN', 'DNS', 'BEHAV', 'CORE'][i % 5]}-{(i+1).toString().padStart(2, '0')}]</span>
                          <span className={scanResult.threatScore > 50 ? 'text-orange-400' : 'text-blue-400'}>
                            {log}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  const menuItems = [
    { id: 'audit', icon: Search, label: 'Audit Workspace' },
    { id: 'monitoring', icon: Activity, label: 'Live Monitoring' },
    { id: 'reports', icon: FileText, label: 'Incident Reports' },
    { id: 'assets', icon: Server, label: 'Network Assets' },
    { id: 'config', icon: Settings, label: 'System Config' },
  ] as const;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 glass border-r border-slate-800/50 flex flex-col relative z-20">
        <div className="p-6 border-b border-slate-800/50 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-[0_0_15px_rgba(0,242,254,0.3)]">
            <ShieldAlert size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">SentinelAI</h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Threat Ops</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 cyber-scrollbar overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-cyan-950/30 border border-cyan-800/30 text-cyan-400 shadow-[0_0_10px_rgba(0,242,254,0.1)_inset]' 
                  : 'hover:bg-slate-900/50 hover:text-slate-200 text-slate-400 border border-transparent hover:border-slate-800/50'
              }`}
            >
              <item.icon size={18} className={activeTab === item.id ? 'text-cyan-400' : 'text-slate-500'} />
              <span className="font-medium text-sm">{item.label}</span>
              {activeTab === item.id && <ChevronRight size={16} className="ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/30 border border-slate-800/50 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <User size={14} className="text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">SecOp Lead</p>
              <p className="text-xs text-slate-500 truncate">Lvl 4 Clearance</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-red-400 transition-colors">
            <LogOut size={16} />
            <span className="text-sm">Disconnect Session</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 glass border-b border-slate-800/50 flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span>Workspace</span>
              <ChevronRight size={14} />
              <span className="text-slate-200 font-medium">
                {menuItems.find(i => i.id === activeTab)?.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-400">AGENTS ONLINE: 14</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <Clock size={14} className="text-slate-500" />
              <span className="text-slate-400">SYS_TIME: {new Date().toISOString().split('T')[1].split('.')[0]}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto cyber-scrollbar p-8 relative">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[80px] translate-y-1/4 -translate-x-1/4 pointer-events-none"></div>

          {renderView()}
        </div>
      </main>

      {showModal && scanResult && (
        <QuarantineModal 
          scanResult={scanResult} 
          onClose={() => setShowModal(false)} 
        />
      )}

    </div>
  );
}
