// src/data/triage.ts
import { TriageRule } from "../types/assistant";

export const TRIAGE: TriageRule[] = [
  /* ---------------------------- CARDIOVASCULAR ---------------------------- */
  {
    id:"cp_emergent",
    severity:"emergent",
    description:"🚨 Chest pain with red flags (SOB, exertional, radiation, nausea)",
    if:{ anyOf:["cp_sob","cp_exertion","cp_radiation","cp_nausea"] },
    action:{ route:"EMERGENCY", message:"This is an emergency. Seek immediate medical care." }
  },
  {
    id:"cardio_urgent",
    severity:"urgent",
    description:"⚠️ Hypertension or edema with risk factors",
    if:{ anyOf:["bp_known","edema"] },
    action:{ route:"CLINIC", message:"High BP or early heart failure. Clinic evaluation recommended soon." }
  },
  {
    id:"cardio_routine",
    severity:"routine",
    description:"✅ Stable cardiovascular symptoms",
    if:{ anyOf:["lipids","cv_risk"] },
    action:{ route:"SELF_CARE", message:"Monitor at home, follow lifestyle advice, and arrange regular checkups." }
  },

  /* ------------------------------ RESPIRATORY ----------------------------- */
  {
    id:"resp_emergent",
    severity:"emergent",
    description:"🚨 Severe shortness of breath or hemoptysis",
    if:{ anyOf:["sob_rest","sputum"] },
    action:{ route:"EMERGENCY", message:"This is an emergency. Seek immediate medical care." }
  },
  {
    id:"resp_urgent",
    severity:"urgent",
    description:"⚠️ Fever with cough/wheeze",
    if:{ anyOf:["fever_resp","wheeze"] },
    action:{ route:"CLINIC", message:"Possible pneumonia, asthma/COPD flare, or infection. Seek clinic promptly." }
  },
  {
    id:"resp_routine",
    severity:"routine",
    description:"✅ Mild viral cough or cold",
    if:{ anyOf:["cough_type","asthma","copd"] },
    action:{ route:"SELF_CARE", message:"Hydration, rest, OTC cough meds. Monitor for worsening." }
  },

  /* ------------------------------- NEUROLOGY ------------------------------ */
  {
    id:"neuro_emergent",
    severity:"emergent",
    description:"🚨 Stroke-like or seizure activity",
    if:{ anyOf:["focal_deficit","seizure_hist"] },
    action:{ route:"EMERGENCY", message:"This is an emergency. Seek immediate medical care." }
  },
  {
    id:"neuro_urgent",
    severity:"urgent",
    description:"⚠️ Progressive memory loss or tremor",
    if:{ anyOf:["memory_decline","tremor","gait"] },
    action:{ route:"CLINIC", message:"Neurological condition (Alzheimer’s, Parkinson’s, MS) requires specialist review." }
  },
  {
    id:"neuro_routine",
    severity:"routine",
    description:"✅ Mild dizziness, tension-type headache",
    if:{ anyOf:["headache_overlap"] },
    action:{ route:"SELF_CARE", message:"Monitor symptoms, hydration, rest, stress management." }
  },

  /* ------------------------ ENDOCRINE & METABOLIC ------------------------- */
  {
    id:"endocrine_emergent",
    severity:"emergent",
    description:"🚨 Diabetic emergency, Addison crisis, thyroid storm",
    if:{ anyOf:["dm_sym","addison","cushing","thy_sym"] },
    action:{ route:"EMERGENCY", message:"This is an emergency. Seek immediate medical care." }
  },
  {
    id:"endocrine_urgent",
    severity:"urgent",
    description:"⚠️ Poorly controlled diabetes or thyroid imbalance",
    if:{ anyOf:["dm_type","thy_sym"] },
    action:{ route:"CLINIC", message:"Chronic diabetes or thyroid imbalance needs clinic management." }
  },
  {
    id:"endocrine_routine",
    severity:"routine",
    description:"✅ Stable endocrine/metabolic condition",
    if:{ anyOf:["obesity"] },
    action:{ route:"SELF_CARE", message:"Continue monitoring, diet and lifestyle changes, routine follow-up." }
  },

  /* ------------------------------- INFECTIOUS ----------------------------- */
  {
    id:"id_emergent",
    severity:"emergent",
    description:"🚨 Sepsis, malaria, or dengue with fever",
    if:{ anyOf:["fever","vector","jaundice","id_rash_fever"] },
    action:{ route:"EMERGENCY", message:"This is an emergency. Seek immediate medical care." }
  },
  {
    id:"id_urgent",
    severity:"urgent",
    description:"⚠️ Viral hepatitis or HIV exposure risk",
    if:{ anyOf:["hiv_risk","hepatitis_risk"] },
    action:{ route:"CLINIC", message:"Testing and urgent follow-up required." }
  },
  {
    id:"id_routine",
    severity:"routine",
    description:"✅ Mild viral infection or self-limited illness",
    if:{ anyOf:["travel_overlap"] },
    action:{ route:"SELF_CARE", message:"Hydration, rest, OTC meds. Seek care if worsening." }
  },

  /* ------------------------------- AUTOIMMUNE ------------------------------ */
  {
    id:"autoimmune_urgent",
    severity:"urgent",
    description:"⚠️ Severe autoimmune flare",
    if:{ anyOf:["morning_stiff","photosens","ibd"] },
    action:{ route:"CLINIC", message:"Possible autoimmune disease flare (RA, lupus, IBD). Needs urgent evaluation." }
  },
  {
    id:"autoimmune_routine",
    severity:"routine",
    description:"✅ Mild stiffness or stable autoimmune condition",
    if:{ anyOf:["psoriasis","joint_pattern"] },
    action:{ route:"SELF_CARE", message:"Monitor symptoms, lifestyle measures, and routine specialist care." }
  },

  /* -------------------------------- CANCER -------------------------------- */
  {
    id:"onc_emergent",
    severity:"emergent",
    description:"🚨 Massive bleeding or airway compromise",
    if:{ anyOf:["bleeding_alarm"] },
    action:{ route:"EMERGENCY", message:"This is an emergency. Seek immediate medical care." }
  },
  {
    id:"onc_urgent",
    severity:"urgent",
    description:"⚠️ Unexplained weight loss, lumps, night sweats",
    if:{ anyOf:["alarm_wt","nightsweats","breast_lump","prostate_sx","bowel_change"] },
    action:{ route:"CLINIC", message:"Possible cancer warning signs. Urgent oncology review recommended." }
  },
  {
    id:"onc_routine",
    severity:"routine",
    description:"✅ Routine cancer risk factors (smoking, family history)",
    if:{ anyOf:["smoking"] },
    action:{ route:"SELF_CARE", message:"Continue screening and preventive measures." }
  },

  /* ------------------------------- DIGESTIVE ------------------------------ */
  {
    id:"gi_emergent",
    severity:"emergent",
    description:"🚨 GI bleed or severe abdominal emergency",
    if:{ anyOf:["pud_alarm","ab_rebound"] },
    action:{ route:"EMERGENCY", message:"This is an emergency. Seek immediate medical care." }
  },
  {
    id:"gi_urgent",
    severity:"urgent",
    description:"⚠️ GERD or IBS flare",
    if:{ anyOf:["gerd","ibs_flags"] },
    action:{ route:"CLINIC", message:"Persistent digestive issues need clinic evaluation." }
  },
  {
    id:"gi_routine",
    severity:"routine",
    description:"✅ Mild indigestion or gastritis",
    if:{ anyOf:["food_triggers"] },
    action:{ route:"SELF_CARE", message:"Dietary modification, OTC acid reducers, monitor." }
  },

  /* ---------------------------- MUSCULOSKELETAL --------------------------- */
  {
    id:"msk_emergent",
    severity:"emergent",
    description:"🚨 Back pain with spinal cord compromise",
    if:{ eq:["back_redflags",true] },
    action:{ route:"EMERGENCY", message:"This is an emergency. Seek immediate medical care." }
  },
  {
    id:"msk_urgent",
    severity:"urgent",
    description:"⚠️ Arthritis or gout flare",
    if:{ anyOf:["morning_stiff","gout_toe","osteoporosis_risk"] },
    action:{ route:"CLINIC", message:"Joint flare or osteoporosis risk needs urgent clinic review." }
  },
  {
    id:"msk_routine",
    severity:"routine",
    description:"✅ Mild sprain or stiffness",
    if:{ anyOf:["msk_site"] },
    action:{ route:"SELF_CARE", message:"RICE (rest, ice, compression, elevation), gradual return to activity." }
  },

  /* ------------------------------ MENTAL HEALTH --------------------------- */
  {
    id:"mh_emergent",
    severity:"emergent",
    description:"🚨 Self-harm risk or psychosis",
    if:{ anyOf:["mh_safety","mh_psychosis"] },
    action:{ route:"EMERGENCY", message:"This is an emergency. Seek immediate medical care." }
  },
  {
    id:"mh_urgent",
    severity:"urgent",
    description:"⚠️ Severe depression, mania, PTSD",
    if:{ anyOf:["mh_mania","mh_ptsd","mh_mood","mh_interest"] },
    action:{ route:"CLINIC", message:"Urgent behavioral health follow-up is recommended." }
  },
  {
    id:"mh_routine",
    severity:"routine",
    description:"✅ Mild anxiety, stress, or insomnia",
    if:{ anyOf:["mh_anx","insomnia"] },
    action:{ route:"SELF_CARE", message:"Self-care, sleep hygiene, relaxation techniques, monitor." }
  },

  /* ----------------------------- WOMEN’S HEALTH --------------------------- */
  {
    id:"wh_emergent",
    severity:"emergent",
    description:"🚨 Pregnant + heavy bleeding or pelvic pain",
    if:{ allOf:["pregnant","wh_vagbleed"] },
    action:{ route:"EMERGENCY", message:"This is an emergency. Seek immediate medical care." }
  },
  {
    id:"wh_urgent",
    severity:"urgent",
    description:"⚠️ Severe cramps, UTI, or pelvic pain",
    if:{ anyOf:["wh_cramps","wh_uti","wh_pelvicpain"] },
    action:{ route:"CLINIC", message:"Women’s health issue requires urgent clinic care." }
  },
  {
    id:"wh_routine",
    severity:"routine",
    description:"✅ Routine women’s health concern",
    if:{ anyOf:["wh_lmp","wh_preg_sx"] },
    action:{ route:"SELF_CARE", message:"Track cycles, monitor symptoms, routine checkup." }
  },

  /* ------------------------------- PEDIATRICS ----------------------------- */
  {
    id:"peds_emergent",
    severity:"emergent",
    description:"🚨 Child very lethargic, stiff neck, or severe dehydration",
    if:{ anyOf:["peds_dehyd","peds_rash"] },
    action:{ route:"EMERGENCY", message:"This is an emergency. Seek immediate medical care." }
  },
  {
    id:"peds_routine",
    severity:"routine",
    description:"✅ Minor pediatric concern (feeding, mild fever)",
    if:{ anyOf:["peds_intake","peds_vax"] },
    action:{ route:"SELF_CARE", message:"Monitor hydration, ensure vaccines up-to-date, follow at home unless worsening." }
  },

  /* ------------------------------- GENERAL SYMPTOMS ----------------------- */
  {
    id:"sympt_emergent",
    severity:"emergent",
    description:"🚨 Concerning combination of symptoms",
    if:{ anyOf:["gen_fever","gen_fatigue","gen_weight"] },
    action:{ route:"CLINIC", message:"This is an emergency. Seek immediate medical care." }
  },
  {
    id:"sympt_routine",
    severity:"routine",
    description:"✅ Mild nonspecific symptoms",
    if:{ anyOf:["resp_sx","card_sx","gi_sx","msk_sx","mh_sx"] },
    action:{ route:"SELF_CARE", message:"Monitor, home care, seek follow-up if worsening." }
  }
];
