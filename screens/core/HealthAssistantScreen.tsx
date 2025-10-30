// src/screens/core/HealthAssistantScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
  LayoutAnimation,
  UIManager,
  Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import { AnswerMap, Question } from "../../types/assistant";
import { Modules } from "../../data/modules";
import { TRIAGE } from "../../data/triage";
import { check } from "../../lib/logic";

// DEBUG IDENTIFIER
const TAG = "🧠 [HealthAssistantScreen]";

/* ----------------------------------------------------------------
   LOCAL ADAPTIVE Qs (no OpenAI)
------------------------------------------------------------------*/
/* ----------------------------------------------------------------
   EXPANDED TOPIC CATALOG (ArogyaAI v2.0)
   Covers 100+ domains of health for adaptive questioning.
------------------------------------------------------------------*/
export const TOPIC_KEYWORDS: Record<string, string[]> = {
  // --- GENERAL & SYSTEMIC ---
  general_weakness: ["fatigue", "tired", "weakness", "low energy", "exhausted", "sluggish"],
  dehydration: ["thirst", "dry mouth", "dark urine", "dizzy", "dehydrated"],
  weight_change: ["weight loss", "weight gain", "obesity", "underweight", "appetite change"],
  fever_infection: ["fever", "chills", "infection", "cough", "sore throat", "cold", "flu", "runny nose"],
  inflammation: ["swelling", "inflammation", "redness", "warmth", "pain", "tender"],

  // --- CARDIOVASCULAR ---
  chest_pain: ["chest pain", "pressure", "tightness", "arm pain", "jaw pain", "angina", "heart"],
  palpitations: ["palpitations", "racing heart", "irregular heartbeat", "fluttering"],
  hypertension: ["high blood pressure", "hypertension"],
  hypotension: ["low blood pressure", "faint", "dizzy", "lightheaded", "syncope"],
  edema: ["leg swelling", "ankle swelling", "fluid retention"],

  // --- RESPIRATORY ---
  shortness_breath: ["shortness of breath", "breathless", "difficulty breathing", "dyspnea"],
  cough: ["cough", "phlegm", "sputum", "mucus", "productive cough", "dry cough"],
  asthma: ["asthma", "wheeze", "inhaler", "bronchospasm"],
  pneumonia: ["pneumonia", "chest infection", "lung infection", "productive cough"],
  covid: ["covid", "coronavirus", "loss of smell", "loss of taste"],

  // --- NEUROLOGIC ---
  headache_neuro: ["headache", "migraine", "dizzy", "vertigo", "faint", "stroke", "seizure"],
  seizure: ["seizure", "convulsion", "fits", "epilepsy"],
  memory: ["memory loss", "confusion", "forget", "dementia"],
  tremor: ["tremor", "shaking", "parkinson"],
  weakness: ["paralysis", "weakness", "numbness", "tingling"],

  // --- MENTAL HEALTH ---
  anxiety_mood: ["anxiety", "panic", "depression", "sad", "worry", "stress", "ptsd"],
  insomnia: ["insomnia", "can’t sleep", "trouble sleeping", "sleep problem"],
  psychosis: ["hallucination", "delusion", "paranoid", "schizophrenia"],
  substance_use: ["alcohol", "drugs", "addiction", "smoking", "nicotine"],
  eating_disorder: ["anorexia", "bulimia", "binge eating"],

  // --- GASTROINTESTINAL ---
  abdominal_gi: ["stomach pain", "abdominal", "nausea", "vomit", "diarrhea", "constipation", "gerd"],
  liver: ["jaundice", "hepatitis", "liver", "yellow eyes", "dark urine"],
  ulcer: ["ulcer", "heartburn", "acid reflux", "epigastric pain"],
  gi_bleed: ["blood in stool", "black stool", "vomiting blood"],
  appetite: ["appetite loss", "hunger", "overeating"],

  // --- GENITOURINARY ---
  uti: ["burning urination", "urinary tract infection", "pee pain", "frequent urination"],
  kidney: ["flank pain", "kidney", "stones", "hematuria"],
  male_repro: ["testicular pain", "erectile dysfunction", "impotence", "prostate"],
  female_repro: ["period", "menstruation", "vaginal bleeding", "cramps", "pelvic pain"],
  pregnancy: ["pregnant", "pregnancy", "expecting", "prenatal", "morning sickness"],
  contraception: ["birth control", "pill", "condom", "IUD", "contraception"],

  // --- MUSCULOSKELETAL ---
  msk_pain: ["back pain", "joint pain", "knee", "shoulder", "muscle pain", "sprain", "strain"],
  arthritis: ["arthritis", "joint stiffness", "rheumatoid"],
  fracture: ["broken bone", "fracture", "injury", "fall", "accident"],
  posture: ["neck pain", "spine", "posture", "scoliosis"],

  // --- DERMATOLOGY ---
  rash_skin: ["rash", "itch", "eczema", "acne", "blister", "hives", "psoriasis", "skin infection"],
  wound: ["cut", "wound", "bruise", "bite", "scratch", "laceration"],
  hair: ["hair loss", "dandruff", "alopecia"],
  nails: ["nail discoloration", "fungus", "thick nails"],

  // --- ENDOCRINE & METABOLIC ---
  diabetes: ["diabetes", "high sugar", "glucose", "insulin", "polyuria"],
  thyroid: ["thyroid", "hypothyroid", "hyperthyroid", "goiter"],
  obesity: ["obesity", "overweight", "bmi"],
  hypoglycemia: ["low sugar", "shaky", "sweaty", "confused", "hungry"],

  // --- IMMUNE / ALLERGIC ---
  allergy: ["allergy", "sneeze", "runny nose", "pollen", "hives", "anaphylaxis"],
  autoimmune: ["autoimmune", "lupus", "ms", "rheumatoid", "inflammation"],

  // --- INFECTIOUS DISEASES ---
  travel_risk: ["travel", "malaria", "dengue", "typhoid", "trip", "abroad", "zika"],
  hiv: ["hiv", "aids", "unprotected", "needle", "sexual contact"],
  tuberculosis: ["tb", "tuberculosis", "chronic cough", "night sweat"],
  covid_long: ["long covid", "post covid fatigue", "brain fog"],

  // --- PEDIATRIC & GERIATRIC ---
  pediatrics: ["child", "baby", "infant", "toddler", "vaccination"],
  elderly: ["elderly", "senior", "old age", "fall risk", "dementia"],

  // --- EYE / EAR / NOSE / THROAT ---
  eye: ["eye pain", "red eye", "vision", "blurred", "double vision"],
  ear: ["ear pain", "hearing loss", "ringing", "tinnitus"],
  nose: ["nosebleed", "nasal congestion", "sinus"],
  throat: ["sore throat", "hoarse", "voice loss"],

  // --- DENTAL ---
  dental: ["toothache", "gum", "cavity", "bleeding gum", "wisdom tooth"],

  // --- CANCER / ONCOLOGY ---
  cancer: ["cancer", "tumor", "mass", "growth", "oncology", "lump"],
  chemotherapy: ["chemotherapy", "radiation", "oncology treatment"],

  // --- REHAB / FUNCTIONAL ---
  mobility: ["wheelchair", "mobility", "walking difficulty"],
  rehab: ["rehab", "physical therapy", "occupational therapy"],

  // --- WOMEN’S HEALTH ---
  menopause: ["hot flashes", "menopause", "irregular periods"],
  pregnancy_postpartum: ["postpartum", "delivery", "breastfeeding"],
  infertility: ["infertility", "trying to conceive"],

  // --- PREVENTIVE & LIFESTYLE ---
  vaccination: ["vaccine", "immunization", "booster", "flu shot"],
  nutrition: ["nutrition", "diet", "vitamin", "supplement", "calories"],
  exercise: ["exercise", "workout", "gym", "physical activity"],
  sleep: ["sleep", "rest", "insomnia", "snoring"],
  stress: ["stress", "burnout", "workload", "tired"],

  // --- EMERGENCY ---
  trauma: ["accident", "injury", "bleeding", "fracture", "burn", "shock"],
  poisoning: ["poison", "toxin", "chemical", "drug overdose"],
  allergic_reaction: ["anaphylaxis", "throat swelling", "difficulty breathing"],
  suicide: ["suicidal", "self harm", "kill myself"],
  stroke: ["paralysis", "slurred speech", "one sided weakness"],

  // --- ENVIRONMENTAL ---
  heatstroke: ["heat exhaustion", "heatstroke", "hot weather"],
  hypothermia: ["cold exposure", "frostbite", "shivering"],
  altitude: ["altitude sickness", "mountain", "oxygen low"],

  // --- CHRONIC CARE ---
  hypertension_followup: ["blood pressure check", "bp follow-up"],
  diabetes_followup: ["glucose log", "sugar monitoring"],
  asthma_followup: ["asthma control", "inhaler refill"],
  arthritis_followup: ["joint pain management"],
};

