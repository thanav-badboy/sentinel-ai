import { useEffect, useState } from 'react';
import { Activity, ShieldAlert, Cpu, Network, Database, Wifi } from 'lucide-react';

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePacketRow(i: number) {
  const protocols = ['TCP', 'UDP', 'HTTPS', 'DNS', 'ICMP'];
  const actions = ['ALLOW', 'ALLOW', 'ALLOW', 'BLOCK', 'ALLOW'];
  const srcNets = ['192.168.1', '10.0.0', '172.16.0'];
  const dstNets = ['10.0.2', '8.8.8', '142.250.1'];
  const src = `${srcNets[i % 3]}.${randomBetween(1, 254)}`;
  const dst = `${dstNets[i % 3]}.${randomBetween(1, 254)}`;
  const action = actions[randomBetween(0, 4)];
  const proto = protocols[randomBetween(0, 4)];
  return { src, dst, action, proto };
}

export default function LiveMonitoring() {
  const [packetsCount, setPacketsCount] = useState(1_489_240);
  const [activeSessions, setActiveSessions] = useState(2481);
  const [systemLoad, setSystemLoad] = useState(42);
  const [threatsBlocked, setThreatsBlocked] = useState(184);
  const [packetRows, setPacketRows] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({ ...generatePacketRow(i), time: new Date().toISOString().split('T')[1].split('.')[0] }))
  );
  const [alerts, setAlerts] = useState([
    { id: 'T-819', level: 'HIGH', msg: 'Multiple failed logins on mail gateway' },
    { id: 'T-820', level: 'MEDIUM', msg: 'Unusual outbound traffic spike' },
    { id: 'T-821', level: 'LOW', msg: 'Port scan detected from 185.22.x.x' }
  ]);

  useEffect(() => {
    // Packets & sessions every second
    const fastInterval = setInterval(() => {
      setPacketsCount(prev => prev + randomBetween(10, 80));
      setActiveSessions(prev => Math.max(2000, prev + randomBetween(-5, 8)));
      // Scroll in a new packet row
      setPacketRows(prev => {
        const newRow = { ...generatePacketRow(randomBetween(0, 11)), time: new Date().toISOString().split('T')[1].split('.')[0] };
        return [newRow, ...prev.slice(0, 11)];
      });
    }, 1200);

    // System load every 3s
    const loadInterval = setInterval(() => {
      setSystemLoad(prev => Math.min(99, Math.max(10, prev + randomBetween(-4, 5))));
      setThreatsBlocked(prev => prev + (Math.random() > 0.85 ? 1 : 0));
    }, 3000);

    // Rotate alerts occasionally
    const alertInterval = setInterval(() => {
      const newAlerts = [
        { id: `T-${randomBetween(800, 900)}`, level: ['HIGH', 'MEDIUM', 'LOW', 'CRITICAL'][randomBetween(0, 3)], msg: ['Brute force attempt detected', 'Outbound data exfil signal', 'Spoofed email header found', 'ARP poisoning attempt', 'SSH tunnel established'][randomBetween(0, 4)] }
      ];
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 3));
    }, 6000);

    return () => {
      clearInterval(fastInterval);
      clearInterval(loadInterval);
      clearInterval(alertInterval);
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative z-10 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="text-cyan-400" size={24} />
        <h2 className="text-2xl font-bold text-slate-100">Live Telemetry Dashboard</h2>
        <span className="ml-2 flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          LIVE
        </span>
      </div>
      
      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Sessions', val: activeSessions.toLocaleString(), icon: Network, color: 'text-blue-400' },
          { label: 'Packets Analyzed', val: packetsCount.toLocaleString(), icon: Activity, color: 'text-cyan-400' },
          { label: 'System Load', val: `${systemLoad}%`, icon: Cpu, color: systemLoad > 80 ? 'text-red-400' : systemLoad > 60 ? 'text-orange-400' : 'text-emerald-400' },
          { label: 'Threats Blocked (24h)', val: threatsBlocked.toString(), icon: ShieldAlert, color: 'text-orange-400' },
        ].map((m, i) => (
          <div key={i} className="glass rounded-xl p-5 border-slate-800/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 font-mono mb-1">{m.label}</p>
                <p className={`text-2xl font-bold tabular-nums ${m.color}`}>{m.val}</p>
              </div>
              <m.icon size={20} className="text-slate-600" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Packet Stream */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border-slate-800/50">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Database size={16} className="text-cyan-500" />
            Packet Inspection Stream
          </h3>
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 h-80 overflow-hidden font-mono text-xs space-y-2 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/90 z-10 pointer-events-none rounded-xl"></div>
            {packetRows.map((row, i) => (
              <div key={i} className="flex gap-3" style={{ opacity: 1 - i * 0.06 }}>
                <span className="text-slate-600 shrink-0">{row.time}</span>
                <span className={row.action === 'BLOCK' ? 'text-red-400 shrink-0' : 'text-emerald-500 shrink-0'}>{row.action}</span>
                <span className="text-slate-400 shrink-0">SRC: {row.src}</span>
                <span className="text-slate-500 shrink-0">→ {row.dst}</span>
                <span className="text-slate-600 hidden md:inline shrink-0">{row.proto}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Alerts */}
        <div className="glass rounded-2xl p-6 border-slate-800/50">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldAlert size={16} className="text-orange-500" />
            Active Alerts
          </h3>
          <div className="space-y-4">
            {alerts.map((alert, i) => (
              <div key={`${alert.id}-${i}`} className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 animate-fade-in-up">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-slate-500">{alert.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    alert.level === 'CRITICAL' ? 'bg-red-500/10 text-red-400' :
                    alert.level === 'HIGH' ? 'bg-orange-500/10 text-orange-400' :
                    alert.level === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {alert.level}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{alert.msg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Network Load Bar */}
      <div className="glass rounded-2xl p-6 border-slate-800/50">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Wifi size={16} className="text-cyan-500" />
          Network Segment Load
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'North Segment (Corp)', load: systemLoad },
            { label: 'South Segment (DMZ)', load: Math.min(99, systemLoad + randomBetween(-10, 20)) },
            { label: 'East Segment (Cloud)', load: Math.max(5, systemLoad - randomBetween(5, 25)) },
          ].map((seg, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs text-slate-400 font-mono mb-2">
                <span>{seg.label}</span>
                <span>{seg.load}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${seg.load > 80 ? 'bg-red-500' : seg.load > 60 ? 'bg-orange-500' : 'bg-cyan-500'}`}
                  style={{ width: `${seg.load}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
