// src/data/modules.ts
import { Module } from "../types/assistant";

/* ----------------------------- GENERAL INTAKE ----------------------------- */
export const GeneralModule: Module = {
  id: "general",
  title: "General Intake",
  questions: [
    { id:"age",  prompt:"What is your age (years)?", type:"number", required:true,
      validate:v=> (v<0||v>120) ? "Please enter a valid age." : null },
    { id:"sex",  prompt:"Sex at birth?", type:"choice", required:true,
      choices:[{label:"Female",value:"female"},{label:"Male",value:"male"},{label:"Intersex/Other",value:"other"}] },
    { id:"pregnant", prompt:"Are you currently pregnant?", type:"yesno", showIf:{ eq:["sex","female"] } },
    { id:"chief", prompt:"What is your main symptom or concern? (e.g., chest pain, cough, fever, rash, anxiety…)", type:"text", required:true },
    { id:"duration", prompt:"How long has this been going on?", type:"choice", required:true,
      choices:[
        {label:"< 24 hours",value:"lt1d"},{label:"1–3 days",value:"1to3d"},
        {label:"4–7 days",value:"4to7d"},{label:"> 1 week",value:"gt1w"},
        {label:"> 1 month",value:"gt1m"}
      ]},
    { id:"severity", prompt:"How severe is it?", type:"choice", required:true,
      choices:[{label:"Mild",value:"mild"},{label:"Moderate",value:"moderate"},{label:"Severe",value:"severe"}]},
    { id:"fever", prompt:"Do you have a measured fever (≥100.4°F / 38°C)?", type:"yesno" },
    { id:"temp", prompt:"If known, what was your highest temperature (°F)?", type:"number", showIf:{ eq:["fever",true] } },
    { id:"weight_change", prompt:"Any recent weight change?", type:"choice",
      choices:[{label:"Loss",value:"loss"},{label:"Gain",value:"gain"},{label:"No change",value:"none"}]},
    { id:"sweats", prompt:"Sweats or night sweats?", type:"yesno" },
    { id:"fatigue", prompt:"Significant fatigue?", type:"yesno" },
    { id:"allergies", prompt:"Any drug/food allergies?", type:"multichoice",
      choices:[
        {label:"Penicillin",value:"pcn"},{label:"Sulfa",value:"sulfa"},
        {label:"Peanuts",value:"peanut"},{label:"Latex",value:"latex"},
        {label:"No known allergies",value:"nka"}
      ]},
    { id:"meds", prompt:"List current medications (comma separated)", type:"text" },
    { id:"conditions", prompt:"Any chronic conditions?", type:"multichoice",
      choices:[
        {label:"Diabetes",value:"dm"},{label:"High blood pressure",value:"htn"},
        {label:"Asthma/COPD",value:"airway"},{label:"Cancer / chemotherapy",value:"cancer"},
        {label:"None",value:"none"}
      ]},
  ]
};

/* ------------------------------- CHEST PAIN ------------------------------- */
export const ChestPainModule: Module = {
  id:"chest_pain",
  title:"Chest Pain",
  entryIf: { regex:["chief","chest|pressure|tightness|sternum|heart pain|angina|chest ache|chest tight"] },
  questions: [
    { id:"cp_onset", prompt:"When did the pain start?", type:"choice",
      choices:[{label:"Sudden",value:"sudden"},{label:"Gradual",value:"gradual"}] },
    { id:"cp_type", prompt:"Describe the pain", type:"choice",
      choices:[
        {label:"Pressure/tightness",value:"pressure"},
        {label:"Sharp/stabbing",value:"sharp"},
        {label:"Burning",value:"burn"}, {label:"Aching",value:"ache"}
      ]},
    { id:"cp_radiation", prompt:"Does it spread to arm, jaw, or back?", type:"yesno" },
    { id:"cp_exertion", prompt:"Worse with exertion?", type:"yesno" },
    { id:"cp_sob", prompt:"Shortness of breath?", type:"yesno" },
    { id:"cp_nausea", prompt:"Nausea or sweating?", type:"yesno" },
    { id:"cp_risk", prompt:"Any risk factors?", type:"multichoice",
      choices:[
        {label:"Smoking",value:"smoke"},{label:"High BP/cholesterol",value:"cvd"},
        {label:"Diabetes",value:"dm"},{label:"Family history (early)",value:"fh"},
        {label:"None",value:"none"}
      ]},
    { id:"palpit", prompt:"Palpitations or irregular heartbeat?", type:"yesno" }
  ]
};

