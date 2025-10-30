# nlp/synonyms.py
from typing import List
import os
from symspellpy.symspellpy import SymSpell, Verbosity

# Build once at startup
_sym = SymSpell(max_dictionary_edit_distance=2, prefix_length=7)
# You can ship a small freq file (word  count) – add medical terms too.
freq_file = os.environ.get("SYM_FREQ", "nlp/data/frequency_en_med.txt")
if os.path.exists(freq_file):
    _sym.load_dictionary(freq_file, term_index=0, count_index=1)

# Hand synonyms map (extend this steadily)
CANON = {
    "mi": "heart attack",
    "myocardial infarction": "heart attack",
    "heartattack": "heart attack",
    "chestpain": "chest pain",
    "sob": "shortness of breath",
    "breathless": "shortness of breath",
    "bp": "blood pressure",
    "hypertension": "high blood pressure",
    "uti": "urinary tract infection",
    "covid": "covid-19",
    "corona": "covid-19",
    "flu": "influenza",
    "head ache": "headache",
    "abd pain": "abdominal pain",
    "tummy pain": "abdominal pain",
    "skin lesion": "skin lesion",
    "mole": "skin lesion",
    "rash": "skin rash",
    "anx": "anxiety",
    "depr": "depression",
}

def symspell_fix(token: str) -> str:
    if not _sym or not token: return token
    s = _sym.lookup(token, Verbosity.CLOSEST, max_edit_distance=2)
    return s[0].term if s else token

def normalize_surface(text: str) -> str:
    text = text.lower().strip()
    toks = [symspell_fix(t) for t in text.split()]
    text = " ".join(CANON.get(t, t) for t in toks)
    # second pass for multiword synonyms
    for k, v in CANON.items():
        text = text.replace(k, v)
    return " ".join(text.split())
