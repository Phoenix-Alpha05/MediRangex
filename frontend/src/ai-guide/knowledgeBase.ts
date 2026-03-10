import type { QAEntry } from './types';

export const clinicalQA: QAEntry[] = [
  {
    patterns: [/sepsis.*calculat/i, /how.*sepsis.*risk/i, /risk.*scor/i, /qsofa/i, /sofa/i],
    answer:
      "Sepsis risk is calculated using a hybrid engine that combines qSOFA scoring — respiratory rate, altered mentation, and systolic blood pressure — with lactate trends, perfusion markers, and clinical context modifiers. The model runs continuously against live vital sign streams and flags patients when composite risk exceeds threshold, typically before clinical deterioration is obvious.",
  },
  {
    patterns: [/trigger.*alert/i, /critical.*alert/i, /alert.*fire/i, /what.*alert/i, /when.*alert/i],
    answer:
      "Critical alerts fire when multiple risk signals converge simultaneously. A single abnormal vital sign is rarely sufficient — the engine looks for patterns: rising lactate alongside tachycardia, dropping MAP with altered mentation, or a sudden spike in predicted deterioration probability. The threshold is calibrated per patient profile to minimize false positives while maintaining sensitivity.",
  },
  {
    patterns: [/renal.*dosing/i, /kidney.*dosing/i, /creatinine/i, /gfr/i, /dose.*adjust/i, /adjust.*dose/i],
    answer:
      "Renal function is a first-class context modifier in the drug safety engine. When creatinine clearance or GFR is available in the patient profile, the system automatically adjusts alert thresholds for renally-cleared medications — aminoglycosides, vancomycin, NSAIDs, and others. Dosing recommendations are flagged relative to the patient's actual renal status, not population averages.",
  },
  {
    patterns: [/fda.*compli/i, /compli.*fda/i, /regulator/i, /510k/i, /ce mark/i, /hipaa/i, /approved/i],
    answer:
      "MediRangeX is architected to support regulatory compliance at multiple levels. The platform follows HIPAA data governance requirements, supports audit logging for all clinical decision support outputs, and is designed for FDA Software as a Medical Device classification under the Clinical Decision Support provisions of the 21st Century Cures Act. Formal regulatory submissions are in progress.",
  },
  {
    patterns: [/epic/i, /cerner/i, /ehr.*integrat/i, /integrat.*ehr/i, /hl7/i, /fhir/i, /emr/i],
    answer:
      "The platform integrates via HL7 FHIR R4 APIs, supporting bidirectional data exchange with Epic, Cerner, and other major EHR systems. Clinical data flows in through FHIR resource subscriptions — patients, observations, medications, and conditions. Alert outputs can be surfaced as CDS Hooks responses directly within Epic's BPA workflow, minimizing workflow disruption for clinicians.",
  },
  {
    patterns: [/drug.*interact/i, /interact.*drug/i, /medication.*safe/i, /contraindic/i],
    answer:
      "The drug safety engine maintains a multi-layered interaction knowledge base covering over 2,400 drug-drug interaction pairs, 800 contraindication rules, and 300 patient-specific modifier pathways. When a therapy is ordered, the engine cross-references the full active medication list against the knowledge graph, weighs severity levels, and surfaces only actionable alerts — filtered for the specific patient context.",
  },
  {
    patterns: [/vital.*sign/i, /monitor.*patient/i, /how.*monitor/i, /data.*source/i],
    answer:
      "The system ingests vital signs continuously from bedside monitors via HL7 ADT and ORU message streams. Observations including heart rate, blood pressure, respiratory rate, temperature, oxygen saturation, and lactate are processed through the risk engine in near real-time. The system maintains a rolling 24-hour window for trend analysis and alert contextualization.",
  },
  {
    patterns: [/ml.*model/i, /model.*accura/i, /how.*accurate/i, /auc/i, /sensitivity/i, /specificity/i],
    answer:
      "The sepsis prediction model achieves an AUROC of 0.87 on internal validation sets, with sensitivity tuned to 82 percent at a specificity of 78 percent. The drug interaction engine has a positive predictive value exceeding 91 percent for critical alerts. Model performance is monitored continuously through the AI Operations panel — drift detection fires when performance degrades below baseline.",
  },
  {
    patterns: [/staff/i, /nurse/i, /icu.*load/i, /capacity/i, /bed/i],
    answer:
      "The operational forecasting engine uses time-series models trained on historical admission patterns, current census data, and acuity scores to predict ICU load, bed capacity, and staffing strain 4 to 24 hours ahead. Surge alerts fire when predicted demand is projected to exceed threshold — giving charge nurses and administrators time to pre-position staff before capacity becomes critical.",
  },
  {
    patterns: [/what.*platform/i, /what.*does/i, /overview/i, /explain/i, /what.*medirx/i, /what.*medirengx/i],
    answer:
      "MediRangeX is a real-time clinical intelligence platform that unifies four critical domains: sepsis and patient risk scoring, medication safety surveillance, hospital capacity forecasting, and AI model governance. It layers over existing EHR infrastructure and surfaces actionable intelligence to clinical and operational teams — reducing time-to-decision in high-stakes environments.",
  },
];

