import type { SepsisRiskResponse, DrugInteractionResponse, OperationsRiskResponse } from '../types/drilldown';

const API_BASE = '/api';

async function post<T>(path: string, body: unknown, token: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed (${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}

export async function fetchSepsisRisk(token: string, patientId: string, vitals: {
  heart_rate: number;
  respiratory_rate: number;
  temperature_celsius: number;
  systolic_bp: number;
  wbc_count?: number;
  lactate?: number;
  care_setting: string;
}): Promise<SepsisRiskResponse> {
  return post('/predict/sepsis-risk', { patient_id: patientId, ...vitals }, token);
}

export async function fetchDrugInteractions(token: string, patientId: string, drugs: {
  drug_name: string;
  dose?: string;
  route?: string;
}[]): Promise<DrugInteractionResponse> {
  return post('/check/drug-interactions', {
    patient_id: patientId,
    drugs,
  }, token);
}

export async function fetchOperationsRisk(token: string, input: {
  timestamp: string;
  icu_occupancy_percent: number;
  total_bed_occupancy_percent: number;
  ed_waiting_patients: number;
  ed_boarding_patients: number;
  ventilator_utilization_percent: number;
  nurse_patient_ratio: number;
  admissions_last_6h: number;
  discharges_last_6h: number;
  elective_surgeries_next_24h: number;
}): Promise<OperationsRiskResponse> {
  return post('/forecast/operations-risk', input, token);
}