export const TOPIC_QUESTIONS: Record<string, string[]> = {
  // Sample of ~20 topics fully expanded. Other topics can reuse or copy patterns dynamically.
  fever_infection: [
    "Do you currently have a fever or chills?",
    "When did it start?",
    "Are you coughing or sneezing?",
    "Do you have body aches or fatigue?",
    "Any sore throat or congestion?",
    "Have you recently traveled or met sick contacts?",
    "Are you vaccinated for flu or COVID?",
  ],
  chest_pain: [
    "Describe the pain: sharp, dull, or pressure-like?",
    "Does it radiate to your arm, neck, or jaw?",
    "How long have you had it?",
    "Are you sweating or nauseous?",
    "Any shortness of breath or dizziness?",
    "Do you have history of heart or lung disease?",
    "Did it occur with exertion or at rest?",
  ],
  headache_neuro: [
    "Where is your headache located?",
    "When did it start and how severe is it?",
    "Do you have nausea or vomiting?",
    "Any vision changes, weakness, or numbness?",
    "Is this similar to prior headaches?",
    "Have you had fever, stiff neck, or trauma?",
  ],
  anxiety_mood: [
    "How often do you feel anxious or low?",
    "Do you have trouble sleeping or concentrating?",
    "Any panic attacks, nightmares, or flashbacks?",
    "Do you feel hopeless or worthless?",
    "Do you have thoughts of self-harm or suicide?",
    "Are you getting social or family support?",
  ],
  abdominal_gi: [
    "Where exactly is your abdominal pain?",
    "When did it begin and what triggers it?",
    "Do you feel nausea, vomiting, or bloating?",
    "Any change in bowel habits?",
    "Any blood in stool or vomit?",
    "Does eating worsen or relieve it?",
  ],
  msk_pain: [
    "Which joint or muscle hurts most?",
    "Did it start suddenly or after an injury?",
    "Does movement worsen the pain?",
    "Is there swelling, redness, or stiffness?",
    "Have you had fever or fatigue?",
    "Have you experienced similar pain before?",
  ],
  rash_skin: [
    "Where did the rash start?",
    "What does it look like (itchy, red, blistering)?",
    "When did you first notice it?",
    "Did you use new soaps, lotions, or meds?",
    "Has it spread or changed in color?",
    "Are you having fever, swelling, or pain?",
  ],
  shortness_breath: [
    "When did you start feeling breathless?",
    "Does it occur at rest or with exertion?",
    "Any cough, wheezing, or chest tightness?",
    "Do you have swelling in legs or feet?",
    "Have you been exposed to smoke or pollution?",
  ],
  pregnancy: [
    "Are you pregnant or suspect pregnancy?",
    "When was your last menstrual period?",
    "Any nausea, vomiting, or fatigue?",
    "Any abdominal pain or vaginal bleeding?",
    "Are you taking prenatal vitamins?",
    "Have you had prior pregnancies or complications?",
  ],
  diabetes: [
    "Are you diagnosed with diabetes?",
    "How are your sugar readings recently?",
    "Any excessive thirst or urination?",
    "Any dizziness or blurry vision?",
    "Are you taking insulin or tablets regularly?",
  ],
  trauma: [
    "What type of injury occurred?",
    "When did it happen?",
    "Where are you hurt?",
    "Are you bleeding or have deformity?",
    "Did you lose consciousness or memory?",
    "Have you received first aid?",
  ],
  allergy: [
    "What are you allergic to?",
    "When was your last allergic reaction?",
    "Did you experience swelling or shortness of breath?",
    "Do you carry an epinephrine pen?",
    "Have you taken antihistamines recently?",
  ],
  uti: [
    "Do you have pain or burning while urinating?",
    "Any frequent urge to urinate?",
    "Is the urine cloudy or foul-smelling?",
    "Any blood in urine or flank pain?",
    "Do you have fever or chills?",
  ],
  thyroid: [
    "Do you feel unusually tired or energetic?",
    "Any changes in weight or appetite?",
    "Any neck swelling or discomfort?",
    "Do you feel cold or hot intolerance?",
    "Have you had thyroid tests done before?",
  ],
  pediatrics: [
    "What is the child's age?",
    "Are they feeding and sleeping normally?",
    "Any fever, rash, or cough?",
    "Any vomiting or diarrhea?",
    "Are immunizations up to date?",
  ],
  elderly: [
    "What is the person’s age and mobility status?",
    "Any recent falls or confusion?",
    "Are they eating and drinking well?",
    "Any chronic diseases like diabetes or heart problems?",
    "Are medications being taken as prescribed?",
  ],
  cancer: [
    "What type of cancer are you concerned about?",
    "Have you noticed a lump, pain, or bleeding?",
    "Any unexplained weight loss or fatigue?",
    "Are you undergoing chemo or radiation?",
    "When was your last oncology follow-up?",
  ],
  covid_long: [
    "When did you have COVID-19 infection?",
    "Do you still have fatigue, cough, or brain fog?",
    "Any chest pain or palpitations?",
    "Have you returned to work or school?",
    "Do you exercise regularly now?",
  ],
  nutrition: [
    "Describe your daily diet.",
    "Do you eat fruits and vegetables?",
    "Do you take supplements or vitamins?",
    "Any recent weight changes?",
    "Do you drink enough water daily?",
  ],
  exercise: [
    "How often do you exercise per week?",
    "What type of physical activity do you do?",
    "Any injuries during workouts?",
    "Do you stretch or warm up?",
    "Do you feel fatigued after exercise?",
  ],
};
const DEFAULT_TOPIC = "fever_infection";

