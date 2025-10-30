// src/screens/core/AssistantScreen.tsx
import React, { useState } from "react";
import { View, Text, Button, TextInput, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { Modules } from "../../data/modules";
import { TRIAGE } from "../../data/triage";
// helper: run triage on collected answers
function getTriageResult(answers: Record<string, any>) {
  for (let rule of TRIAGE) {
    const cond = rule.if;
    if (cond.anyOf && cond.anyOf.some((k: string) => answers[k])) return rule;
    if (cond.allOf && cond.allOf.every((k: string) => answers[k])) return rule;
    if (cond.eq && answers[cond.eq[0]] === cond.eq[1]) return rule;
  }
  return null;
}

export default function AssistantScreen() {
  const navigation = useNavigation();
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [step, setStep] = useState(0);
  const [order, setOrder] = useState(Modules); // dynamic module order

  const module = order[step];

  const updateAnswer = (id: string, value: any) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  // 🔹 AI-enhanced chief complaint handler
  const onChiefEntered = async (text: string) => {
    updateAnswer("chief", text);

    try {
      const res = await axios.post("http://<YOUR_LOCAL_IP>:5053/nlp/route", {
        text,
        top_k: 8,
        threshold: 0.0,
      });

      const labels: string[] = res.data?.labels || [];
      updateAnswer("nlp_labels", labels);

      const yes = (k: string) => updateAnswer(k, true);
      const L = new Set(labels.map(l => l.toLowerCase()));

      if (L.has("chest_pain") || L.has("cardio") || L.has("heart_attack")) yes("cp_flag");
      if (L.has("resp") || L.has("asthma") || L.has("copd") || L.has("pneumonia") || L.has("covid")) yes("resp_flag");
      if (L.has("neuro") || L.has("stroke") || L.has("seizure") || L.has("migraine")) yes("neuro_flag");
      if (L.has("endocrine") || L.has("diabetes") || L.has("thyroid")) yes("endocrine_flag");
      if (L.has("id") || L.has("malaria") || L.has("hepatitis") || L.has("dengue") || L.has("hiv")) yes("id_flag");
      if (L.has("onc") || L.has("cancer") || L.has("skin_cancer")) yes("onc_flag");
      if (L.has("gi") || L.has("gerd") || L.has("gastritis") || L.has("ibs") || L.has("ulcer")) yes("gi_flag");
      if (L.has("msk") || L.has("back_pain") || L.has("gout") || L.has("osteoarthritis")) yes("msk_flag");
      if (L.has("mental") || L.has("depression") || L.has("anxiety") || L.has("ptsd") || L.has("bipolar") || L.has("schizophrenia")) yes("mh_flag");
      if (L.has("peds")) yes("peds_flag");
      if (L.has("travel")) yes("travel_flag");

      // rebuild module order with new hints
      setOrder([...Modules]); // you can add smarter reordering logic here
    } catch (e) {
      console.log("nlp route error", e);
    }
  };

  const handleNext = () => {
    if (step < order.length - 1) {
      setStep(step + 1);
    } else {
      // ✅ Done → navigate to summary
      const triage = getTriageResult(answers);
      navigation.navigate("AssistantSummary", {
        responses: answers,
        plan: {
          triage: triage?.severity?.toUpperCase() || "ROUTINE",
          differential: [], // fill later with ddx logic if you want
          recommendations: [],
          when_to_seek_care: triage ? [triage.action.message] : [],
          prevention: [],
        },
      });
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
        {module.title}
      </Text>

      {module.questions.map(q => (
        <View key={q.id} style={{ marginVertical: 10 }}>
          <Text style={{ fontSize: 16, marginBottom: 6 }}>{q.prompt}</Text>

          {/* Render text input for chief complaint */}
          {q.id === "chief" ? (
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 8,
                borderRadius: 6,
              }}
              value={answers.chief || ""}
              onChangeText={onChiefEntered}
              placeholder="e.g., chest pain, cough, fever"
            />
          ) : (
            <>
              {/* Placeholder yes/no buttons for now */}
              <Button title="Yes" onPress={() => updateAnswer(q.id, true)} />
              <Button title="No" onPress={() => updateAnswer(q.id, false)} />
            </>
          )}
        </View>
      ))}

      <Button
        title={step < order.length - 1 ? "Next" : "Finish"}
        onPress={handleNext}
      />
    </ScrollView>
  );
}