/* ------------------------------ SKIN / LESION ----------------------------- */
export const SkinModule: Module = {
  id:"derm",
  title:"Skin / Lesion",
  entryIf: { regex:["chief","skin|mole|lesion|rash|spot|acne|itch"] },
  questions: [
    { id:"lesion_duration", prompt:"How long has the spot/rash been present?", type:"choice",
      choices:[{label:"< 1 week",value:"lt1w"},{label:"1–4 weeks",value:"1to4w"},{label:"> 1 month",value:"gt1m"}]},
    { id:"lesion_change", prompt:"Has it changed in size, shape, color, or bled?", type:"yesno" },
    { id:"lesion_pain",  prompt:"Is it painful or itchy?", type:"yesno" },
    { id:"lesion_systemic", prompt:"Fever or widespread rash?", type:"yesno" },
    { id:"lesion_photo", prompt:"Analyze a photo with AI now?", type:"yesno",
      next:(a)=> a["lesion_photo"] ? "__NAVIGATE_SKIN_CANCER__" : null }
  ]
};

/* -------------------------------- HEADACHE -------------------------------- */
export const HeadacheModule: Module = {
  id:"headache",
  title:"Headache",
  entryIf: { regex:["chief","headache|migraine|head pain|thunderclap"] },
  questions: [
    { id:"ha_onset", prompt:"Onset?", type:"choice",
      choices:[{label:"Sudden (worst ever)",value:"thunderclap"},{label:"Gradual",value:"gradual"}]},
    { id:"ha_pattern", prompt:"Pattern?", type:"choice",
      choices:[{label:"One-sided",value:"uni"},{label:"Both sides",value:"bi"},{label:"Behind one eye",value:"cluster"}]},
    { id:"ha_features", prompt:"Associated features", type:"multichoice",
      choices:[
        {label:"Nausea/vomiting",value:"nv"},{label:"Light/sound sensitivity",value:"photophon"},
        {label:"Aura (visual/sensory)",value:"aura"},{label:"Neck stiffness/fever",value:"meningism"}
      ]},
    { id:"ha_neuro", prompt:"Weakness, confusion, speech/vision change?", type:"yesno" },
    { id:"ha_triggers", prompt:"Triggers?", type:"multichoice",
      choices:[{label:"Stress",value:"stress"},{label:"Sleep changes",value:"sleep"},
               {label:"Foods",value:"food"},{label:"Alcohol",value:"alcohol"}]},
  ]
};

/* ----------------------------- ABDOMINAL PAIN ----------------------------- */
export const AbdominalModule: Module = {
  id:"abdo",
  title:"Abdominal Pain",
  entryIf: { regex:["chief","abdominal|stomach|belly|tummy|abd pain|nausea|vomit|diarrhea|stomach ache"] },
  questions: [
    { id:"ab_location", prompt:"Where is the pain most?", type:"choice",
      choices:[
        {label:"Right lower",value:"rlq"},{label:"Right upper",value:"ruq"},
        {label:"Left lower",value:"llq"},{label:"Left upper",value:"luq"},
        {label:"Upper center/epigastric",value:"epi"},{label:"Diffuse",value:"diffuse"}
      ]},
    { id:"ab_character", prompt:"Character?", type:"choice",
      choices:[{label:"Crampy",value:"cramp"},{label:"Burning",value:"burn"},{label:"Sharp",value:"sharp"}]},
    { id:"ab_gi", prompt:"GI symptoms", type:"multichoice",
      choices:[{label:"Vomiting",value:"vom"},{label:"Diarrhea",value:"diarr"},
               {label:"Constipation",value:"const"},{label:"Blood in stool",value:"bleed"}]},
    { id:"ab_rebound", prompt:"Severe tenderness/rebound/rigidity?", type:"yesno" },
    { id:"ab_urinary", prompt:"Urinary burning/urgency?", type:"yesno" },
    { id:"ab_food", prompt:"Worse after meals or fatty foods?", type:"yesno" },
    { id:"gerd", prompt:"Heartburn or acid reflux?", type:"yesno" },
    { id:"ibs_flags", prompt:"Chronic pattern with diarrhea/constipation and relief after stool?", type:"yesno" }
  ]
};

