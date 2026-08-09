import { useEffect, useState } from 'react';
import { Server, ShieldCheck, ShieldAlert, Database, Mail, Smartphone, Globe, Cpu } from 'lucide-react';

type AssetStatus = 'Secured' | 'Under Audit' | 'Quarantined';

interface Asset {
  id: string;
  name: string;
  type: string;
  ip: string;
  icon: React.ElementType;
  status: AssetStatus;
  uptime: number;
  lastScan: string;
}

const INITIAL_ASSETS: Asset[] = [
  { id: 'NODE-01', name: 'Primary Mail Gateway', type: 'Mail Server', status: 'Secured', icon: Mail, ip: '10.0.1.4', uptime: 99.9, lastScan: '2m ago' },
  { id: 'NODE-02', name: 'Core Transaction DB', type: 'Database', status: 'Secured', icon: Database, ip: '10.0.5.11', uptime: 100, lastScan: '1m ago' },
  { id: 'NODE-03', name: 'Public Web API', type: 'Edge Server', status: 'Under Audit', icon: Globe, ip: '192.168.1.100', uptime: 98.2, lastScan: '30s ago' },
  { id: 'NODE-04', name: 'CEO Mobile Device', type: 'Mobile Endpoint', status: 'Quarantined', icon: Smartphone, ip: '10.0.2.85', uptime: 0, lastScan: '12s ago' },
  { id: 'NODE-05', name: 'Internal Wiki', type: 'Web Server', status: 'Secured', icon: Server, ip: '10.0.1.22', uptime: 99.7, lastScan: '5m ago' },
  { id: 'NODE-06', name: 'Backup Storage Array', type: 'Database', status: 'Secured', icon: Database, ip: '10.0.6.10', uptime: 100, lastScan: '3m ago' },
  { id: 'NODE-07', name: 'HR Data Endpoint', type: 'Workstation', status: 'Secured', icon: Cpu, ip: '10.0.3.44', uptime: 97.5, lastScan: '8m ago' },
  { id: 'NODE-08', name: 'VPN Gateway', type: 'Network Device', status: 'Under Audit', icon: Globe, ip: '10.0.0.1', uptime: 99.1, lastScan: '45s ago' },
];

const SCAN_TIMES = ['5s ago', '12s ago', '30s ago', '1m ago', '2m ago', '3m ago', '5m ago', '8m ago', '10m ago'];

export default function NetworkAssets() {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);

  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prev => prev.map(asset => ({
        ...asset,
        lastScan: SCAN_TIMES[Math.floor(Math.random() * SCAN_TIMES.length)],
        uptime: asset.status === 'Quarantined' ? 0 : Math.min(100, Math.max(95, asset.uptime + (Math.random() - 0.5) * 0.2)),
      })));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const secured = assets.filter(a => a.status === 'Secured').length;
  const auditing = assets.filter(a => a.status === 'Under Audit').length;
  const quarantined = assets.filter(a => a.status === 'Quarantined').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative z-10 animate-fade-in-up">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Server className="text-cyan-400" size={24} />
          <h2 className="text-2xl font-bold text-slate-100">Enterprise Network Assets</h2>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400"><ShieldCheck size={14}/>{secured} Secured</span>
          <span className="flex items-center gap-1.5 text-yellow-400"><Server size={14}/>{auditing} Auditing</span>
          <span className="flex items-center gap-1.5 text-red-400"><ShieldAlert size={14}/>{quarantined} Quarantined</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {assets.map((asset, idx) => (
          <div key={idx} className="glass rounded-xl p-5 border-slate-800/50 hover:border-slate-700 transition-all group">
            <div className="flex items-start gap-3 mb-4">
              <div className={`p-2 rounded-lg shrink-0 ${
                asset.status === 'Secured' ? 'bg-emerald-500/10 text-emerald-400' :
                asset.status === 'Quarantined' ? 'bg-red-500/10 text-red-400' :
                'bg-yellow-500/10 text-yellow-400'
              }`}>
                <asset.icon size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-200 text-sm group-hover:text-cyan-400 transition-colors leading-tight">{asset.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{asset.type}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-500">
                <span>IP</span>
                <span className="text-slate-300">{asset.ip}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Uptime</span>
                <span className={asset.uptime === 0 ? 'text-red-400' : 'text-emerald-400'}>{asset.uptime === 0 ? 'OFFLINE' : `${asset.uptime.toFixed(1)}%`}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Last Scan</span>
                <span className="text-slate-300">{asset.lastScan}</span>
              </div>
            </div>

            <div className={`mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-center gap-1.5 text-xs font-bold py-1.5 rounded-lg ${
              asset.status === 'Secured' ? 'text-emerald-400 bg-emerald-500/10' :
              asset.status === 'Quarantined' ? 'text-red-400 bg-red-500/10 animate-threat-blink' :
              'text-yellow-400 bg-yellow-500/10'
            }`}>
              {asset.status === 'Secured' && <ShieldCheck size={13} />}
              {asset.status === 'Quarantined' && <ShieldAlert size={13} />}
              {asset.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
