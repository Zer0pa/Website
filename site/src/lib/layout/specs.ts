export type LayoutPageId = 'home' | 'imc' | 'work-xr' | 'work-ft';

export type LayoutReferenceEntry = {
  id: string;
  role: string;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  positionTolerance?: number;
  sizeTolerance?: number;
  ignoreHeightDelta?: boolean;
};

export type LayoutPageSpec = {
  page: LayoutPageId;
  route: string;
  viewport: {
    width: number;
    height: number;
  };
  entries: LayoutReferenceEntry[];
};

function genericWorkEntries(): LayoutReferenceEntry[] {
  return [
    {
      id: 'work.lane.page',
      role: 'authority-page',
      x: 20,
      y: 34,
      width: 984,
      height: 1600,
      positionTolerance: 30,
      sizeTolerance: 120,
      ignoreHeightDelta: true,
    },
    { id: 'work.lane.hero.title', role: 'title', x: 20, y: 58, width: 260, height: 86, positionTolerance: 10, sizeTolerance: 30 },
    { id: 'work.lane.hero.meta', role: 'meta-brackets', x: 736, y: 58, width: 248, height: 72, positionTolerance: 18, sizeTolerance: 36 },
    { id: 'work.lane.hero.identity', role: 'identity-copy', x: 20, y: 186, width: 520, height: 128, positionTolerance: 18, sizeTolerance: 40 },
    { id: 'work.lane.hero.authority', role: 'authority-panel', x: 596, y: 182, width: 388, height: 132, positionTolerance: 18, sizeTolerance: 40 },
    { id: 'work.lane.metric.row', role: 'metric-row', x: 20, y: 346, width: 984, height: 88, positionTolerance: 18, sizeTolerance: 24 },
    { id: 'work.lane.proof.assertions', role: 'assertions-panel', x: 20, y: 480, width: 470, height: 164, positionTolerance: 22, sizeTolerance: 48 },
    { id: 'work.lane.nonclaims', role: 'nonclaims-panel', x: 514, y: 480, width: 490, height: 164, positionTolerance: 22, sizeTolerance: 48 },
    { id: 'work.lane.modality.snapshot', role: 'modality-band', x: 20, y: 688, width: 984, height: 128, positionTolerance: 18, sizeTolerance: 32 },
    { id: 'work.lane.evidence.routes', role: 'evidence-panel', x: 20, y: 872, width: 472, height: 286, positionTolerance: 22, sizeTolerance: 50 },
    { id: 'work.lane.repo.shape', role: 'repo-panel', x: 512, y: 872, width: 492, height: 286, positionTolerance: 22, sizeTolerance: 50 },
    { id: 'work.lane.proof.terminal', role: 'proof-terminal', x: 20, y: 1208, width: 984, height: 144, positionTolerance: 18, sizeTolerance: 24 },
    { id: 'work.lane.related.lanes', role: 'related-lanes', x: 20, y: 1424, width: 984, height: 128, positionTolerance: 20, sizeTolerance: 32 },
    { id: 'work.lane.cta.band', role: 'cta-band', x: 20, y: 1590, width: 984, height: 212, positionTolerance: 22, sizeTolerance: 44 },
  ];
}