/* ---------------------- HELPERS ---------------------- */
function classifyTopic(text: string) {
  if (!text || text.trim().length === 0) return DEFAULT_TOPIC;
  let best = DEFAULT_TOPIC;
  let bestScore = 0;
  for (const [topic, kws] of Object.entries(TOPIC_KEYWORDS)) {
    const score = kws.reduce((acc, kw) => (text.includes(kw) ? acc + 1 : acc), 0);
    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  }
  console.log(TAG, "classifyTopic()", { text, best });
  return best;
}

function scoreAnswers(a: AnswerMap, topic: string) {
  const sev = Math.min(10, Math.max(0, Number(a.concern_severity ?? 0))) / 10;
  const age = Number(a.age ?? 30);

  let risk = sev * 0.5; // base risk from severity slider

  //  Factor in age
  if (age >= 65) risk += 0.15;
  else if (age >= 45) risk += 0.08;

  //  Factor in dangerous “yes” answers or red flag keywords
  const followupKeys = Object.keys(a).filter(k => k.includes(topic + "_q"));
  const redFlags = ["yes", "severe", "chest", "blood", "short", "faint", "dizzy", "rash", "suicide"];

  let redFlagCount = 0;
  followupKeys.forEach(k => {
    const val = String(a[k] ?? "").toLowerCase();
    redFlags.forEach(flag => {
      if (val.includes(flag)) redFlagCount++;
    });
  });

  // Weight red flags (max 0.5 risk added)
  const redFlagFactor = Math.min(0.5, redFlagCount * 0.2);
  risk += redFlagFactor;

  //  Topic-specific logic (example)
  if (topic === "chest_pain" && redFlagCount >= 3) risk = Math.max(risk, 0.9);
  if (topic === "anxiety_mood" && valIncludes(a, "suicidal")) risk = 1.0;

  // Clamp
  risk = Math.min(1, Math.max(0, risk));

  const triage =
    risk >= 0.8 ? "EMERGENCY" :
    risk >= 0.45 ? "URGENT" :
    "ROUTINE";

  console.log(TAG, "scoreAnswers()", { age, sev, redFlagCount, risk, triage });
  return { risk, triage };
}

