import { Download, FileText, ShieldCheck } from 'lucide-react';
import type { ScanResult } from '../types';

export default function IncidentReports({ history }: { history: ScanResult[] }) {
  const exportCSV = () => {
    if (history.length === 0) {
      alert("No incidents to export.");
      return;
    }

    const headers = ['ID', 'Timestamp', 'Threat Score', 'Risk Level', 'Attack Vector', 'Target', 'Status'];
    const rows = history.map(h => [
      h.id || 'N/A',
      h.timestamp || new Date().toISOString(),
      h.threatScore.toString(),
      h.riskLevel,
      `"${h.attackVector}"`,
      `"${h.impersonationTarget}"`,
      'Quarantined'
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SentinelAI_Incident_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative z-10 animate-fade-in-up">
      <div className="glass rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="text-cyan-400" size={20} />
            Incident Reports History
          </h2>
          <button 
            onClick={exportCSV}
            className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 rounded-lg text-sm font-medium transition-all text-slate-300 hover:text-cyan-400 flex items-center gap-2"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-mono">
            No incidents recorded in current session.
          </div>
        ) : (
          <div className="overflow-x-auto cyber-scrollbar">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Incident ID</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Vector</th>
                  <th className="px-4 py-3">Risk</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((incident, idx) => (
                  <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-cyan-500">{incident.id}</td>
                    <td className="px-4 py-3 font-mono text-xs">{incident.timestamp}</td>
                    <td className="px-4 py-3 text-slate-200">{incident.attackVector}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        incident.riskLevel === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                        incident.riskLevel === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      }`}>
                        {incident.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">{incident.threatScore}/100</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-emerald-400 text-xs">
                        <ShieldCheck size={14} /> Quarantined
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
