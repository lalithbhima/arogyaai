# nlp/fuzzy.py
from rapidfuzz import process, fuzz

KNOWN = [
  # core modules/axes — keep in sync with modules.ts + triage.ts
  "chest pain","cardiac","shortness of breath","headache","migraine","abdominal pain","gi",
  "diarrhea","constipation","nausea","vomiting","skin lesion","skin rash","derm","injury",
  "mental","depression","anxiety","respiratory","cough","fever","flu_like","covid-19",
  "pneumonia","asthma","copd","stroke","neurology","seizure","palpitations","edema",
  "urinary","uti_like","women","pregnancy","travel",
  # add more from your long list:
  "hypertension","heart failure","atherosclerosis","alzheimer's disease","parkinson's disease",
  "epilepsy","multiple sclerosis","diabetes","hyperthyroidism","hypothyroidism","obesity",
  "cushing's syndrome","addison's disease","hiv","malaria","hepatitis","chickenpox","measles",
  "dengue","rheumatoid arthritis","lupus","psoriasis","ibd","crohn's","ulcerative colitis",
  "breast cancer","lung cancer","prostate cancer","colon cancer","skin cancer","leukemia",
  "gastritis","peptic ulcer","gerd","ibs","appendicitis","osteoporosis","osteoarthritis","gout",
  "back pain","dizziness","vertigo","seizures","numbness","tingling","wheezing","palpitations",
  "chest tightness","leg swelling","weight loss","weight gain","night sweats","fatigue",
  "insomnia","hallucinations","toothache","sore throat","menstrual cramps","muscle pain","joint pain",
]

def fuzzy_tags(text: str, *, k=5, score_cutoff=80):
    results = process.extract(text, KNOWN, scorer=fuzz.WRatio, limit=k, score_cutoff=score_cutoff)
    return [r[0] for r in results]