/* --------------------------------- INJURY --------------------------------- */
export const InjuryModule: Module = {
  id:"injury",
  title:"Injury",
  entryIf: { regex:["chief","injury|sprain|fracture|fall|twist|accident|hit|trauma|back pain"] },
  questions: [
    { id:"inj_location", prompt:"Body area?", type:"choice",
      choices:[
        {label:"Ankle/Foot",value:"ankle"},{label:"Knee",value:"knee"},{label:"Wrist/Hand",value:"wrist"},
        {label:"Shoulder/Arm",value:"shoulder"},{label:"Back",value:"back"},{label:"Head",value:"head"}
      ]},
    { id:"inj_deform", prompt:"Visible deformity or bone showing?", type:"yesno" },
    { id:"inj_weightbear", prompt:"Can you bear weight / use limb?", type:"yesno" },
    { id:"inj_numb", prompt:"Numbness/tingling or loss of pulse?", type:"yesno" },
    { id:"inj_mech", prompt:"High-energy mechanism (car crash, fall >1m)?", type:"yesno" },
    { id:"back_redflags", prompt:"Back pain with fever, numbness in saddle, new weakness, or loss of bladder/bowel control?", type:"yesno", showIf:{ eq:["inj_location","back"] } }
  ]
};

/* ------------------------------- MENTAL HEALTH ---------------------------- */
export const MentalModule: Module = {
  id:"mental",
  title:"Mental Health",
  entryIf: { regex:["chief","anxiety|depress|panic|sleep|mood|stress|ptsd|hallucination|bipolar|psychosis|mental health"] },
  questions: [
    // depression/anxiety screens
    { id:"mh_mood", prompt:"Feeling down/depressed/hopeless in last 2 weeks?", type:"yesno" },
    { id:"mh_interest", prompt:"Little interest or pleasure in doing things?", type:"yesno" },
    { id:"mh_anx", prompt:"Feeling nervous/anxious/on edge frequently?", type:"yesno" },
    { id:"mh_control", prompt:"Not being able to stop or control worrying?", type:"yesno" },

    // serious mental illness flags
    { id:"mh_mania", prompt:"Periods of abnormally high energy with little sleep (possible mania)?", type:"yesno" },
    { id:"mh_psychosis", prompt:"Hallucinations or delusions?", type:"yesno" },
    { id:"mh_ptsd", prompt:"Trauma memories/nightmares with avoidance and hyperarousal?", type:"yesno" },

    // safety
    { id:"mh_safety", prompt:"Any thoughts of self-harm or harming others?", type:"yesno" },
    { id:"insomnia", prompt:"Trouble falling or staying asleep?", type:"yesno" }
  ]
};

/* ------------------------------- WOMEN’S HEALTH --------------------------- */
export const WomenModule: Module = {
  id:"women",
  title:"Women’s Health",
  entryIf: { allOf:["sex"] },
  questions: [
    { id:"wh_lmp", prompt:"Date of last menstrual period (approx)?", type:"text", showIf:{ eq:["sex","female"] } },
    { id:"wh_preg_sx", prompt:"Pregnancy symptoms (missed period, nausea)?", type:"yesno", showIf:{ eq:["sex","female"] } },
    { id:"wh_uti", prompt:"Urinary burning/urgency/frequency?", type:"yesno", showIf:{ eq:["sex","female"] } },
    { id:"wh_vagbleed", prompt:"Vaginal bleeding (unexpected/heavy)?", type:"yesno", showIf:{ eq:["sex","female"] } },
    { id:"wh_pelvicpain", prompt:"Pelvic/low abdominal pain?", type:"yesno", showIf:{ eq:["sex","female"] } },
    { id:"wh_cramps", prompt:"Menstrual cramps severe enough to impact daily life?", type:"yesno", showIf:{ eq:["sex","female"] } }
  ]
};

