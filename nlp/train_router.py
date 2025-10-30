# nlp/train_router.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.multiclass import OneVsRestClassifier
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.metrics import f1_score
import joblib
import re, json
from pathlib import Path
import numpy as np

DATA = Path(__file__).parent / "data" / "complaints.csv"
OUT  = Path(__file__).parent / "model"
OUT.mkdir(parents=True, exist_ok=True)

QUESTIONS_FILE = OUT / "labels_to_questions.json"

def normalize_text(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

# 🔹 Load dataset
df = pd.read_csv(DATA)

# 🚨 Drop accidental header rows where "labels" sneaks in as a value
df = df[df["labels"].str.lower() != "labels"].copy()

# 🔹 Normalize text + parse labels
df["text_norm"] = df["text"].astype(str).apply(normalize_text)
df["labels_list"] = df["labels"].astype(str).apply(
    lambda x: [t.strip() for t in x.split(",") if t.strip()]
)

# Fit label binarizer
mlb = MultiLabelBinarizer()
Y = mlb.fit_transform(df["labels_list"])

# Model: robust char+word n-grams for misspellings
pipe = Pipeline([
    ("tfidf", TfidfVectorizer(
        analyzer="char_wb",
        ngram_range=(3, 5),
        min_df=2,
        max_features=200000
    )),
    ("clf", OneVsRestClassifier(
        LogisticRegression(max_iter=200, C=4.0, class_weight="balanced", n_jobs=1)
    ))
])

# 🔹 Check if stratify is possible
label_counts = Y.sum(axis=0)
if np.all(label_counts >= 2):
    stratify = Y
else:
    print("⚠️ Not all labels have >=2 samples. Disabling stratify.")
    stratify = None

X_train, X_test, y_train, y_test = train_test_split(
    df["text_norm"], Y,
    test_size=0.15,
    random_state=42,
    stratify=stratify
)

pipe.fit(X_train, y_train)

# Eval
pred = pipe.predict(X_test)
micro = f1_score(y_test, pred, average="micro", zero_division=0)
macro = f1_score(y_test, pred, average="macro", zero_division=0)
print(f"Micro-F1: {micro:.3f} | Macro-F1: {macro:.3f}")

# Save model + label binarizer
joblib.dump(pipe, OUT / "router.joblib")
joblib.dump(mlb,  OUT / "mlb.joblib")

# Save label order for the client
(Path(OUT) / "labels.json").write_text(json.dumps(list(mlb.classes_), indent=2))

# 🔹 Load curated questions file (must exist)
if not QUESTIONS_FILE.exists():
    raise FileNotFoundError(f"❌ Expected curated questions file at {QUESTIONS_FILE}")

with open(QUESTIONS_FILE, "r") as f:
    questions_map = json.load(f)

# 🔍 Validation: ensure every label has questions
for label in mlb.classes_:
    if label.lower() == "labels":
        continue
    if label not in questions_map:
        raise ValueError(f"❌ Missing questions for label '{label}' in {QUESTIONS_FILE}")
    if len(questions_map[label]) < 10:
        raise ValueError(f"❌ Label '{label}' has fewer than 10 questions in {QUESTIONS_FILE}")

# ✅ Overwrite to ensure synced version
with open(QUESTIONS_FILE, "w") as f:
    json.dump(questions_map, f, indent=2)

print(f"✅ Saved model + validated questions map from {QUESTIONS_FILE}")
