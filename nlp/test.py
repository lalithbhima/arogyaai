# nlp/generate_complaints.py
import random, csv, itertools
from pathlib import Path

OUT = Path(__file__).parent / "data" / "complaints_1M.csv"
OUT.parent.mkdir(parents=True, exist_ok=True)

# Broad categories and example complaints
categories = {
    "cardio": ["chest pain", "heart racing", "palpitations", "tightness", "dizzy after running"],
    "neuro": ["migraine headache", "seizure episode", "dizziness", "slurred speech", "confusion"],
    "mental": ["feeling anxious", "panic attack", "sad mood", "can’t sleep", "lost interest"],
    "onc": ["lump in breast", "suspicious mole", "unexplained weight loss", "skin growth"],
    "peds": ["child fever", "rash in toddler", "ear infection", "vomiting baby"],
    "derm": ["itchy rash", "acne breakout", "skin peeling", "eczema flare", "hives"],
    "gi": ["stomach pain", "vomiting blood", "diarrhea", "heartburn", "indigestion"],
    "infectious": ["fever after travel", "chills", "sore throat", "cough with mucus", "fatigue"],
    "msk": ["knee pain", "back stiffness", "swollen ankle", "joint pain", "muscle cramp"],
    "resp": ["shortness of breath", "asthma attack", "wheezing", "cough", "tight chest"],
}

# Variants to make phrasing more natural
prefixes = ["having", "suffering from", "feeling", "experiencing", "noticed", "sudden"]
suffixes = ["for 2 days", "worsening today", "after exercise", "since last night", "with nausea", "with sweating"]

def generate_variants(base):
    return [
        f"{pre} {base} {suf}".strip()
        for pre, suf in itertools.product(prefixes, suffixes)
    ] + [base]

def main(n=1_000_000):
    rows = []
    cat_list = list(categories.keys())

    for _ in range(n):
        # Pick 1–2 categories for multi-labels
        cats = random.sample(cat_list, k=random.choice([1, 2]))
        phrase = random.choice(categories[cats[0]])
        text = random.choice(generate_variants(phrase))

        # Add typos randomly
        if random.random() < 0.05:
            text = text.replace(" ", "").replace("a", "@", 1)

        label_str = ",".join(cats)

        # Save cleanly — no backslashes
        rows.append([text, label_str])

    # ✅ Write CSV with proper quoting
    with OUT.open("w", newline="") as f:
        writer = csv.writer(f, quoting=csv.QUOTE_ALL)  # enforce quotes
        writer.writerow(["text", "labels"])
        writer.writerows(rows)

    print(f"✅ Wrote {len(rows)} rows to {OUT}")

if __name__ == "__main__":
    main()