/* -------------------------------- PEDIATRICS ------------------------------ */
export const PedsModule: Module = {
  id:"peds",
  title:"Pediatrics",
  entryIf: { lte:["age",12] },
  questions: [
    { id:"peds_intake", prompt:"Feeding/fluids ok?", type:"yesno" },
    { id:"peds_dehyd", prompt:"Dry mouth, no tears, very sleepy, no urine >8h?", type:"yesno" },
    { id:"peds_rash", prompt:"New widespread rash or stiff neck?", type:"yesno" },
    { id:"peds_vax", prompt:"Up-to-date on routine vaccines?", type:"yesno" }
  ]
};

/* ------------------------------ TRAVEL MEDICINE --------------------------- */
export const TravelModule: Module = {
  id:"travel",
  title:"Travel Medicine",
  entryIf: { regex:["chief","travel|trip|vaccine|malaria|diarrhea after travel|yellow fever|dengue|zika"] },
  questions: [
    { id:"tr_dest", prompt:"Destination country/region?", type:"text" },
    { id:"tr_dates", prompt:"Travel dates (approx)?", type:"text" },
    { id:"tr_vax", prompt:"Up-to-date on routine vaccines?", type:"yesno" },
    { id:"tr_risks", prompt:"Planned high-risk activities (rural, camping, freshwater, animal contact)?", type:"yesno" },
    { id:"tr_diarrhea", prompt:"Traveler’s diarrhea now or recently?", type:"yesno" },
    { id:"tr_fever", prompt:"Fever after travel (especially tropics)?", type:"yesno" }
  ]
};

/* ----------------------------- CARDIOVASCULAR ----------------------------- */
export const CardiovascularModule: Module = {
  id:"cardio",
  title:"Cardiovascular",
  entryIf: { regex:["chief","blood pressure|hypertension|high bp|palpit|faint|syncope|leg swelling|edema|heart failure|stroke|tia|cholesterol|atherosclerosis"] },
  questions: [
    { id:"bp_known", prompt:"Do you have known high blood pressure?", type:"yesno" },
    { id:"bp_value", prompt:"If known, what was the recent BP (e.g., 150/95)?", type:"text" },
    { id:"edema", prompt:"Swelling in legs/ankles (edema)?", type:"yesno" },
    { id:"orthopnea", prompt:"Short of breath when lying flat (need extra pillows)?", type:"yesno" },
    { id:"pnd", prompt:"Wake up breathless at night (paroxysmal nocturnal dyspnea)?", type:"yesno" },
    { id:"syncope", prompt:"Fainting/near-fainting episodes?", type:"yesno" },
    { id:"tiasx", prompt:"Sudden weakness/speech/vision trouble (stroke/TIA signs)?", type:"yesno" },
    { id:"lipids", prompt:"High cholesterol or atherosclerosis diagnosed?", type:"yesno" },
    { id:"cv_risk", prompt:"Cardiovascular risks", type:"multichoice",
      choices:[
        {label:"Smoking",value:"smoke"},{label:"Diabetes",value:"dm"},
        {label:"Family history early CVD",value:"fh"},{label:"Cholesterol",value:"lipid"},
        {label:"Kidney disease",value:"ckd"}
      ]},
  ]
};

/* -------------------------------- RESPIRATORY ----------------------------- */
export const RespiratoryModule: Module = {
  id:"resp",
  title:"Respiratory",
  entryIf: { regex:["chief","cough|shortness of breath|sob|wheeze|pneumonia|covid|flu|influenza|tb|tuberculosis|phlegm|sputum"] },
  questions: [
    { id:"cough_type", prompt:"Cough type?", type:"choice",
      choices:[{label:"Dry",value:"dry"},{label:"Productive (phlegm)",value:"wet"}] },
    { id:"sputum", prompt:"If productive: color of sputum?", type:"choice",
      choices:[{label:"Clear/white",value:"clear"},{label:"Yellow/green",value:"purulent"},{label:"Blood-tinged",value:"blood"}] },
    { id:"sob_rest", prompt:"Short of breath at rest?", type:"yesno" },
    { id:"wheeze", prompt:"Wheezing?", type:"yesno" },
    { id:"asthma", prompt:"History of asthma?", type:"yesno" },
    { id:"copd", prompt:"History of COPD/emphysema or long-term smoking?", type:"yesno" },
    { id:"fever_resp", prompt:"Fever or chills?", type:"yesno" },
    { id:"exposure", prompt:"Known COVID/flu/TB exposure?", type:"multichoice",
      choices:[{label:"COVID",value:"covid"},{label:"Flu",value:"flu"},{label:"TB",value:"tb"},{label:"None",value:"none"}] }
  ]
};

