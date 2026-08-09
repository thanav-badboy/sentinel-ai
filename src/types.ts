export interface ScanResult {
  id?: string;
  timestamp?: string;
  threatScore: number;
  riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impersonationTarget: string;
  attackVector: string;
  flags: string[];
  flaggedPhrases: string[];
  telemetryLogs: string[];
}
