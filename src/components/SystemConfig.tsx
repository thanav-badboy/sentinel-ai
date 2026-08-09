import { Settings, Save } from 'lucide-react';

export default function SystemConfig({ apiKey, setApiKey }: { apiKey: string, setApiKey: (k: string) => void }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6 relative z-10 animate-fade-in-up">
      <div className="glass rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-6">
          <Settings className="text-cyan-400" size={20} />
          System Configuration
        </h2>
        
        <div className="space-y-8">
          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">OpenAI API Key (Heuristic Engine)</label>
            <input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-slate-950/80 border border-slate-700/50 focus:border-cyan-500/50 rounded-xl p-3 text-slate-300 font-mono text-sm focus:outline-none transition-colors"
            />
            <p className="text-xs text-slate-500 mt-2">
              Required for multi-agent threat scan functionality. Leave blank to use local simulation fallback.
            </p>
          </div>

          <hr className="border-slate-800" />

          {/* Sliders */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">AI Sensitivity Threshold</label>
            <input type="range" min="1" max="100" defaultValue="75" className="w-full accent-cyan-500 bg-slate-800 rounded-lg appearance-none h-2" />
            <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
              <span>Permissive (1)</span>
              <span>Balanced (50)</span>
              <span>Paranoid (100)</span>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Toggles */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">Auto-Quarantine High Risk Threats</p>
              <p className="text-xs text-slate-500 mt-1">Automatically isolate endpoints when score &gt; 85</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">Enable Deepfake Voice Analysis</p>
              <p className="text-xs text-slate-500 mt-1">Route audio attachments to secondary neural engine</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          <div className="pt-4">
            <button className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(0,242,254,0.2)] hover:shadow-[0_0_25px_rgba(0,242,254,0.4)] flex items-center gap-2">
              <Save size={18} />
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
