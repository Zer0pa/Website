const laneSnapshotSchema = {
  name: 'laneSnapshot',
  title: 'Lane Snapshot (Machine)',
  type: 'document',
  readOnly: true, // PRD §4: Machine-owned, write-protected
  fields: [
    { name: 'lane', title: 'Lane Reference', type: 'reference', to: [{ type: 'lane' }] },
    { name: 'commitSha', title: 'Commit SHA', type: 'string' },
    { name: 'syncedAt', title: 'Synced At', type: 'datetime' },
    { name: 'laneIdentifier', title: 'Lane Identifier', type: 'string' },
    { name: 'laneTitle', title: 'Lane Title', type: 'string' },
    { name: 'tagline', title: 'Tagline', type: 'string' },
    { name: 'whatThisIs', title: 'What This Is', type: 'array', of: [{ type: 'text' }] },
    {
      name: 'authorityState',
      title: 'Authority State',
      type: 'object',
      fields: [
        { name: 'status', type: 'string' },
        { name: 'timestamp', type: 'string' },
        { name: 'summary', type: 'string' },
        { name: 'sourceFile', type: 'string' },
      ]
    },
    {
      name: 'headlineMetrics',
      title: 'Headline Metrics',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'label', type: 'string' },
          { name: 'valueRaw', type: 'string' },
          { name: 'numericValue', type: 'number' },
          { name: 'unit', type: 'string' },
          { name: 'sourceFile', type: 'string' },
        ]
      }]
    },
    { name: 'provedNow', title: 'Proved Now', type: 'array', of: [{ type: 'string' }] },
    { name: 'explicitNonClaims', title: 'Explicit Non-Claims', type: 'array', of: [{ type: 'string' }] },
    { name: 'openRisks', title: 'Open Risks', type: 'array', of: [{ type: 'string' }] },
    {
      name: 'modalityStatus',
      title: 'Modality Status',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'modalityName', type: 'string' },
          { name: 'rawStatus', type: 'string' },
          { name: 'verdict', type: 'string' },
          { name: 'notes', type: 'string' },
        ]
      }]
    },
    {
      name: 'proofAnchors',
      title: 'Proof Anchors',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'label', type: 'string' },
          { name: 'path', type: 'string' },
          { name: 'repoUrl', type: 'url' },
          { name: 'description', type: 'string' },
        ]
      }]
    },
    {
      name: 'repoShape',
      title: 'Repo Shape',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'path', type: 'string' },
          { name: 'description', type: 'string' },
        ]
      }]
    },
    { name: 'parserWarnings', title: 'Parser Warnings', type: 'array', of: [{ type: 'string' }] },
    { name: 'confidenceScore', title: 'Confidence Score', type: 'number' },
  ]
};

export default laneSnapshotSchema;
