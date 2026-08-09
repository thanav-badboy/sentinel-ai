import { useRef } from 'react';
import { ShieldCheck, ShieldAlert, X, Download, Lock } from 'lucide-react';
import type { ScanResult } from '../types';
import jsPDF from 'jspdf';

interface QuarantineModalProps {
  scanResult: ScanResult;
  onClose: () => void;
}

export default function QuarantineModal({ scanResult, onClose }: QuarantineModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const downloadPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 48;
      const contentW = pageW - margin * 2;
      let y = margin;

      // ── Helper utilities ────────────────────────────────────────────────
      const line = (text: string, size = 11, color: [number, number, number] = [203, 213, 225]) => {
        doc.setFontSize(size);
        doc.setTextColor(...color);
        doc.text(text, margin, y);
        y += size * 1.6;
      };
      const rule = () => {
        doc.setDrawColor(51, 65, 85);
        doc.line(margin, y, margin + contentW, y);
        y += 14;
      };
      const gap = (n = 10) => { y += n; };

      // ── Dark background ──────────────────────────────────────────────────
      doc.setFillColor(2, 6, 23);
      doc.rect(0, 0, pageW, doc.internal.pageSize.getHeight(), 'F');

      // ── Header ──────────────────────────────────────────────────────────
      doc.setFillColor(8, 47, 73);
      doc.roundedRect(margin, y - 10, contentW, 60, 6, 6, 'F');
      doc.setFontSize(22);
      doc.setTextColor(0, 242, 254);
      doc.setFont('helvetica', 'bold');
      doc.text('SentinelAI', margin + 14, y + 20);
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.text('EXECUTIVE SECURITY INCIDENT REPORT', margin + 14, y + 38);
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin + contentW - 14, y + 38, { align: 'right' });
      y += 72;
      gap();

      // ── Ticket ID ───────────────────────────────────────────────────────
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`TICKET ID: ${scanResult.id || 'N/A'}   •   STATUS: QUARANTINE ACTIVE`, margin, y);
      y += 18;
      rule();

      // ── Threat Score Block ───────────────────────────────────────────────
      const scoreColor: [number, number, number] = scanResult.threatScore >= 75 ? [239, 68, 68] :
        scanResult.threatScore >= 50 ? [249, 115, 22] : [34, 197, 94];

      doc.setFillColor(15, 23, 42);
      doc.roundedRect(margin, y, contentW, 56, 4, 4, 'F');
      doc.setFontSize(36);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...scoreColor);
      doc.text(`${scanResult.threatScore}`, margin + 24, y + 40);
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.text('/ 100  THREAT SCORE', margin + 68, y + 28);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...scoreColor);
      doc.text(scanResult.riskLevel, margin + 68, y + 46);
      y += 68;
      gap();

      // ── Attack vector ────────────────────────────────────────────────────
      doc.setFont('helvetica', 'bold');
      line('ATTACK VECTOR', 9, [100, 116, 139]);
      doc.setFont('helvetica', 'bold');
      line(scanResult.attackVector, 15, [226, 232, 240]);
      gap(4);

      // ── Fields grid ─────────────────────────────────────────────────────
      rule();
      const cols = [
        ['TARGET SYSTEM', 'Internal Organization'],
        ['IMPERSONATION TARGET', scanResult.impersonationTarget || 'None Detected'],
        ['TIMESTAMP', scanResult.timestamp || new Date().toLocaleString()],
        ['RISK CLASSIFICATION', scanResult.riskLevel],
      ];
      cols.forEach(([label, val]) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(label, margin, y);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(203, 213, 225);
        doc.text(val, margin + 180, y);
        y += 18;
      });
      gap(6);
      rule();

      // ── Threat Flags ────────────────────────────────────────────────────
      if (scanResult.flags.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('THREAT FLAGS IDENTIFIED', margin, y);
        y += 14;
        scanResult.flags.forEach(flag => {
          doc.setFillColor(120, 53, 15);
          doc.roundedRect(margin, y - 10, contentW, 18, 3, 3, 'F');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(253, 186, 116);
          doc.text(`⚠  ${flag}`, margin + 8, y + 3);
          y += 22;
        });
        gap(4);
      }

      // ── Flagged Phrases ─────────────────────────────────────────────────
      if (scanResult.flaggedPhrases.length > 0) {
        rule();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('FLAGGED LINGUISTIC ARTIFACTS', margin, y);
        y += 14;
        scanResult.flaggedPhrases.forEach(phrase => {
          doc.setFillColor(69, 10, 10);
          doc.roundedRect(margin, y - 10, contentW, 18, 3, 3, 'F');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(252, 165, 165);
          doc.text(`"${phrase}"`, margin + 8, y + 3);
          y += 22;
        });
        gap(4);
      }

      // ── Telemetry ───────────────────────────────────────────────────────
      if (scanResult.telemetryLogs.length > 0) {
        rule();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('AGENT TELEMETRY LOG', margin, y);
        y += 14;
        scanResult.telemetryLogs.forEach((log, i) => {
          const agents = ['NLP', 'FIN', 'DNS', 'BEHAV', 'CORE'];
          const agentLabel = `[${agents[i % 5]}-${String(i + 1).padStart(2, '0')}]`;
          doc.setFont('courier', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(251, 146, 60);
          doc.text(`${agentLabel}  `, margin, y);
          doc.setTextColor(148, 163, 184);
          const lines = doc.splitTextToSize(log, contentW - 80);
          doc.text(lines, margin + 64, y);
          y += 14 * lines.length;
        });
        gap(4);
      }

      // ── Remediation ─────────────────────────────────────────────────────
      rule();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('AUTOMATED REMEDIATION ACTIONS', margin, y);
      y += 14;
      const actions = [
        'Sender domain added to global blocklist',
        'Similar payloads scrubbed from all inboxes',
        'Alert dispatched to CISO dashboard',
      ];
      actions.forEach(action => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(52, 211, 153);
        doc.text(`✓  ${action}`, margin, y);
        y += 16;
      });

      // ── Footer ──────────────────────────────────────────────────────────
      gap(20);
      rule();
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');
      doc.text('CONFIDENTIAL — SentinelAI Threat Operations Engine', pageW / 2, y, { align: 'center' });
      y += 12;
      doc.text(`Report ID: ${scanResult.id || 'N/A'}  •  Do not distribute without CISO approval`, pageW / 2, y, { align: 'center' });

      doc.save(`SentinelAI_Threat_Report_${scanResult.id || 'Unknown'}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Check the browser console for details.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="glass bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 animate-badge-pop flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Executive Security Ticket Generated</h2>
              <p className="text-xs text-slate-400 font-mono mt-1">{scanResult.id} • QUARANTINE ACTIVE</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto cyber-scrollbar flex-1">
          <div ref={printRef} className="bg-slate-950 border border-slate-800 rounded-xl p-6 font-mono text-sm relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><ShieldAlert size={100} /></div>
            
            <div className="space-y-4 text-slate-300 relative z-10">
              <div className="border-b border-slate-800 pb-4 flex justify-between items-start">
                <div>
                  <p className="text-slate-500 mb-1 text-xs">INCIDENT REPORT</p>
                  <p className="text-lg font-bold text-slate-200">{scanResult.attackVector}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-xs mb-1">TIMESTAMP</p>
                  <p className="text-slate-300 text-xs">{scanResult.timestamp}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-slate-500 text-xs">TARGET</p><p className="text-slate-300">Internal Organization</p></div>
                <div><p className="text-slate-500 text-xs">IMPERSONATION TARGET</p><p className="text-slate-300">{scanResult.impersonationTarget || 'Unknown'}</p></div>
                <div>
                  <p className="text-slate-500 text-xs">THREAT SCORE</p>
                  <div className="flex items-center gap-2">
                    <p className="text-red-400 font-bold text-lg">{scanResult.threatScore}/100</p>
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-xs border border-red-500/30">{scanResult.riskLevel}</span>
                  </div>
                </div>
                <div><p className="text-slate-500 text-xs">STATUS</p><p className="text-emerald-400 font-bold flex items-center gap-1"><ShieldCheck size={14}/>Blocked & Quarantined</p></div>
              </div>

              {scanResult.flaggedPhrases.length > 0 && (
                <div className="pt-4 border-t border-slate-800">
                  <p className="text-slate-500 text-xs mb-2">FLAGGED ARTIFACTS</p>
                  <div className="flex flex-wrap gap-2">
                    {scanResult.flaggedPhrases.map((phrase, idx) => (
                      <span key={idx} className="px-2 py-1 bg-red-900/30 text-red-400 border border-red-800 rounded text-xs">"{phrase}"</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800">
                <p className="text-slate-500 text-xs mb-2">AUTOMATED ACTIONS TAKEN</p>
                <ul className="space-y-2">
                  {['Sender domain added to global blocklist', 'Similar payloads scrubbed from all inboxes', 'Alert dispatched to CISO dashboard'].map((a, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-300 font-sans text-sm">
                      <Lock size={14} className="text-emerald-500 shrink-0" /> {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50 rounded-b-2xl flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-slate-200 font-medium text-sm transition-colors">
            Close
          </button>
          <button 
            onClick={downloadPDF}
            className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <Download size={16} />
            Download PDF Report
          </button>
        </div>
      </div>
    </div>
  );
}