// Helper: check if any answer text includes a keyword
function valIncludes(a: AnswerMap, keyword: string) {
  return Object.values(a).some(v => String(v).toLowerCase().includes(keyword));
}

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental)
  UIManager.setLayoutAnimationEnabledExperimental(true);

/* ---------------- PROGRESS BAR ---------------- */
const ProgressBar = ({ progress }: { progress: number }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(widthAnim, { toValue: progress, duration: 350, useNativeDriver: false }).start();
  }, [progress]);
  return (
    <View style={s.progressBarBg}>
      <Animated.View style={[s.progressBarFill, { flex: widthAnim }]} />
      <View style={{ flex: 1 - progress }} />
    </View>
  );
};

/* ---------------- MAIN SCREEN ---------------- */
export default function HealthAssistantScreen({ navigation }: any) {
  const route = useRoute<any>();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [order, setOrder] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  console.log(TAG, "render()", { hydrated, idx, answersKeys: Object.keys(answers), orderLen: order.length });
  const progress = useMemo(() => (order.length ? (idx + 1) / order.length : 0), [order, idx]);

  /* ---------- LOAD SAVED ---------- */
  useEffect(() => {
    (async () => {
      console.log(TAG, "loading AsyncStorage...");
      try {
        const saved = await AsyncStorage.getItem("assistant_state_v2");
        if (saved) {
          const parsed = JSON.parse(saved);
          console.log(TAG, "found saved state", parsed);
          setAnswers(parsed.answers || {});
          setIdx(parsed.idx || 0);
          setOrder(buildOrder(parsed.answers || {}));
        } else {
          console.log(TAG, "no saved state, using defaults");
          setOrder(buildOrder({}));
        }
      } catch (err) {
        console.error(TAG, "load error", err);
      }
      setHydrated(true);
    })();
  }, []);

  /* ---------- PERSIST ---------- */
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem("assistant_state_v2", JSON.stringify({ answers, idx }))
      .then(() => console.log(TAG, "saved state", { answers, idx }))
      .catch((err) => console.error(TAG, "save error", err));
  }, [answers, idx, hydrated]);

  /* ---------- AUTO-DETECT TOPIC ---------- */
  useEffect(() => {
    if (!hydrated) return;
    const chiefTxt = String(answers.chief ?? "").toLowerCase().trim();
    if (!chiefTxt) return;
    const topic = classifyTopic(chiefTxt);
    if (answers.detected_topic !== topic) {
      console.log(TAG, "detected topic change", { from: answers.detected_topic, to: topic });
      setAnswers((prev) => ({ ...prev, detected_topic: topic }));
    }
  }, [answers.chief, hydrated]);

  /* ---------- BUILD ORDER ---------- */
  function buildOrder(a: AnswerMap): Question[] {
    console.log(TAG, "buildOrder()", { a });
    const baseQs: Question[] = [
      { id: "age", type: "number", prompt: "How old are you?", required: true },
      {
        id: "sex",
        type: "choice",
        prompt: "What is your biological sex?",
        required: true,
        choices: [
          { label: "Female", value: "female" },
          { label: "Male", value: "male" },
          { label: "Intersex / Prefer not to say", value: "other" },
        ],
      },
      { id: "concern_severity", type: "number", prompt: "How concerning does this feel (1–10)?", required: true },
      { id: "chief", type: "text", prompt: "Briefly describe your main symptom or concern.", required: true },
    ];

    const chiefTxt = String(a.chief ?? "").toLowerCase();
    const topic = classifyTopic(chiefTxt);
    console.log(TAG, "topic chosen", topic);

    if (chiefTxt.trim().length > 0) {
      const prompts = TOPIC_QUESTIONS[topic] ?? TOPIC_QUESTIONS[DEFAULT_TOPIC];
      const followups = prompts.slice(1, 7);
      followups.forEach((p, i) => {
        baseQs.push({ id: `${topic}_q${i + 1}`, type: "text", prompt: p, required: true });
      });
    }

    console.log(TAG, "final order length", baseQs.length);
    return baseQs.slice(0, 10);
  }

  /* ---------- UPDATE ANSWER ---------- */
  const updateAnswer = (qid: string, value: any) => {
    console.log(TAG, "updateAnswer()", { qid, value });
    LayoutAnimation.easeInEaseOut();
    const next = { ...answers, [qid]: value };
    setAnswers(next);

    if (["age", "sex", "concern_severity", "chief"].includes(qid)) {
      console.log(TAG, "core question updated, rebuilding order...");
      setTimeout(() => {
        const newOrder = buildOrder(next);
        console.log(TAG, "new order built", newOrder.map((q) => q.id));
        setOrder(newOrder);
        setIdx((i) => Math.min(i, newOrder.length - 1));
      }, 0);
    }
  };

  const current = order[idx];

  // ✅ Check hydration
  if (!hydrated) {
    console.log(TAG, "not hydrated yet → showing splash");
    return (
      <SafeAreaView style={s.container}>
        <Text style={{ textAlign: "center", marginTop: 40, color: "#555" }}>Initializing ArogyaAI...</Text>
      </SafeAreaView>
    );
  }

  // ✅ Check missing questions
  if (!current) {
    console.warn(TAG, "no current question found");
    return (
      <SafeAreaView style={s.container}>
        <Text style={{ textAlign: "center", marginTop: 40, color: "#555" }}>Loading your questions...</Text>
      </SafeAreaView>
    );
  }

  /* ---------- NEXT & BACK ---------- */
  const nextQ = () => {
    console.log(TAG, "nextQ()");
    if (current.required) {
      const v = answers[current.id];
      if (!v || (typeof v === "string" && v.trim().length === 0)) {
        Alert.alert("Missing answer", "Please answer to continue.");
        return;
      }
    }
    let i = idx + 1;
    if (i < order.length) setIdx(i);
    else finish();
  };

  const back = () => {
    console.log(TAG, "back()");
    setIdx((i) => Math.max(0, i - 1));
  };

  /* ---------- FINISH ---------- */
  function finish() {
    console.log(TAG, "finish()");
    const topic = answers.detected_topic || DEFAULT_TOPIC;
    const { risk, triage } = scoreAnswers(answers, topic);
    const plan = {
      triage,
      triage_message:
        triage === "EMERGENCY"
          ? "⚠️ Potential red flags detected. Seek emergency care now."
          : triage === "URGENT"
          ? "We recommend urgent evaluation within 24 hours."
          : "✅ No emergencies detected. Monitor symptoms and follow advice.",
      risk_score: risk,
      topic,
    };
    navigation.navigate("AssistantSummary", { responses: answers, plan });
  }

  console.log(TAG, "progress:", progress);

  /* ---------- RENDER ---------- */
  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        <Text style={s.header}>ArogyaAI Health Assistant</Text>
        <ProgressBar progress={progress} />
        <View style={s.card}>
          <Text style={s.prompt}>{current.prompt}</Text>
          {answers.detected_topic && (
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Why these questions?",
                  `Detected topic: ${answers.detected_topic.replace(/_/g, " ").toUpperCase()}`
                )
              }
            >
              <Text style={s.whyLink}>ℹ️ Why these questions?</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={s.card}>
          <InputRenderer q={current} value={answers[current.id]} onChange={(v) => updateAnswer(current.id, v)} />
        </View>
        <Text style={s.progressTxt}>
          {idx + 1} / {order.length}
        </Text>
      </ScrollView>

      {/* ✅ Move Footer OUTSIDE the ScrollView */}
      <View style={s.footer}>
        {/* Left: Back or Home */}
        <TouchableOpacity
          style={[s.btn, s.btnGhost]}
          onPress={() => {
            if (idx === 0) {
              try {
                // ✅ Normal navigation back to Home tab
                navigation.navigate("Main", { screen: "Home" });
              } catch (e) {
                console.warn("Fallback navigation triggered:", e);
                // ✅ Fallback if Main isn’t mounted yet
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: "Main",
                      state: { routes: [{ name: "Home" }] },
                    },
                  ],
                });
              }
            } else {
              setIdx((i) => Math.max(0, i - 1));
            }
          }}
        >
          <Ionicons
            name={idx === 0 ? "home" : "chevron-back"}
            size={18}
            color="#1f4ab8"
          />
          <Text style={s.btnGhostTxt}>
            {idx === 0 ? "Home" : "Back"}
          </Text>
        </TouchableOpacity>

        {/* Right: Next or Finish */}
        <TouchableOpacity style={[s.btn, s.btnPrimary]} onPress={nextQ}>
          <Text style={s.btnPrimaryTxt}>
            {idx === order.length - 1 ? "Finish" : "Next"}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ---------------- INPUT RENDERER ---------------- */
