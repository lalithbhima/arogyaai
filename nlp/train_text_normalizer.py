# nlp/train_text_normalizer.py
import json, os, re, csv
from typing import List
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.multiclass import OneVsRestClassifier
from sklearn.svm import LinearSVC
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score

DATA_FILE = os.environ.get("NLP_DATA", "nlp/data/complaints.csv")
MODEL_DIR = "nlp/model"
os.makedirs(MODEL_DIR, exist_ok=True)

def clean(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text

def load_data(path: str):
    """
    CSV columns:
      text: free-text complaint
      labels: pipe-separated labels, e.g. "chest_pain|cardiac|shortness_of_breath"
    """
    X, Y = [], []
    with open(path, newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for row in r:
            text = row["text"].strip()
            labels = [x.strip() for x in row["labels"].split("|") if x.strip()]
            if text and labels:
                X.append(clean(text))
                Y.append(labels)
    return X, Y

def main():
    X, Y = load_data(DATA_FILE)
    mlb = MultiLabelBinarizer()
    Yb = mlb.fit_transform(Y)

    Xtr, Xte, Ytr, Yte = train_test_split(X, Yb, test_size=0.15, random_state=42)

    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1,2), min_df=2, max_features=120000)),
        ("clf", OneVsRestClassifier(LinearSVC()))
    ])
    pipe.fit(Xtr, Ytr)

    Yp = pipe.decision_function(Xte)  # shape (N, C), not yet thresholded
    # simple threshold >0 for LinearSVC; turn into 0/1
    Yhat = (Yp > 0).astype(int)
    micro_f1 = f1_score(Yte, Yhat, average="micro")
    macro_f1 = f1_score(Yte, Yhat, average="macro")
    print(f"Micro-F1: {micro_f1:.3f} | Macro-F1: {macro_f1:.3f}")

    joblib.dump(pipe, os.path.join(MODEL_DIR, "routing.joblib"))
    joblib.dump(mlb, os.path.join(MODEL_DIR, "mlb.joblib"))
    print("Saved model to nlp/model/")

if __name__ == "__main__":
    main()
