import type { TourStep } from './types';

export const clinicalSteps: TourStep[] = [
  {
    id: 'overview',
    title: 'System Overview',
    script:
      "You're viewing the MediRangeX Clinical Command Center. This platform continuously analyzes patient risk, medication safety, hospital capacity, and AI system performance — in real time. Every panel updates automatically as new clinical data flows in, giving care teams a unified situational picture.",
    targetSelector: '[data-guide="dashboard"]',
    highlightColor: '#38bdf8',
  },
  {
    id: 'sepsis',
    title: 'Sepsis Risk Intelligence',
    script:
      "This panel shows real-time sepsis risk scoring. The system evaluates vital signs, perfusion markers, and clinical context — surfacing triggered risk factors and recommended actions automatically. Early warning fires before clinical deterioration occurs, giving clinicians the window they need to intervene.",
    targetSelector: '[data-guide="clinical-card"]',
    highlightColor: '#ef4444',
  },
  {
    id: 'medication',
    title: 'Medication Safety',
    script:
      "When therapies are ordered, the drug safety engine scans for interactions, contraindications, and patient-specific risk modifiers. Alert severity levels — from advisory to critical — are surfaced with clinical context. The engine accounts for renal function, weight, and concurrent medications before flagging.",
    targetSelector: '[data-guide="medication-card"]',
    highlightColor: '#f59e0b',
  },
  {
    id: 'operations',
    title: 'Operational Awareness',
    script:
      "This section predicts ICU load, staffing strain, and emergency congestion before capacity becomes critical. The forecasting engine looks 4 to 24 hours ahead, allowing operational teams to act preemptively rather than reactively. Surge alerts fire when thresholds are approached, not exceeded.",
    targetSelector: '[data-guide="operations-card"]',
    highlightColor: '#14b8a6',
  },
  {
    id: 'ml',
    title: 'Unified Intelligence',
    script:
      "All intelligence streams converge here. The AI model operations monitor tracks prediction volume, model confidence, and drift detection across every active model. When model behavior deviates from baseline, the system flags it immediately — ensuring clinical teams always know the reliability of every recommendation.",
    targetSelector: '[data-guide="ml-card"]',
    highlightColor: '#3b82f6',
  },
];

export const investorSteps: TourStep[] = [
  {
    id: 'problem',
    title: 'Problem Framing',
    script:
      "Healthcare generates massive clinical data, but interpretation lags cost lives and resources. Sepsis alone kills 270,000 Americans annually — most from delayed detection. Adverse drug events cost hospitals $3.5 billion per year. MediRangeX closes that gap with real-time intelligence layered directly into clinical workflow.",
    targetSelector: '[data-guide="dashboard"]',
    highlightColor: '#38bdf8',
  },
  {
    id: 'positioning',
    title: 'Product Positioning',
    script:
      "MediRangeX is a clinical intelligence layer — not another dashboard. It operationalizes prediction into action. Where legacy systems show data, MediRangeX surfaces decisions. The distinction drives adoption. Clinicians don't need more information — they need faster signal in a noisy environment.",
    targetSelector: '[data-guide="clinical-card"]',
    highlightColor: '#3b82f6',
  },
  {
    id: 'differentiation',
    title: 'Differentiation',
    script:
      "Unlike siloed point solutions, this system unifies clinical risk scoring, medication safety, operational forecasting, and AI governance in a single intelligence layer. No competitor offers this depth of cross-domain integration at this latency. The unified view eliminates the blind spots that siloed tools create.",
    targetSelector: '[data-guide="medication-card"]',
    highlightColor: '#f59e0b',
  },
  {
    id: 'moat',
    title: 'Moat & Architecture',
    script:
      "The platform is built on a proprietary clinical knowledge graph, hybrid predictive models combining rule-based and machine learning engines, and real-time reasoning pipelines. The knowledge bank compounds with every deployment. Each hospital integration makes the system more accurate — creating a durable data moat.",
    targetSelector: '[data-guide="operations-card"]',
    highlightColor: '#14b8a6',
  },
  {
    id: 'impact',
    title: 'Market Impact',
    script:
      "Earlier sepsis detection reduces mortality by up to 30 percent in published studies. Fewer adverse drug events reduce liability exposure. Capacity forecasting prevents revenue loss from unplanned diversions. Each outcome maps directly to hospital P&L — making the ROI case measurable, not theoretical.",
    targetSelector: '[data-guide="ml-card"]',
    highlightColor: '#10b981',
  },
  {
    id: 'business',
    title: 'Business Model',
    script:
      "Enterprise SaaS with hospital-tier annual licensing. Modular deployment allows entry via a single high-value use case — sepsis detection, pharmacy safety, or operational forecasting — then expansion across the platform. Integration-friendly architecture connects to Epic, Cerner, and HL7 FHIR environments. Land, prove ROI, expand.",
    targetSelector: '[data-guide="dashboard"]',
    highlightColor: '#38bdf8',
  },
];
