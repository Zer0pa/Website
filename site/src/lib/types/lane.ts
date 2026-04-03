export interface LanePacket {
  laneIdentifier: string;
  laneTitle: string;
  repoUrl: string;
  tagline: string;
  whatThisIs: string[];
  authorityState: {
    status: 'SUPPORTED' | 'BLOCKED' | 'INCONCLUSIVE' | 'STAGED' | 'UNKNOWN';
    timestamp: string;
    summary: string;
    sourceFile: string;
  };
  headlineMetrics: Array<{
    label: string;
    valueRaw: string;
    numericValue?: number;
    unit?: string;
    sourceFile: string;
  }>;
  provedNow: string[];
  explicitNonClaims: string[];
  openRisks: string[];
  modalityStatus: Array<{
    modalityName: string;
    rawStatus: string;
    verdict: 'PASS' | 'FAIL' | 'INCONCLUSIVE' | 'DEGRADED';
    notes?: string;
  }>;
  proofAnchors: Array<{
    label: string;
    path: string;
    repoUrl: string;
    description: string;
  }>;
  repoShape: Array<{
    path: string;
    description: string;
  }>;
  verificationPath: string[];
  parserWarnings: string[];
  confidenceScore: number;
  commitSha: string;
  syncedAt: string;
}