/* -------------------------------- NEUROLOGY ------------------------------- */
export const NeuroModule: Module = {
  id:"neuro",
  title:"Neurological",
  entryIf: { regex:["chief","weakness|numb|tingle|dizzy|vertigo|seizure|tremor|memory|parkinson|alzheimer|ms|multiple sclerosis|epilep"] },
  questions: [
    { id:"focal_deficit", prompt:"Sudden weakness/numbness on one side, trouble speaking or vision?", type:"yesno" },
    { id:"seizure_hist", prompt:"History of seizures or new seizure?", type:"yesno" },
    { id:"tremor", prompt:"Resting tremor or stiffness/bradykinesia?", type:"yesno" },
    { id:"memory_decline", prompt:"Noticeable memory decline affecting daily life?", type:"yesno" },
    { id:"optic_neuritis", prompt:"Any episode of painful vision loss (possible optic neuritis)?", type:"yesno" },
    { id:"gait", prompt:"Issues with balance or walking?", type:"yesno" },
    { id:"headache_overlap", prompt:"Co-existing severe headache?", type:"yesno" }
  ]
};

/* --------------------------- ENDOCRINE & METABOLIC ------------------------ */
export const EndocrineModule: Module = {
  id:"endocrine",
  title:"Endocrine & Metabolic",
  entryIf: { regex:["chief","diabetes|high sugar|thyroid|hyperthy|hypothy|obesity|weight|cushing|addison"] },
  questions: [
    { id:"dm_type", prompt:"Diabetes type (if known)?", type:"choice",
      choices:[{label:"Type 1",value:"t1"},{label:"Type 2",value:"t2"},{label:"Gestational",value:"gdm"},{label:"Unsure",value:"u"}] },
    { id:"dm_sym", prompt:"Symptoms of high/low sugar (thirst/urination, shakiness/confusion)?", type:"multichoice",
      choices:[{label:"Thirst/urination ↑",value:"poly"},{label:"Shaky/sweaty/weak",value:"hypo"},{label:"None",value:"none"}] },
    { id:"thy_sym", prompt:"Thyroid symptoms", type:"multichoice",
      choices:[
        {label:"Heat intolerance / palpitations / weight loss",value:"hyper"},
        {label:"Cold intolerance / weight gain / constipation",value:"hypo"}
      ]},
    { id:"obesity", prompt:"Is weight a concern or BMI ≥30 (if known)?", type:"yesno" },
    { id:"cushing", prompt:"New easy bruising, purple stretch marks, round face?", type:"yesno" },
    { id:"addison", prompt:"Severe fatigue, darkening skin, low BP/dizziness?", type:"yesno" }
  ]
};

/* -------------------------------- INFECTIOUS ------------------------------ */
export const InfectiousModule: Module = {
  id:"id",
  title:"Infectious Diseases",
  entryIf: { regex:["chief","fever|infection|hiv|aids|hepatitis|jaundice|malaria|measles|chickenpox|varicella|dengue|rash with fever"] },
  questions: [
    { id:"hiv_risk", prompt:"Any HIV exposure risk (unprotected sex, needle sharing)?", type:"yesno" },
    { id:"hepatitis_risk", prompt:"Hepatitis risks (tattoos, transfusion history, IV drugs)?", type:"yesno" },
    { id:"jaundice", prompt:"Yellowing of eyes/skin (jaundice)?", type:"yesno" },
    { id:"id_rash_fever", prompt:"Fever with rash?", type:"yesno" },
    { id:"vector", prompt:"Recent mosquito bites in endemic areas (dengue/malaria)?", type:"yesno" },
    { id:"travel_overlap", prompt:"Recent international travel?", type:"yesno" }
  ]
};