function InputRenderer({ q, value, onChange }: { q: Question; value: any; onChange: (v: any) => void }) {
  console.log("🧩 InputRenderer", q.id, q.type, value);
  const [t, setT] = useState(value ?? "");
  const inputRef = useRef<TextInput>(null);
  useEffect(() => {
    setT(value ?? "");
  }, [q.id]);

  if (q.type === "text" || q.type === "number") {
    return (
      <TextInput
        ref={inputRef}
        style={s.input}
        keyboardType={q.type === "number" ? "numeric" : "default"}
        placeholder={q.type === "number" ? "Enter a number" : "Type here"}
        value={String(t ?? "")}
        onChangeText={(x) => {
          setT(x);
          onChange(q.type === "number" ? Number(x) : x);
        }}
      />
    );
  }

  if (q.type === "choice") {
    return (
      <View style={s.choiceWrap}>
        {q.choices?.map((c) => {
          const sel = value === c.value;
          return (
            <TouchableOpacity key={c.value} style={[s.choice, sel && s.choiceSel]} onPress={() => onChange(c.value)}>
              <Text style={[s.choiceTxt, sel && s.choiceTxtSel]}>{c.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }
  return null;
}

/* ---------------- STYLES ---------------- */
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6fbff" },
  body: { flexGrow: 1, padding: 18, paddingBottom: 120 },
  header: { fontSize: 26, fontWeight: "900", color: "#0d47a1", marginBottom: 12, textAlign: "center" },
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: "#e4eefc", shadowColor: "#000", shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2,
  },
  prompt: { fontSize: 20, fontWeight: "800", color: "#0d47a1", marginBottom: 8 },
  whyLink: { color: "#2563eb", fontSize: 13, marginTop: 4, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#cfe1ff", borderRadius: 14, padding: 12, fontSize: 16, backgroundColor: "#f9fbff" },
  choiceWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  choice: { borderWidth: 1, borderColor: "#1f4ab8", borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: "#fff" },
  choiceSel: { backgroundColor: "#1f4ab8" },
  choiceTxt: { color: "#1f4ab8", fontWeight: "700", fontSize: 15 },
  choiceTxtSel: { color: "#fff", fontWeight: "900" },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: "#f6fbff", borderTopWidth: 1, borderTopColor: "#e6efff", flexDirection: "row", justifyContent: "space-between", gap: 12 },
  btn: { flex: 1, minHeight: 52, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  btnPrimary: { backgroundColor: "#3b6df6" },
  btnPrimaryTxt: { color: "#fff", fontWeight: "900", fontSize: 16.5 },
  btnGhost: { backgroundColor: "#eaf1ff", borderWidth: 1, borderColor: "#cfe1ff" },
  btnGhostTxt: { color: "#1f4ab8", fontWeight: "900", fontSize: 16 },
  btnGhostTxtDisabled: { opacity: 0.5 },
  progressBarBg: { height: 8, backgroundColor: "#e0e7ff", borderRadius: 4, marginBottom: 12, flexDirection: "row", overflow: "hidden" },
  progressBarFill: { backgroundColor: "#3b82f6", borderRadius: 4 },
  progressTxt: { textAlign: "center", color: "#6b7280", fontWeight: "600" },
});
