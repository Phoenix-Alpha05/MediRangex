const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pickStatus(
  rand: () => number
): "NORMAL" | "STRAINED" | "SURGE" {
  const r = rand();
  if (r < 0.25) return "NORMAL";
  if (r < 0.75) return "STRAINED";
  return "SURGE";
}

function pickRisk(
  rand: () => number,
  bias: "low" | "mid" | "high" = "mid"
): string {
  const r = rand();
  if (bias === "high") {
    if (r < 0.1) return "LOW";
    if (r < 0.3) return "MODERATE";
    if (r < 0.7) return "HIGH";
    return "CRITICAL";
  }
  if (bias === "low") {
    if (r < 0.4) return "LOW";
    if (r < 0.75) return "MODERATE";
    if (r < 0.95) return "HIGH";
    return "CRITICAL";
  }
  if (r < 0.2) return "LOW";
  if (r < 0.5) return "MODERATE";
  if (r < 0.8) return "HIGH";
  return "CRITICAL";
}

function generateDashboard() {
  const hourSeed = Math.floor(Date.now() / 3_600_000);
  const rand = seededRandom(hourSeed);

  const status = pickStatus(rand);

  const icuOcc6h = 68 + rand() * 25;
  const icuOcc24h = icuOcc6h + (rand() * 8 - 2);
  const bedOcc24h = 60 + rand() * 30;
  const edCongestion = 0.3 + rand() * 0.55;
  const staffOverload = 0.15 + rand() * 0.5;

  const highRisk = 3 + Math.floor(rand() * 8);
  const detAlerts = highRisk + Math.floor(rand() * 6);

  const riskFactorPool = [
    "Elevated lactate",
    "Tachycardia",
    "Hypotension",
    "Leukocytosis",
    "Fever",
    "Altered mental status",
    "Tachypnoea",
    "Thrombocytopenia",
    "Acute kidney injury",
    "Metabolic acidosis",
  ];
  const topRiskFactors: string[] = [];
  const factorsCopy = [...riskFactorPool];
  for (let i = 0; i < 5; i++) {
    const idx = Math.floor(rand() * factorsCopy.length);
    topRiskFactors.push(factorsCopy.splice(idx, 1)[0]);
  }

  const critAlerts = 1 + Math.floor(rand() * 5);
  const highAlertMeds = 8 + Math.floor(rand() * 18);
  const interactionPool = [
    "PD synergism -- QT prolongation",
    "PK inhibition -- CYP3A4",
    "Nephrotoxin combination",
    "Dual anticoagulation overlap",
    "CNS depressant stacking",
    "Serotonergic excess risk",
    "Hepatotoxin combination",
  ];
  const topInteractions: string[] = [];
  const intCopy = [...interactionPool];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(rand() * intCopy.length);
    topInteractions.push(intCopy.splice(idx, 1)[0]);
  }

  const surgeAlertPool = [
    "ED congestion critical",
    "ICU near capacity threshold",
    "Unsafe nurse staffing ratio",
    "Hospital surge state activated",
    "Ventilator demand exceeding supply",
  ];
  const surgeAlerts: string[] = [];
  if (status === "SURGE") {
    for (let i = 0; i < 3; i++) {
      if (rand() > 0.3) surgeAlerts.push(surgeAlertPool[i]);
    }
  } else if (status === "STRAINED") {
    if (rand() > 0.4) surgeAlerts.push(surgeAlertPool[0]);
    if (rand() > 0.6) surgeAlerts.push(surgeAlertPool[2]);
  }

  const predsLow = 8 + Math.floor(rand() * 20);
  const predsMed = 50 + Math.floor(rand() * 60);
  const predsHigh = 25 + Math.floor(rand() * 40);

  return {
    system_status: {
      system_status: status,
      icu_occupancy_6h: Math.round(icuOcc6h * 100) / 100,
      icu_occupancy_24h: Math.round(icuOcc24h * 100) / 100,
      total_bed_occupancy_24h: Math.round(bedOcc24h * 100) / 100,
      ed_congestion_probability: Math.round(edCongestion * 10000) / 10000,
      staffing_overload_probability: Math.round(staffOverload * 10000) / 10000,
    },
    clinical: {
      high_risk_patients: highRisk,
      deterioration_alerts_24h: detAlerts,
      top_risk_factors: topRiskFactors,
    },
    medication_safety: {
      critical_alerts_24h: critAlerts,
      high_alert_med_admin_count: highAlertMeds,
      top_interaction_classes: topInteractions,
    },
    operations: {
      icu_capacity_risk: pickRisk(rand, "high"),
      total_bed_capacity_risk: pickRisk(rand, "mid"),
      ventilator_capacity_risk: pickRisk(rand, "low"),
      staffing_strain_risk: pickRisk(rand, "mid"),
      surge_alerts: surgeAlerts,
    },
    ml: {
      active_model_version: "ops_ml_baseline_v1",
      predictions_last_24h: predsLow + predsMed + predsHigh,
      drift_detected: rand() > 0.85,
      confidence_distribution: {
        LOW: predsLow,
        MEDIUM: predsMed,
        HIGH: predsHigh,
      },
    },
    generated_at: new Date().toISOString(),
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/medirx-api\/?/, "/");

    if (path === "/dashboard/command-center" || path === "/" || path === "") {
      return json(generateDashboard());
    }

    return json({ error: "Not found" }, 404);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