/* -------------------------------- AUTOIMMUNE ------------------------------ */
export const AutoimmuneModule: Module = {
  id:"autoimmune",
  title:"Autoimmune",
  entryIf: { regex:["chief","joint pain|stiffness|morning stiffness|rash|photosensitivity|ulcerative colitis|crohn|psoriasis|lupus|sle|rheumatoid"] },
  questions: [
    { id:"joint_pattern", prompt:"Joint pain pattern (small joints hands, large joints knees/hips)?", type:"choice",
      choices:[{label:"Small joints (hands/wrists)",value:"small"},{label:"Large joints",value:"large"},{label:"Mixed",value:"mixed"}] },
    { id:"morning_stiff", prompt:"Morning stiffness > 30 minutes?", type:"yesno" },
    { id:"photosens", prompt:"Rash or sensitivity to sunlight; mouth ulcers?", type:"yesno" },
    { id:"psoriasis", prompt:"History of psoriasis?", type:"yesno" },
    { id:"ibd", prompt:"Chronic diarrhea with blood/mucus (IBD)?", type:"yesno" }
  ]
};

/* ---------------------------------- CANCER -------------------------------- */
export const CancerModule: Module = {
  id:"onc",
  title:"Cancer Screening Flags",
  entryIf: { regex:["chief","unexplained weight|night sweat|lump|mass|bleeding|hemoptysis|change in bowel|breast|prostate|colon|lung|leukemia|lymph"] },
  questions: [
    { id:"alarm_wt", prompt:"Unintentional weight loss (>5% in 6 months)?", type:"yesno" },
    { id:"nightsweats", prompt:"Night sweats?", type:"yesno" },
    { id:"bleeding_alarm", prompt:"Unexplained bleeding (stool/urine/coughing blood)?", type:"yesno" },
    { id:"breast_lump", prompt:"Breast lump or nipple discharge?", type:"yesno" },
    { id:"prostate_sx", prompt:"Urinary hesitancy/weak stream (prostate)?", type:"yesno", showIf:{ eq:["sex","male"] } },
    { id:"bowel_change", prompt:"Change in bowel habits (new constipation/diarrhea, pencil-thin stools)?", type:"yesno" },
    { id:"smoking", prompt:"History of smoking?", type:"yesno" }
  ]
};

/* --------------------------------- DIGESTIVE ------------------------------ */
export const DigestiveModule: Module = {
  id:"gi",
  title:"Digestive (GERD/Gastritis/PUD/IBS)",
  entryIf: { regex:["chief","heartburn|reflux|gerd|gastritis|ulcer|peptic|ibs|bloating|indigestion|nausea|vomit|diarrhea|constipation"] },
  questions: [
    { id:"gerd_freq", prompt:"Heartburn ≥2 days/week or nighttime symptoms?", type:"yesno" },
    { id:"pud_alarm", prompt:"Ulcer red flags (black/tarry stool, vomit blood, severe constant pain)?", type:"yesno" },
    { id:"ibsfreq", prompt:"Recurrent abdominal pain ≥1 day/week with stool change?", type:"yesno" },
    { id:"food_triggers", prompt:"Symptoms triggered by certain foods/alcohol/NSAIDs?", type:"yesno" }
  ]
};

/* ----------------------------- MUSCULOSKELETAL ---------------------------- */
export const MusculoskeletalModule: Module = {
  id:"msk",
  title:"Musculoskeletal",
  entryIf: { regex:["chief","joint pain|knee pain|hip pain|shoulder pain|gout|back pain|stiffness|swelling|muscle pain|myalgia|osteoporosis|osteoarthritis"] },
  questions: [
    { id:"msk_site", prompt:"Main site of pain?", type:"choice",
      choices:[
        {label:"Back",value:"back"},{label:"Knee",value:"knee"},{label:"Hip",value:"hip"},
        {label:"Shoulder",value:"shoulder"},{label:"Hands",value:"hands"},{label:"Generalized",value:"gen"}
      ]},
    { id:"msk_morning", prompt:"Morning stiffness > 30 min?", type:"yesno" },
    { id:"gout_toe", prompt:"First MTP (big toe) red/hot/swollen attack?", type:"yesno" },
    { id:"osteoporosis_risk", prompt:"History of fractures, steroid use, or low BMI (osteoporosis risk)?", type:"yesno" }
  ]
};

