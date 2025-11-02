# 🌿 ArogyaAI — Intelligent Health Companion App

ArogyaAI is a multilingual, AI-powered mobile health assistant designed to make preventive care, diagnostics, and health education accessible for everyone. Built with **React Native**, it empowers users to manage their wellness, understand symptoms, schedule reminders, and access ethical, family-centric, and global health resources — all in one app.

---

## 🧠 Overview

ArogyaAI provides personalized, research-backed health guidance using intelligent tools that combine **AI**, **image enhancement**, and **data-driven insights**.  
The app was created for the **Congressional App Challenge (CAC)** to demonstrate how AI can bring equitable healthcare access to underserved communities.

---

## ✨ Key Features

### 🩺 Core Health Tools
- **Symptom Checker Chat** – Interactive AI assistant that adapts questions dynamically to guide users to the right care path.  
- **Imaging AI** – Upload X-rays or skin images; the app enhances low-resolution scans and generates detailed heatmaps.  
- **Immune Risk Screen** – Uses a CNN-based classifier to analyze risk factors and generate visual results.  
- **Health Passport** – Digital record of conditions, immunizations, and doctor visits.

### 🗓️ Daily Life & Care
- **Reminders & Scheduler** – Set medication, appointment, and wellness reminders with smart notifications.  
- **Calendar Integration** – View all health events and reminders in one timeline.  
- **Chronic Care Tracker** – Track blood pressure, sugar, mood, and more over time.

### 🌍 Education & Community
- **ArogyaAI Academy** – Learn about preventive health and chronic care through interactive lessons.  
- **Global Health Mode** – Real-time updates on outbreaks, vaccines, and WHO advisories.  
- **Ethics & Family Mode** – Access ethical guidelines, family sharing options, and emergency contacts.

---

## 📱 Screens Structure

```bash
screens/
├── core/
│ ├── AddMemberScreen.tsx
│ ├── ArogyaAIChat.tsx
│ ├── AssistantScreen.tsx
│ ├── AssistantSummary.tsx
│ ├── CalendarScreen.tsx
│ ├── HealthAssistantScreen.tsx
│ ├── HomeScreen.tsx
│ ├── ImagingScreen.tsx
│ ├── LabsScreen.tsx
│ ├── MoreFeaturesScreen.tsx
│ ├── OnboardingScreen.tsx
│ ├── PassportProfile.tsx
│ ├── PassportScreen.tsx
│ ├── ProfileDetailScreen.tsx
│ ├── SettingScreen.tsx
│ ├── SettingsDetailScreen.tsx
│ └── SkinCancerScreen.tsx
│
├── modules/
│ ├── AllergyScreen.tsx
│ ├── EthicsDetailScreen.tsx
│ ├── EthicsScreen.tsx
│ ├── FitnessScreen.tsx
│ ├── GlobalHealthScreen.tsx
│ ├── HealthNewsScreen.tsx
│ ├── MentalHealthScreen.tsx
│ ├── NutritionScreen.tsx
│ ├── PediatricScreen.tsx
│ ├── RecordImportScreen.tsx
│ ├── SleepScreen.tsx
│ ├── SupportScreen.tsx
│ ├── TutorialGlobalScreen.tsx
│ ├── TutorialHomeScreen.tsx
│ ├── TutorialLabsScreen.tsx
│ └── TutorialPrivacyScreen.tsx
│
├── onboarding/
│ ├── AuthScreen.tsx
│ ├── LanguagePickerScreen.tsx
│ └── WelcomeScreen.tsx
│
├── types/
├── utils/
└── vendor/

```


Each screen represents a functional module (AI chat, education, imaging, or wellness) under a clean, scalable architecture.

---

## 🧩 Tech Stack

| Category | Technology |
|-----------|-------------|
| Framework | **React Native** |
| Backend AI | **Python + Flask + TensorFlow/PyTorch (CNN)** |
| Styling & UI | **Tailwind + shadcn/ui + LinearGradient + Lottie Animations** |
| State & Navigation | **@react-navigation (stack / tabs)** |
| Image Processing | **react-native-image-picker**, **react-native-fs**, **react-native-share** |
| Data Storage | **AsyncStorage**, optional SQLite |
| Localization | **i18n-js** (multi-language support) |
| Dev Tools | **TypeScript**, **ESLint**, **Prettier**, **Jest** |
| Deployment | **Expo (iOS / Android)** |

---

## 🧪 AI & ML Integration

ArogyaAI’s backend integrates trained convolutional neural networks (CNNs) to analyze medical images.

**Backend files:**
- `gradcam.py`, `batch_gradcam.py` — Grad-CAM visualization pipeline  
- `test.py` — quick inference script  
- `HAM10000_metadata.csv` — benchmark dataset reference  
- `loss_curve.png`, `gradcam_result.jpg` — model results  

**Endpoints (Flask):**
- `/predict` — returns classification + confidence  
- `/enhance` — improves image clarity  
- `/heatmap` — overlays Grad-CAM visualization  

Frontend communicates via REST (`axios`) through `API_BASE` in `ImagingScreen.tsx`.

---

## 🔒 Privacy & Ethics

ArogyaAI follows strict **Ethical AI principles**:
- All analysis runs **locally or through encrypted APIs**.  
- No identifiable user data is stored or shared externally.  
- Designed **for education and screening**, **not** medical diagnosis.

---

## 🌐 Multi-Language Support

All text visible to users is wrapped with `{i18n.t("...")}` for seamless translation.  
Languages (current + planned): English 🇺🇸, Spanish 🇪🇸, Hindi 🇮🇳, Telugu 🇮🇳, French 🇫🇷.

---

## 🚀 Setup & Run

### 1️⃣ Frontend (Expo)
```bash
git clone https://github.com/lalithbhima/arogyaAI.git
cd arogyaAI
npm install
npx expo start
```

### 2️⃣ Backend (AI Server)
```bash
cd backend
pip install -r requirements.txt
python app.py
```

---

## 🏆 Recognition Goals

- 🥇 **Congressional App Challenge 2025** — AI + Healthcare Innovation  

---

## 📂 Repository Highlights

| Folder | Description |
|---------|-------------|
| `/screens/` | All React Native screens (core features, modules, onboarding flow) |
| `/utils/` | Shared helpers, hooks, and i18n configuration |
| `/vendor/` | External or third-party component integrations |
| `/backend/` | Python AI model files and Flask API endpoints |
| `/types/` | TypeScript interfaces and data models |
| `/assets/` | App icons, images, and animations (if added) |

---

## 📄 License

MIT License © 2025 [Lalith Bhima](https://github.com/lalithbhima)

---

## 💬 Contact

**Email:** 

lalithendrareddy.bhima@gmail.com 

bhavika.bhima@gmail.com

**GitHub:** [@lalithbhima](https://github.com/lalithbhima)

---

> _“ArogyaAI combines compassion and computation to bring accessible, ethical healthcare to everyone.”_




