import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";


export default function AllergyScreen({ navigation }: any) {
  const [logs, setLogs] = useState<any[]>([]);
  const [symptom, setSymptom] = useState("");
  const [trigger, setTrigger] = useState("");
  const [severity, setSeverity] = useState("Moderate");
  const [notes, setNotes] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [coachLoading, setCoachLoading] = useState(false);
  const [envLoading, setEnvLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [envData, setEnvData] = useState<any>(null);

  const BASE_URL =
    Platform.OS === "ios" ? "http://192.168.1.138:5010" : "http://10.0.2.2:5010";

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/allergy/logs`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      console.warn("Could not load logs");
    }
  };

  // --- Fetch environment info based on user input ---
  const fetchEnvData = async () => {
    if (!location.trim()) {
      Alert.alert("Missing Location", "Please enter a location first.");
      return;
    }
    setEnvLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/allergy/env_ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location }),
      });
      const data = await res.json();
      if (data && data.env) {
        setEnvData(data.env);
        Alert.alert("Success", `Environment data loaded for ${location}`);
      } else {
        Alert.alert("No Data", "Could not retrieve environment info.");
      }
    } catch (e) {
      console.warn("AI environment fetch failed:", e);
      Alert.alert("Error", "Could not fetch environment data.");
    } finally {
      setEnvLoading(false);
    }
  };

  const addLog = async () => {
    if (!symptom && !trigger) {
      Alert.alert("Missing info", "Please enter at least a symptom or trigger.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/allergy/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptom, trigger, severity, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSymptom("");
      setTrigger("");
      setNotes("");
      await fetchLogs();
    } catch (e) {
      Alert.alert("Error", "Could not save entry.");
    } finally {
      setLoading(false);
    }
  };

  // --- Ask AI with environment + logs included ---
  const askAI = async () => {
    setCoachLoading(true);
    setAiResponse("");
    try {
      const questionBase =
        "Please analyze my recent allergy logs and suggest triggers, risk factors, and management strategies.";
      const contextEnv = envData
        ? `Current environment for ${location}: AQI ${envData.aqi} (${envData.unitAqi}), Pollen ${envData.pollen} (${envData.unitPollen}), Humidity ${envData.humidity}%, Temp ${envData.temp}°C.`
        : "No environment data available.";
      const res = await fetch(`${BASE_URL}/api/allergy/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `${questionBase}\n\n${contextEnv}`,
        }),
      });
      const data = await res.json();
      setAiResponse(data.reply || "No response.");
    } catch (e) {
      setAiResponse("⚠️ Unable to reach AI Coach.");
    } finally {
      setCoachLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#eaf6ff", "#f8fff8"]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={26} color="#1b75d0" />
          </TouchableOpacity>
          <Text style={s.title}>Allergy & Asthma Tools</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* --- Manual Location Entry --- */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Enter Location 🌍</Text>
            <TextInput
              style={s.input}
              placeholder="e.g., Sacramento, CA"
              value={location}
              onChangeText={setLocation}
            />
            <TouchableOpacity style={s.primaryBtn} onPress={fetchEnvData} disabled={envLoading}>
              {envLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.primaryTxt}>Fetch Environment</Text>
              )}
            </TouchableOpacity>

            {envData && (
              <View style={{ marginTop: 14 }}>
                <Text style={s.envText}>
                  🌤️ AQI: {envData.aqi} ({envData.unitAqi}) | Pollen: {envData.pollen} ({envData.unitPollen}) | Humidity:{" "}
                  {envData.humidity}% | Temp: {envData.temp}°C
                </Text>
              </View>
            )}
          </View>

          {/* --- Log Section --- */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Log Symptoms & Triggers</Text>

            <Text style={s.label}>Symptom</Text>
            <TextInput
              style={s.input}
              value={symptom}
              onChangeText={setSymptom}
              placeholder="e.g., Sneezing, coughing, chest tightness"
            />

            <Text style={s.label}>Trigger</Text>
            <TextInput
              style={s.input}
              value={trigger}
              onChangeText={setTrigger}
              placeholder="e.g., Pollen, Dust, Pets, Weather"
            />

            <Text style={s.label}>Severity</Text>
            <View style={s.row}>
              {["Low", "Moderate", "Severe"].map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  style={[s.chip, severity === lvl && { backgroundColor: "#cbeeff", borderColor: "#1b75d0" }]}
                  onPress={() => setSeverity(lvl)}
                >
                  <Text
                    style={{
                      color: severity === lvl ? "#1b75d0" : "#35597a",
                      fontWeight: "700",
                    }}
                  >
                    {lvl}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>Notes (optional)</Text>
            <TextInput
              style={[s.input, { minHeight: 60 }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Describe situation or location"
              multiline
            />

            <TouchableOpacity style={s.primaryBtn} onPress={addLog} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryTxt}>Save Log</Text>}
            </TouchableOpacity>
          </View>

          {/* --- Log History --- */}
          <Text style={s.sectionTitle}>Recent Logs</Text>
          {logs.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="cloud-offline-outline" size={26} color="#8aa4c4" />
              <Text style={s.emptyTxt}>No logs yet. Add your first entry above.</Text>
            </View>
          ) : (
            logs.map((l) => (
              <View key={l.id} style={s.logRow}>
                <Ionicons name="alert-circle-outline" size={22} color="#1b75d0" />
                <View style={{ flex: 1 }}>
                  <Text style={s.logText}>
                    {l.symptom || "No symptom"} • {l.trigger || "No trigger"} ({l.severity})
                  </Text>
                  {l.notes ? <Text style={s.logNote}>{l.notes}</Text> : null}
                </View>
              </View>
            ))
          )}

          {/* --- AI Coach --- */}
          <View style={s.card}>
            <Text style={s.cardTitle}>AI Respiratory Coach 🤖</Text>
            <Text style={s.subTxt}>
              Get insights on patterns, risk, and personalized strategies to manage your allergies and asthma.
            </Text>
            <TouchableOpacity style={s.aiBtn} onPress={askAI} disabled={coachLoading}>
              {coachLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryTxt}>Ask AI</Text>}
            </TouchableOpacity>

            {aiResponse ? (
              <View style={s.reply}>
                <Text style={s.replyTxt}>{aiResponse}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 18 },
  header: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  title: { fontSize: 22, fontWeight: "800", color: "#124b8c", marginLeft: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#d8ecff",
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  cardTitle: { fontSize: 17, fontWeight: "800", color: "#124b8c", marginBottom: 8 },
  envText: { fontSize: 13.5, color: "#195a7a", fontWeight: "600" },
  label: { fontWeight: "700", fontSize: 13, color: "#1c406e", marginTop: 10, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#cfe3f5",
    borderRadius: 12,
    padding: 10,
    fontSize: 14,
    color: "#124b8c",
    backgroundColor: "#fbfdff",
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  chip: {
    borderWidth: 1,
    borderColor: "#d0e5f9",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  primaryBtn: {
    backgroundColor: "#1b75d0",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 14,
  },
  primaryTxt: { color: "#fff", fontWeight: "800", fontSize: 15 },
  sectionTitle: { fontSize: 16.5, fontWeight: "800", color: "#124b8c", marginBottom: 10, marginTop: 8 },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7fbff",
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
  },
  logText: { fontWeight: "700", color: "#163f68", fontSize: 13.8 },
  logNote: { fontSize: 12.5, color: "#5b7c95" },
  empty: { alignItems: "center", padding: 16, backgroundColor: "#f3f9ff", borderRadius: 14 },
  emptyTxt: { color: "#527089", marginTop: 6 },
  subTxt: { color: "#4e6a87", fontSize: 13, marginBottom: 10 },
  aiBtn: {
    backgroundColor: "#19a37e",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  reply: {
    backgroundColor: "#f0faff",
    borderLeftWidth: 4,
    borderLeftColor: "#19a37e",
    borderRadius: 12,
    padding: 12,
  },
  replyTxt: { color: "#194f46", fontSize: 13.8, lineHeight: 20 },
});