/* ----------------------------------- PAIN --------------------------------- */
export const PainModule: Module = {
  id:"pain",
  title:"Common Pains",
  entryIf: { regex:["chief","headache|toothache|back pain|joint pain|stomach ache|chest pain|sore throat|muscle pain|cramp|menstrual cramps"] },
  questions: [
    { id:"pain_type", prompt:"Which best describes your pain?", type:"choice",
      choices:[
        {label:"Headache / Migraine",value:"head"},{label:"Tooth / Jaw",value:"tooth"},
        {label:"Back",value:"back"},{label:"Joint",value:"joint"},
        {label:"Stomach / Abdominal",value:"stomach"},{label:"Chest",value:"chest"},
        {label:"Sore throat",value:"throat"},{label:"Muscle (myalgia)",value:"muscle"},
        {label:"Menstrual cramps",value:"cramps"}
      ]},
    { id:"pain_sev", prompt:"How severe is the pain right now?", type:"choice",
      choices:[{label:"Mild",value:"mild"},{label:"Moderate",value:"moderate"},{label:"Severe",value:"severe"}] },
    { id:"pain_redflags", prompt:"Any red flags: fever, weakness, confusion, uncontrolled vomiting, blood, chest pressure, trouble breathing?", type:"yesno" },
  ]
};

/* --------------------------------- SYMPTOMS ------------------------------- */
export const SymptomModule: Module = {
  id:"symptoms",
  title:"General Symptoms",
  entryIf: { regex:["chief","fever|fatigue|weight|sweat|night sweats|dizzy|vertigo|numb|tingle|palpitation|swelling|nausea|vomit|diarrhea|constipation|insomnia|hallucination|anxiety|sadness|depressed"] },
  questions: [
    { id:"gen_fever", prompt:"Fever now or in past 72h?", type:"yesno" },
    { id:"gen_fatigue", prompt:"Significant fatigue?", type:"yesno" },
    { id:"gen_weight", prompt:"Unintentional weight loss/gain?", type:"choice",
      choices:[{label:"Loss",value:"loss"},{label:"Gain",value:"gain"},{label:"No",value:"none"}] },
    { id:"neu_sx", prompt:"Neuro symptoms (dizziness/vertigo, numb/tingle, seizures)?", type:"multichoice",
      choices:[{label:"Dizziness/Vertigo",value:"dizzy"},{label:"Numbness/Tingling",value:"numb"},
               {label:"Seizures",value:"seiz"}] },
    { id:"resp_sx", prompt:"Resp symptoms (cough/SOB/wheeze)?", type:"multichoice",
      choices:[{label:"Cough",value:"cough"},{label:"Shortness of breath",value:"sob"},{label:"Wheezing",value:"wheeze"}] },
    { id:"card_sx", prompt:"Cardiac symptoms (palpitations/tightness/leg swelling)?", type:"multichoice",
      choices:[{label:"Palpitations",value:"palp"},{label:"Chest tightness",value:"tight"},{label:"Leg swelling",value:"edema"}] },
    { id:"gi_sx", prompt:"Digestive symptoms (nausea/vomit/diarrhea/constipation/abdominal pain)?", type:"multichoice",
      choices:[{label:"Nausea",value:"nausea"},{label:"Vomiting",value:"vom"},{label:"Diarrhea",value:"diarr"},
               {label:"Constipation",value:"const"},{label:"Abdominal pain",value:"abpain"}] },
    { id:"msk_sx", prompt:"Musculoskeletal (joint pain/cramps/stiffness/swelling)?", type:"multichoice",
      choices:[{label:"Joint pain",value:"joint"},{label:"Muscle cramps",value:"cramps"},
               {label:"Stiffness",value:"stiff"},{label:"Swelling",value:"swelling"}] },
    { id:"mh_sx", prompt:"Mental health (sadness/anxiety/insomnia/hallucinations)?", type:"multichoice",
      choices:[{label:"Sadness",value:"sad"},{label:"Anxiety",value:"anx"},{label:"Insomnia",value:"insom"},{label:"Hallucinations",value:"hall"}] }
  ]
};

/* ------------------------------ MODULES EXPORT ---------------------------- */
export const Modules: Module[] = [
  // Always include General intake first.
  GeneralModule,

  // Existing core modules
  ChestPainModule, SkinModule, HeadacheModule, AbdominalModule,
  InjuryModule, MentalModule, WomenModule, PedsModule, TravelModule,

  // NEW comprehensive coverage
  CardiovascularModule, RespiratoryModule, NeuroModule, EndocrineModule,
  InfectiousModule, AutoimmuneModule, CancerModule, DigestiveModule,
  MusculoskeletalModule, PainModule, SymptomModule
];
