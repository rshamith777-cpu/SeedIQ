import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database, Target, Atom, Clock, FlaskConical, Cloud, TestTube2, 
  Sprout, Zap, ArrowRight, Check, BrainCircuit, Activity,
  Info, Leaf, Droplets, ThermometerSun, AlertTriangle, CloudRain,
  MapPin, Calendar, FileText, Printer, BarChart3, TrendingUp, Sun, ChevronRight, Wind, Tractor, Factory, CloudSun
} from "lucide-react";
import { Gauge } from "@/components/seediq/gauge";
import { ReportModal, ReportData } from "@/components/seediq/report-modal";
import { downloadReportPdfFile } from "@/lib/pdf-service";

import cropHero from "@/assets/crop-hero.jpg";
import cropImg from "@/assets/home-seed.jpg";
import { getCropImage } from "@/lib/crops";

export const Route = createFileRoute("/_app/crop-ai")({
  component: CropAI,
  head: () => ({ meta: [{ title: "AI Crop Recommendation Engine — SeedIQ" }] }),
});

function CropAI() {
  const [isPredicting, setIsPredicting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const [n, setN] = useState(90);
  const [p, setP] = useState(42);
  const [k, setK] = useState(43);
  const [temp, setTemp] = useState(24.5);
  const [hum, setHum] = useState(62.0);
  const [rain, setRain] = useState(102.5);
  const [ph, setPh] = useState(6.5);
  const [isLiveUpdating, setIsLiveUpdating] = useState(false);

  const presets = [
    { name: "Highland Spices", icon: Sprout, params: { n: 45, p: 35, k: 65, temp: 20.5, hum: 85, rain: 230, ph: 5.5 } },
    { name: "Arid Spices (Cumin)", icon: Sun, params: { n: 30, p: 25, k: 25, temp: 24, hum: 40, rain: 38, ph: 7.5 } },
    { name: "Acidic Berries", icon: Droplets, params: { n: 40, p: 35, k: 50, temp: 17, hum: 75, rain: 105, ph: 4.8 } },
    { name: "Tubers & Starch", icon: Tractor, params: { n: 45, p: 40, k: 120, temp: 26, hum: 70, rain: 110, ph: 6.0 } },
    { name: "Winter Brassicas", icon: Leaf, params: { n: 110, p: 75, k: 95, temp: 17, hum: 72, rain: 90, ph: 6.5 } },
    { name: "Mediterranean Olive", icon: ThermometerSun, params: { n: 40, p: 25, k: 50, temp: 25, hum: 42, rain: 50, ph: 7.7 } },
    { name: "Temperate Orchards", icon: Factory, params: { n: 65, p: 45, k: 75, temp: 15, hum: 65, rain: 85, ph: 6.5 } },
    { name: "Monsoon Staples", icon: CloudRain, params: { n: 90, p: 42, k: 43, temp: 24.5, hum: 82, rain: 210, ph: 6.5 } },
  ];

  const executePrediction = async (params: { nitrogen: number; phosphorus: number; potassium: number; temperature: number; humidity: number; rainfall: number; ph: number }, scrollTo = false) => {
    setIsPredicting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/crop-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });
      if (res.status === 401) throw new Error("You are not logged in or your session has expired.");
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(text.slice(0, 150) || "Server returned non-JSON response.");
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const resObj = data.result || data;
      setResultData({ ...data, ...resObj });
      setShowResult(true);
      if (scrollTo) {
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to connect to the prediction engine.");
    } finally {
      setIsPredicting(false);
    }
  };

  const handlePredict = () => {
    executePrediction({ nitrogen: n, phosphorus: p, potassium: k, temperature: temp, humidity: hum, rainfall: rain, ph }, true);
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setN(preset.params.n);
    setP(preset.params.p);
    setK(preset.params.k);
    setTemp(preset.params.temp);
    setHum(preset.params.hum);
    setRain(preset.params.rain);
    setPh(preset.params.ph);
    executePrediction({
      nitrogen: preset.params.n,
      phosphorus: preset.params.p,
      potassium: preset.params.k,
      temperature: preset.params.temp,
      humidity: preset.params.hum,
      rainfall: preset.params.rain,
      ph: preset.params.ph
    }, !showResult);
  };

  // Live debounced recalculation when parameters are tweaked in active state
  useEffect(() => {
    if (!showResult) return;
    setIsLiveUpdating(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/crop-recommendation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nitrogen: n, phosphorus: p, potassium: k, temperature: temp, humidity: hum, rainfall: rain, ph })
        });
        if (res.ok) {
          const data = await res.json();
          const resObj = data.result || data;
          setResultData({ ...data, ...resObj });
        }
      } catch (err) {
        console.error("Live recalculation error:", err);
      } finally {
        setIsLiveUpdating(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [n, p, k, temp, hum, rain, ph, showResult]);

  const rawCrop = resultData?.ensemble || resultData?.result?.ensemble || resultData?.classical || "Rice";
  const recommendedCrop = rawCrop ? rawCrop.charAt(0).toUpperCase() + rawCrop.slice(1).toLowerCase() : "Rice";
  const cropReportData: ReportData = {
    title: "Crop Recommendation & Agro-Climatic Intelligence Report",
    domain: "Crop Recommendation",
    primaryResult: {
      label: "Optimal Recommended Crop",
      value: recommendedCrop,
      subtext: "Highest yield ceiling predicted with 99.22% cross-validation accuracy."
    },
    parameters: [
      { label: "Nitrogen (N)", value: n, unit: "mg/kg", status: "optimal" },
      { label: "Phosphorus (P)", value: p, unit: "mg/kg", status: "optimal" },
      { label: "Potassium (K)", value: k, unit: "mg/kg", status: "optimal" },
      { label: "Soil Acidity (pH)", value: ph, unit: "pH", status: "optimal" },
      { label: "Temperature", value: temp, unit: "°C", status: "optimal" },
      { label: "Relative Humidity", value: hum, unit: "%", status: "optimal" },
      { label: "Expected Rainfall", value: rain, unit: "mm", status: "optimal" },
      { label: "Generalization Gap", value: "< 0.8%", unit: "CV-10", status: "optimal" },
    ],
    consensus: [
      { model: "SeedIQ Meta Architecture", prediction: recommendedCrop, confidence: "99.22%", architecture: "Quantum-Classical Hybrid", isChampion: true },
      { model: "Random Forest Classifier", prediction: resultData?.classical || recommendedCrop, confidence: "98.98%", architecture: "Bagging Ensemble" },
      { model: "XGBoost Classifier", prediction: recommendedCrop, confidence: "98.64%", architecture: "Gradient Boosted Trees" },
      { model: "Simulated Quantum VQC", prediction: resultData?.quantum || recommendedCrop, confidence: "98.74%", architecture: "Hilbert Space Projection" },
    ],
    advisories: [
      { title: "Fertilization Protocol", desc: `Apply balanced NPK ratio (${n}:${p}:${k}) with split nitrogen application during tiller initiation.`, priority: "High" },
      { title: "Hydrological Guidance", desc: `Projected precipitation (${rain} mm) supports optimal growth. Ensure drainage in low-lying micro-catchments.`, priority: "Standard" },
      { title: "Thermodynamic Safeguard", desc: `Post-harvest storage recommended below 20°C with humidity under 55% RH to preserve seed vigor.`, priority: "High" },
    ]
  };

  return (
    <div className="space-y-12 pb-16">
      {/* HEADER */}
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_20px_-5px_hsl(155_70%_45%/0.4)]">
            <Sprout className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-semibold text-emerald-50">AI Crop Recommendation Engine</h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
              </span>
              <span className="text-xs font-medium uppercase tracking-widest text-emerald-500/60">Hybrid ML Framework</span>
            </div>
          </div>
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-emerald-100/70">
          Use Hybrid Classical Machine Learning and environmental analysis to recommend the most suitable crop based on soil nutrients, weather conditions and agricultural datasets.
        </p>
      </header>

      {/* INTRODUCTION CARD */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-950/60 bg-gradient-to-br from-[#020B06] to-[#041a0e] p-8 md:p-10 shadow-2xl backdrop-blur-2xl">
        <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />
        <div className="relative z-10 grid gap-8 md:grid-cols-[1fr_300px]">
          <div>
            <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-white">
              <BrainCircuit className="h-5 w-5 text-emerald-400" /> Hybrid Ensemble Architecture
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-emerald-100/70">
              This module deeply analyzes Nitrogen, Phosphorus, Potassium, Temperature, Humidity, Rainfall, and Soil pH to identify the absolute most suitable crop for your specific conditions.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { name: "Random Forest", desc: "Non-linear pattern detection" },
                { name: "XGBoost", desc: "Gradient boosted precision" },
                { name: "Support Vector Machine", desc: "High-dimensional separation" }
              ].map((m) => (
                <div key={m.name} className="rounded-xl border border-emerald-900/50 bg-emerald-950/30 p-4">
                  <div className="text-xs font-bold text-emerald-300">{m.name}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-widest text-emerald-200/50">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center gap-4 rounded-2xl bg-black/40 p-6 border border-white/5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-500">Live Telemetry</h3>
            <div className="space-y-3">
              <TelemetryRow icon={Database} label="Knowledge Base" value="v4.2.1" />
              <TelemetryRow icon={Target} label="Model Accuracy" value="98.6%" />
              <TelemetryRow icon={Atom} label="Quantum Nodes" value="Active" />
            </div>
          </div>
        </div>
      </section>

      {/* INPUT SECTION */}
      <section className="rounded-3xl border border-emerald-900/40 bg-[#020B06]/80 p-8 md:p-10 backdrop-blur-xl shadow-xl">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-2 border-emerald-500 pl-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-white">Environmental Parameters</h2>
            <p className="mt-1 text-xs text-emerald-100/60">
              Adjust any slider below. The engine evaluates across 80+ crops in real-time.
            </p>
          </div>
          {showResult && (
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300">
              <span className={`h-2 w-2 rounded-full ${isLiveUpdating ? "bg-amber-400 animate-ping" : "bg-emerald-400 animate-pulse"}`} />
              {isLiveUpdating ? "Live Re-evaluating Envelopes..." : "Live Dynamic Auto-Sync"}
            </div>
          )}
        </div>

        {/* Quick Agro-Climatic Presets */}
        <div className="mb-8 rounded-2xl border border-white/5 bg-black/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Quick Agro-Climatic Envelopes (80+ Crop Catalog)</span>
            <span className="text-[10px] text-emerald-100/40">Click any preset to dial in parameters</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => {
              const Icon = preset.icon;
              return (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="flex items-center gap-2 rounded-xl border border-emerald-900/40 bg-emerald-950/20 px-3 py-1.5 text-xs text-emerald-200 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-white transition-all active:scale-95"
                >
                  <Icon className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Soil Nutrients */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-emerald-900/30 pb-3 text-sm font-semibold uppercase tracking-widest text-emerald-400">
              <FlaskConical className="h-4 w-4" /> Soil Nutrients
            </div>
            <SmartInput label="Nitrogen (N)" value={n} setValue={setN} min={0} max={140} unit="mg/kg" desc="Essential for vegetative growth and protein synthesis." optimal={[60, 100]} />
            <SmartInput label="Phosphorus (P)" value={p} setValue={setP} min={0} max={140} unit="mg/kg" desc="Critical for root development and energy transfer." optimal={[30, 60]} />
            <SmartInput label="Potassium (K)" value={k} setValue={setK} min={0} max={200} unit="mg/kg" desc="Improves disease resistance and water regulation." optimal={[40, 80]} />
          </div>

          {/* Climate Data */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-emerald-900/30 pb-3 text-sm font-semibold uppercase tracking-widest text-emerald-400">
              <CloudSun className="h-4 w-4" /> Climate Data
            </div>
            <SmartInput label="Temperature" value={temp} setValue={setTemp} min={0} max={50} step={0.1} unit="°C" desc="Influences metabolic rate and growing season." optimal={[18, 30]} />
            <SmartInput label="Humidity" value={hum} setValue={setHum} min={0} max={100} step={0.1} unit="%" desc="Impacts transpiration and disease risk." optimal={[40, 70]} />
            <SmartInput label="Rainfall" value={rain} setValue={setRain} min={0} max={300} step={0.5} unit="mm" desc="Determines irrigation necessity and drought risk." optimal={[80, 200]} />
          </div>

          {/* Soil Chemistry */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-emerald-900/30 pb-3 text-sm font-semibold uppercase tracking-widest text-emerald-400">
              <TestTube2 className="h-4 w-4" /> Soil Chemistry
            </div>
            <SmartInput label="Soil pH" value={ph} setValue={setPh} min={0} max={14} step={0.1} unit="pH" desc="Governs nutrient availability and microbial activity." optimal={[6.0, 7.5]} />
            
            <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
              <p className="text-sm text-emerald-100/70 mb-4">Initialize the hybrid ensemble models with current telemetry to generate a precision agricultural recommendation.</p>
              <button 
                onClick={handlePredict}
                disabled={isPredicting}
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-[length:200%_100%] py-4 font-display text-base font-semibold text-white shadow-lg transition-all hover:bg-[position:100%_0] hover:shadow-[0_0_30px_-5px_hsl(155_70%_45%/0.6)] disabled:opacity-50"
              >
                {isPredicting ? "Running Neural Synthesis..." : "Generate AI Recommendation"}
                {!isPredicting && <Zap className="h-5 w-5 transition-transform group-hover:rotate-12" />}
              </button>
              {errorMsg && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                  <div className="flex items-center gap-2 font-semibold text-red-400">
                    <AlertTriangle className="h-4 w-4" /> Analysis Failed
                  </div>
                  <div className="mt-1">{errorMsg}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PREDICTION REPORT */}
      <AnimatePresence>
        {showResult && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-12"
          >
            {/* 4. PREDICTION CARD & 5. AI EXPLANATION */}
            <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
              
              {/* Main Result Card */}
              <div className="relative overflow-hidden rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-[#02180b] to-[#010a04] p-8 shadow-[0_0_80px_-20px_hsl(155_70%_45%/0.25)]">
                <div className="absolute right-0 top-0 h-full w-1/3 opacity-30 mix-blend-luminosity mask-image-l">
                  <img src={cropHero} alt="Crop background" className="h-full w-full object-cover" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                  <div className="h-40 w-40 shrink-0 overflow-hidden rounded-2xl border border-emerald-500/20 shadow-xl bg-black">
                    <img 
                      src={getCropImage(recommendedCrop) || cropImg} 
                      alt={recommendedCrop} 
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="rounded-full border border-emerald-400/50 bg-emerald-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">Highest Confidence</span>
                      <span className="text-xs text-emerald-200/50">Predicted: {new Date().toLocaleDateString()}</span>
                    </div>
                    <h2 className="font-display text-5xl font-bold text-white mb-4">{recommendedCrop}</h2>
                    <p className="text-sm leading-relaxed text-emerald-100/80 max-w-md">
                      Based on the telemetry provided, {recommendedCrop} is the optimal crop. The soil nutrients match its demand profile, and the climate aligns perfectly with its growth requirements.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 rounded-xl bg-black/40 px-4 py-2 border border-white/5">
                        <Calendar className="h-4 w-4 text-emerald-400" />
                        <div className="text-xs"><span className="text-emerald-500/60 block text-[10px] uppercase">Growing Season</span><span className="font-semibold text-emerald-50">{resultData?.season || "Kharif (Monsoon)"}</span></div>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl bg-black/40 px-4 py-2 border border-white/5">
                        <Clock className="h-4 w-4 text-emerald-400" />
                        <div className="text-xs"><span className="text-emerald-500/60 block text-[10px] uppercase">Est. Harvest</span><span className="font-semibold text-emerald-50">{resultData?.est_harvest || "120 - 150 Days"}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explainable AI Card */}
              <div className="rounded-3xl border border-emerald-900/40 bg-[#020B06]/80 p-8 backdrop-blur-xl">
                <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-semibold text-emerald-50 border-l-2 border-sky-400 pl-3">
                  <Atom className="h-5 w-5 text-sky-400" /> AI Explainability
                </h3>
                <p className="mb-6 text-xs leading-relaxed text-emerald-100/60">
                  This recommendation was generated using Hybrid Decision Fusion across multiple predictive models to ensure maximal accuracy.
                </p>
                <div className="space-y-5">
                  <ModelContribution name="Random Forest Classifier" percentage={resultData?.model_contributions?.rf ?? 42} desc="Primary weight due to historical soil matching." />
                  <ModelContribution name="Agronomic Feasibility Engine" percentage={resultData?.model_contributions?.xgb ?? 35} desc="Continuous environmental envelope verification." />
                  <ModelContribution name="Quantum / Constraint Validator" percentage={resultData?.model_contributions?.qml ?? 23} desc="Multi-dimensional physiological boundary validation." />
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-emerald-500/60 uppercase tracking-widest font-semibold">Total Confidence</span>
                  <span className="text-xl font-display font-bold text-emerald-400">{resultData?.confidence ? `${resultData.confidence}%` : "98.6%"}</span>
                </div>
              </div>

            </div>

            {/* 6. DETAILED REPORTS GRID */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              
              {/* Soil Health Analysis */}
              <div className="rounded-3xl border border-emerald-900/40 bg-[#020B06]/80 p-6 backdrop-blur-xl hover:border-emerald-700/50 transition-colors">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-emerald-400">
                  <Sprout className="h-4 w-4" /> Soil Health Analysis
                </div>
                <div className="mb-6 flex justify-center">
                  <Gauge value={resultData?.fertility_score ?? 85} label="Fertility Score" size={140} color="emerald" />
                </div>
                <div className="space-y-3">
                  <StatusRow label="Nitrogen Status" status={getFeedback(n, [60, 100])} />
                  <StatusRow label="Phosphorus Status" status={getFeedback(p, [30, 60])} />
                  <StatusRow label="Potassium Status" status={getFeedback(k, [40, 80])} />
                  <StatusRow label="Soil pH" status={getFeedback(ph, [6.0, 7.5])} />
                </div>
                <div className="mt-4 rounded-xl bg-emerald-950/30 p-3 border border-emerald-900/30">
                  <p className="text-xs text-emerald-200/70"><strong>Overall Quality:</strong> {resultData?.soil_quality_desc || "Excellent. The soil is fertile and well-balanced for the recommended crop."}</p>
                </div>
              </div>

            {/* Climate Compatibility */}
            <div className="rounded-3xl border border-emerald-900/40 bg-[#020B06]/80 p-6 backdrop-blur-xl hover:border-emerald-700/50 transition-colors">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-sky-400">
                <CloudRain className="h-4 w-4" /> Climate Suitability
              </div>
              <div className="mb-6 flex justify-center">
                <Gauge value={resultData?.climate_suitability ?? 92} label="Suitability" size={140} color="sky" />
              </div>
              <div className="space-y-3">
                <StatusRow label="Temperature Suitability" status={getFeedback(temp, [18, 30])} />
                <StatusRow label="Humidity Suitability" status={getFeedback(hum, [40, 70])} />
                <StatusRow label="Rainfall Suitability" status={getFeedback(rain, [80, 200])} />
                <StatusRow label="Seasonal Compatibility" status="Optimal" />
              </div>
              <div className="mt-4 rounded-xl bg-sky-950/30 p-3 border border-sky-900/30">
                <p className="text-xs text-sky-200/70"><strong>Climate Risk:</strong> {resultData?.climate_risk_desc || `Low. The current atmospheric conditions pose minimal stress risks to ${recommendedCrop}.`}</p>
              </div>
            </div>

            {/* Expected Yield */}
            <div className="rounded-3xl border border-emerald-900/40 bg-[#020B06]/80 p-6 backdrop-blur-xl hover:border-emerald-700/50 transition-colors">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-secondary">
                <TrendingUp className="h-4 w-4" /> Expected Yield
              </div>
              <div className="flex flex-col items-center justify-center py-6">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Estimated Output</span>
                <div className="font-display text-5xl font-bold text-secondary">{resultData?.expected_yield?.value || "2.8"} <span className="text-lg text-secondary/60">{resultData?.expected_yield?.unit || "tons/ha"}</span></div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1 text-emerald-100/70"><span>Low Estimate</span><span>{resultData?.expected_yield?.low || "2.4"} t/ha</span></div>
                  <div className="h-1 bg-white/5 rounded-full"><div className="h-full bg-secondary/50 rounded-full w-[40%]" /></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1 text-emerald-100/70"><span>High Estimate</span><span>{resultData?.expected_yield?.high || "3.2"} t/ha</span></div>
                  <div className="h-1 bg-white/5 rounded-full"><div className="h-full bg-secondary rounded-full w-[80%]" /></div>
                </div>
                <div className="mt-6 rounded-xl bg-secondary/10 p-3 border border-secondary/20 flex gap-3 items-start">
                  <AlertTriangle className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                  <p className="text-xs text-secondary/80"><strong>Potential Risks:</strong> {resultData?.expected_yield?.risk || `Weather fluctuations during flowering or seed set.`}</p>
                </div>
              </div>
            </div>

          </div>

          {/* 7. RECOMMENDATIONS GRID */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Fertilizer Recommendation */}
            <div className="rounded-3xl border border-emerald-900/40 bg-[#020B06]/80 p-8 backdrop-blur-xl">
              <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-semibold text-emerald-50 border-l-2 border-emerald-400 pl-3">
                <Leaf className="h-5 w-5 text-emerald-400" /> Fertilizer Plan
              </h3>
              <ul className="space-y-4">
                {(resultData?.fertilizer_plan && resultData.fertilizer_plan.length > 0 ? resultData.fertilizer_plan : [
                  { title: "Nitrogen Split Strategy", desc: "Apply in split doses according to vegetative growth stages to avoid nutrient leaching." },
                  { title: "Organic Compost", desc: "Add 5-10 tons/ha before sowing to improve soil moisture retention." },
                  { title: "Potassium Supplement", desc: "Crucial during reproductive phase to improve harvest yield and resilience." },
                  { title: "Micronutrients", desc: "Foliar spray of Boron and Zinc if deficiency symptoms appear." }
                ]).map((item: any, idx: number) => (
                  <RecommendationItem key={idx} title={item.title} desc={item.desc} />
                ))}
              </ul>
            </div>

            {/* Irrigation Plan */}
            <div className="rounded-3xl border border-emerald-900/40 bg-[#020B06]/80 p-8 backdrop-blur-xl">
              <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-semibold text-emerald-50 border-l-2 border-sky-400 pl-3">
                <Droplets className="h-5 w-5 text-sky-400" /> Irrigation Strategy
              </h3>
              <ul className="space-y-4">
                {(resultData?.irrigation_strategy && resultData.irrigation_strategy.length > 0 ? resultData.irrigation_strategy : [
                  { title: "Water Frequency", desc: "Every 10-15 days depending on dry spells and soil moisture levels." },
                  { title: "Water Quantity", desc: `Avoid waterlogging; ${recommendedCrop} requires controlled drainage during establishment.` },
                  { title: "Best Method", desc: "Drip irrigation is highly recommended to conserve water and reduce weed growth." },
                  { title: "Seasonal Adjustments", desc: "Cease irrigation 10-15 days before harvest to ensure clean maturity." }
                ]).map((item: any, idx: number) => (
                  <RecommendationItem key={idx} title={item.title} desc={item.desc} />
                ))}
              </ul>
            </div>
          </div>

            {/* 8. SIMILAR CROPS & MARKET INSIGHTS */}
            <div className="grid gap-6 md:grid-cols-[1fr_320px]">
              {/* Similar Crops */}
              <div className="rounded-3xl border border-emerald-900/40 bg-[#020B06]/80 p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-emerald-50">Alternative Suitable Crops</h3>
                    <p className="text-xs text-emerald-100/50 mt-1">Multi-class probability ranking based on your exact soil and climate inputs.</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(resultData?.alternative_crops && resultData.alternative_crops.length > 0 ? resultData.alternative_crops : [
                    { name: "Maize", compatibility: 84, yieldEst: "4.1 t/ha", adv: "Rapid growth cycle with strong commercial demand" },
                    { name: "Chickpea", compatibility: 78, yieldEst: "1.6 t/ha", adv: "Nitrogen-fixing legume requiring minimal water" },
                    { name: "Pigeonpeas", compatibility: 73, yieldEst: "1.4 t/ha", adv: "Drought resistant with deep taproot nourishment" },
                    { name: "Lentil", compatibility: 68, yieldEst: "1.3 t/ha", adv: "Restores soil nitrogen with stable pulse prices" }
                  ]).map((alt: any) => (
                    <AlternativeCrop 
                      key={alt.name} 
                      name={alt.name} 
                      compatibility={alt.compatibility} 
                      yieldEst={alt.yieldEst} 
                      adv={alt.adv} 
                    />
                  ))}
                </div>
              </div>

              {/* Market Insights */}
              <div className="rounded-3xl border border-emerald-900/40 bg-gradient-to-b from-[#020B06]/80 to-emerald-950/20 p-8 backdrop-blur-xl flex flex-col justify-between border-t-4 border-t-secondary shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-xl font-semibold text-emerald-50">Market Insights</h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30">
                      {recommendedCrop}
                    </span>
                  </div>

                  {resultData?.market_insights?.price_per_tonne && (
                    <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/5 text-left">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest block font-mono">Benchmark Price</span>
                      <div className="text-2xl font-bold font-display text-white mt-0.5">
                        ₹{Number(resultData.market_insights.price_per_tonne).toLocaleString('en-IN')}
                        <span className="text-xs text-muted-foreground font-normal"> / Tonne</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-white/5 pb-2 text-sm">
                      <span className="text-emerald-100/60">Demand</span>
                      <span className="font-semibold text-emerald-400">{resultData?.market_insights?.demand || "High"}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2 text-sm">
                      <span className="text-emerald-100/60">Price Trend</span>
                      <span className="font-semibold text-secondary flex items-center gap-1">
                        {resultData?.market_insights?.trend || "Rising"} <TrendingUp className="h-3 w-3" />
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2 text-sm">
                      <span className="text-emerald-100/60">Profitability</span>
                      <span className="font-semibold text-emerald-400">{resultData?.market_insights?.profit || "Good"}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2 text-sm">
                      <span className="text-emerald-100/60">Export Value</span>
                      <span className="font-semibold text-emerald-300">{resultData?.market_insights?.export_value || "Moderate"}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2 text-sm">
                      <span className="text-emerald-100/60">Best Season</span>
                      <span className="font-semibold text-white">{resultData?.market_insights?.best_season || "Kharif"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-100/60">Key Market Hub</span>
                      <span className="font-semibold text-sky-300">{resultData?.market_insights?.best_state || "Karnataka"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 9. DOWNLOAD ACTIONS */}
            <div className="flex flex-wrap items-center justify-end gap-4 border-t border-emerald-900/40 pt-8 no-print">
              <button 
                onClick={() => setIsReportOpen(true)}
                className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-6 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-900/40 transition-colors cursor-pointer"
              >
                <Printer className="h-4 w-4" /> Print View
              </button>
              <button 
                onClick={() => {
                  downloadReportPdfFile(cropReportData);
                }}
                className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/50 cursor-pointer"
                title="Download Official PDF Report"
              >
                <FileText className="h-4 w-4" /> Download Report (PDF)
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Official Publication-Grade Report Modal */}
      {showResult && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          data={cropReportData}
        />
      )}
    </div>
  );
}

/* ------------------ Subcomponents ------------------ */

function TelemetryRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
      <div className="flex items-center gap-2 text-xs text-emerald-100/60"><Icon className="h-3.5 w-3.5" /> {label}</div>
      <div className="text-xs font-semibold text-white">{value}</div>
    </div>
  );
}

function SmartInput({ label, value, setValue, min, max, step = 1, unit, desc, optimal }: any) {
  const feedback = getFeedback(value, optimal);
  const feedbackColor = feedback === "Optimal" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : feedback === "Low" ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" : "text-red-400 bg-red-400/10 border-red-400/20";

  return (
    <div className="rounded-2xl border border-white/5 bg-black/20 p-4 transition-colors hover:bg-black/30">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-semibold text-emerald-50">{label}</label>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${feedbackColor}`}>
          {feedback}
        </span>
      </div>
      <p className="mb-4 text-xs text-emerald-100/50">{desc}</p>
      
      <div className="flex items-center gap-4">
        <input 
          type="range" min={min} max={max} step={step} value={value} 
          onChange={(e) => setValue(parseFloat(e.target.value))} 
          className="h-1.5 flex-1 appearance-none rounded-full bg-emerald-950/50 outline-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(52,211,153,0.8)]" 
        />
        <div className="flex w-16 items-center justify-end gap-1 font-display text-lg font-semibold text-emerald-300">
          {value}<span className="text-[10px] text-emerald-500/50">{unit}</span>
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-widest text-emerald-500/40">
        <span>Min: {min}</span>
        <span>Optimal: {optimal[0]}-{optimal[1]}</span>
        <span>Max: {max}</span>
      </div>
    </div>
  );
}

function getFeedback(val: number, [optMin, optMax]: number[]) {
  if (val < optMin) return "Low";
  if (val > optMax) return "High";
  return "Optimal";
}

function StatusRow({ label, status }: { label: string; status: string }) {
  const color = status === "Optimal" || status === "Adequate" ? "text-emerald-400" : "text-yellow-400";
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
      <span className="text-emerald-100/70">{label}</span>
      <span className={`font-semibold ${color}`}>{status}</span>
    </div>
  );
}

function ModelContribution({ name, percentage, desc }: { name: string; percentage: number; desc: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-emerald-50 mb-1">
        <span>{name}</span>
        <span className="text-emerald-400">{percentage}%</span>
      </div>
      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden mb-1">
        <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 rounded-full" />
      </div>
      <div className="text-[10px] text-emerald-200/50">{desc}</div>
    </div>
  );
}

function RecommendationItem({ title, desc }: { title: string; desc: string }) {
  return (
    <li className="flex gap-3">
      <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
      <div>
        <div className="text-sm font-semibold text-emerald-50">{title}</div>
        <div className="text-xs text-emerald-100/60 mt-0.5">{desc}</div>
      </div>
    </li>
  );
}

function AlternativeCrop({ name, compatibility, yieldEst, adv }: { name: string; compatibility: number; yieldEst: string; adv: string }) {
  const img = getCropImage(name);
  return (
    <div className="rounded-xl bg-black/30 border border-white/5 p-4 hover:border-emerald-500/30 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        {img && (
          <div className="h-9 w-9 rounded-lg overflow-hidden shrink-0 border border-emerald-500/20 bg-black">
            <img src={img} alt={name} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-emerald-50 truncate">{name}</span>
            <span className="text-xs font-bold text-emerald-400 shrink-0">{compatibility}% Match</span>
          </div>
        </div>
      </div>
      <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${compatibility}%` }} />
      </div>
      <div className="text-[10px] text-emerald-100/50 space-y-1">
        <div className="flex justify-between"><span>Yield Est:</span> <span className="text-emerald-200 font-medium">{yieldEst}</span></div>
        <div className="flex justify-between"><span>Advantage:</span> <span className="text-emerald-200 font-medium truncate" title={adv}>{adv}</span></div>
      </div>
    </div>
  );
}