export const REFERENCE_LAYOUT_SPECS: Record<LayoutPageId, LayoutPageSpec> = {
  home: {
    page: 'home',
    route: '/',
    viewport: { width: 1024, height: 2080 },
    entries: [
      { id: 'home.header', role: 'header-shell', x: 0, y: 0, width: 1024, height: 34, positionTolerance: 4, sizeTolerance: 4 },
      { id: 'home.header.logo', role: 'brand', x: 20, y: 8, width: 80, height: 18, positionTolerance: 8, sizeTolerance: 20 },
      { id: 'home.header.nav', role: 'primary-nav', x: 118, y: 8, width: 240, height: 16, positionTolerance: 16, sizeTolerance: 32 },
      { id: 'home.hero.statusbar', role: 'hero-status-bar', x: 20, y: 34, width: 984, height: 26, positionTolerance: 4, sizeTolerance: 8 },
      { id: 'home.hero.heading', role: 'hero-heading', x: 20, y: 68, width: 590, height: 292, positionTolerance: 14, sizeTolerance: 28, textColor: 'rgb(255, 255, 255)' },
      { id: 'home.hero.body', role: 'hero-body', x: 20, y: 374, width: 320, height: 72, positionTolerance: 18, sizeTolerance: 24 },
      { id: 'home.hero.cta', role: 'hero-cta', x: 388, y: 370, width: 172, height: 36, positionTolerance: 18, sizeTolerance: 18, backgroundColor: 'rgb(255, 255, 255)' },
      { id: 'home.hero.telemetry', role: 'hero-telemetry', x: 716, y: 292, width: 256, height: 82, positionTolerance: 22, sizeTolerance: 30 },
      { id: 'home.flagship.media', role: 'flagship-media', x: 20, y: 486, width: 322, height: 262, positionTolerance: 18, sizeTolerance: 28 },
      { id: 'home.flagship.summary', role: 'flagship-summary', x: 344, y: 486, width: 660, height: 262, positionTolerance: 18, sizeTolerance: 32 },
      { id: 'home.index.grid', role: 'systems-grid', x: 20, y: 912, width: 984, height: 250, positionTolerance: 20, sizeTolerance: 36 },
      { id: 'home.proof.logic', role: 'proof-logic', x: 20, y: 1292, width: 984, height: 452, positionTolerance: 24, sizeTolerance: 48 },
    ],
  },
  imc: {
    page: 'imc',
    route: '/imc',
    viewport: { width: 1024, height: 1850 },
    entries: [
      {
        id: 'imc.page',
        role: 'authority-page',
        x: 20,
        y: 34,
        width: 984,
        height: 1600,
        positionTolerance: 30,
        sizeTolerance: 120,
        ignoreHeightDelta: true,
      },
      { id: 'imc.hero.title', role: 'title', x: 20, y: 58, width: 260, height: 86, positionTolerance: 10, sizeTolerance: 30 },
      { id: 'imc.hero.meta', role: 'meta-brackets', x: 736, y: 58, width: 248, height: 72, positionTolerance: 18, sizeTolerance: 36 },
      { id: 'imc.hero.identity', role: 'identity-copy', x: 20, y: 186, width: 520, height: 128, positionTolerance: 18, sizeTolerance: 40 },
      { id: 'imc.hero.authority', role: 'authority-panel', x: 596, y: 182, width: 388, height: 132, positionTolerance: 18, sizeTolerance: 40 },
      { id: 'imc.metric.row', role: 'metric-row', x: 20, y: 346, width: 984, height: 88, positionTolerance: 18, sizeTolerance: 24 },
      { id: 'imc.proof.assertions', role: 'assertions-panel', x: 20, y: 480, width: 470, height: 164, positionTolerance: 22, sizeTolerance: 48 },
      { id: 'imc.nonclaims', role: 'nonclaims-panel', x: 514, y: 480, width: 490, height: 164, positionTolerance: 22, sizeTolerance: 48 },
      { id: 'imc.modality.snapshot', role: 'modality-band', x: 20, y: 688, width: 984, height: 128, positionTolerance: 18, sizeTolerance: 32 },
      { id: 'imc.evidence.routes', role: 'evidence-panel', x: 20, y: 872, width: 472, height: 286, positionTolerance: 22, sizeTolerance: 50 },
      { id: 'imc.repo.shape', role: 'repo-panel', x: 512, y: 872, width: 492, height: 286, positionTolerance: 22, sizeTolerance: 50 },
      { id: 'imc.proof.terminal', role: 'proof-terminal', x: 20, y: 1208, width: 984, height: 144, positionTolerance: 18, sizeTolerance: 24 },
      { id: 'imc.related.lanes', role: 'related-lanes', x: 20, y: 1424, width: 984, height: 128, positionTolerance: 20, sizeTolerance: 32 },
      { id: 'imc.cta.band', role: 'cta-band', x: 20, y: 1590, width: 984, height: 212, positionTolerance: 22, sizeTolerance: 44 },
    ],
  },
  'work-xr': {
    page: 'work-xr',
    route: '/work/xr',
    viewport: { width: 1024, height: 1850 },
    entries: genericWorkEntries(),
  },
  'work-ft': {
    page: 'work-ft',
    route: '/work/ft',
    viewport: { width: 1024, height: 1850 },
    entries: genericWorkEntries(),
  },
};