export const investorQA: QAEntry[] = [
  {
    patterns: [/moat/i, /competitive.*advan/i, /defensib/i, /barrier/i, /why.*win/i],
    answer:
      "The moat compounds across three dimensions. First, proprietary clinical knowledge graph — 5 years of curation that cannot be replicated quickly. Second, network data effects — every hospital integration adds training signal that improves model accuracy for the entire network. Third, workflow integration depth — once embedded in Epic via CDS Hooks, switching costs are substantial. No single competitor matches all three.",
  },
  {
    patterns: [/validat/i, /accura/i, /evidence/i, /proof/i, /study/i, /clinical.*trial/i],
    answer:
      "Model accuracy is validated through retrospective cohort analysis and prospective pilot deployments. The sepsis model shows AUROC of 0.87, outperforming the National Early Warning Score by 14 points on the same datasets. Medication alert precision exceeds 91 percent for critical severity, reducing alert fatigue compared to legacy systems. Independent clinical validation studies are in progress at two academic medical centers.",
  },
  {
    patterns: [/deploy.*time/i, /time.*deploy/i, /implement/i, /go.*live/i, /how.*long/i, /timeline/i],
    answer:
      "Standard deployment runs 8 to 12 weeks from contract to go-live for a single module. Full platform deployment across all four domains typically takes 16 to 20 weeks. The integration architecture is pre-certified against Epic and Cerner FHIR environments — eliminating the 6 to 12 month custom integration work that has historically blocked clinical AI adoption.",
  },
  {
    patterns: [/monetize/i, /revenue/i, /business.*model/i, /pricing/i, /how.*make.*money/i, /cost/i],
    answer:
      "The business model is enterprise SaaS with annual recurring revenue. Pricing is tiered by hospital bed count and module selection — base sepsis intelligence runs $180K to $340K ARR per hospital. Full platform licenses run $480K to $900K ARR. Average contract length is 3 years. Expansion revenue from module add-ons drives net revenue retention above 130 percent in existing accounts.",
  },
  {
    patterns: [/scale/i, /scalab/i, /network/i, /expand/i, /hospital.*system/i, /health.*system/i],
    answer:
      "The architecture is cloud-native and horizontally scalable. A single deployment can support a 10-hospital health system through centralized FHIR integration. Multi-tenant architecture allows the same model layer to serve hundreds of hospitals simultaneously. The go-to-market strategy targets regional health systems — one contract can mean 5 to 15 hospital sites. The largest U.S. health systems represent $10M plus ARR opportunities.",
  },
  {
    patterns: [/market.*size/i, /tam/i, /sam/i, /market.*opportun/i, /how.*big/i],
    answer:
      "The total addressable market spans 6,000 acute care hospitals in the U.S. alone, with an estimated $8 billion in annual spend on clinical decision support and patient safety technology. The SAM for AI-native clinical intelligence — replacing or augmenting legacy rule-based systems — is growing at 34 percent CAGR. International markets in Europe and the Middle East represent a further 12,000 acute care facilities.",
  },
  {
    patterns: [/competit/i, /versus/i, /compet.*against/i, /who.*else/i, /alternative/i],
    answer:
      "Primary competitors include Epic Deterioration Index — built into Epic but limited to sepsis with no medication or operations layer. Philips and Dräger offer bedside monitoring integrations but lack the cross-domain intelligence layer. Nuance and Jvion address point solutions. No competitor currently offers a unified clinical intelligence platform spanning risk, pharmacy, operations, and AI governance in a single integrated system.",
  },
  {
    patterns: [/roi/i, /return.*invest/i, /financial.*impact/i, /savings/i, /value.*prop/i],
    answer:
      "The financial case is direct. A single avoided ICU death reduces hospital costs by $35,000 to $80,000 on average. A 10 percent reduction in adverse drug events saves a 500-bed hospital $2.1 million annually. Capacity forecasting reducing even 3 unplanned diversions per month represents $900,000 in recovered revenue. Customer ROI payback period is typically under 8 months at full platform deployment.",
  },
  {
    patterns: [/team/i, /founder/i, /who.*built/i, /experience/i, /background/i],
    answer:
      "The founding team combines clinical informatics, machine learning, and health system operations expertise. The clinical advisory board includes critical care physicians and chief medical officers from academic medical centers. The engineering team has prior experience at enterprise health IT companies and has successfully deployed clinical AI systems in regulated environments.",
  },
  {
    patterns: [/funding/i, /invest/i, /raise/i, /round/i, /valuation/i],
    answer:
      "The company is currently raising its Series A to accelerate enterprise sales and expand the clinical knowledge graph. The fundraise is structured to support 18 months of runway, 4 to 6 new enterprise health system contracts, and regulatory pathway investment for FDA SaMD classification. Existing investors include healthcare-focused venture funds with active portfolio companies in clinical AI.",
  },
  {
    patterns: [/what.*platform/i, /what.*does/i, /overview/i, /explain/i, /what.*medirx/i],
    answer:
      "MediRangeX is an enterprise clinical intelligence platform for acute care hospitals. It delivers real-time sepsis detection, medication safety surveillance, hospital capacity forecasting, and AI model governance in a unified system — layered over existing EHR infrastructure through FHIR APIs. The platform is designed to reduce mortality, liability, and revenue leakage simultaneously, making the business case clear across clinical, operational, and financial stakeholders.",
  },
];

export function findAnswer(question: string, qa: QAEntry[]): string | null {
  const q = question.toLowerCase().trim();
  for (const entry of qa) {
    for (const pattern of entry.patterns) {
      if (typeof pattern === 'string') {
        if (q.includes(pattern.toLowerCase())) return entry.answer;
      } else {
        if (pattern.test(q)) return entry.answer;
      }
    }
  }
  return null;
}
