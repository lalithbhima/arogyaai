import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Dimensions,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  LineChart,
  Grid,
  XAxis,
  YAxis,
} from "react-native-svg-charts";
import { Defs, LinearGradient as SvgGrad, Stop, Circle, G, Line, Text as SvgText } from "react-native-svg";
import * as shape from "d3-shape";

export default function LabsScreen({ navigation }: any): JSX.Element {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendResponse, setTrendResponse] = useState("");
  const [series, setSeries] = useState<any>({});
  const BASE_URL = "http://192.168.1.138:5002";
  const screenWidth = Dimensions.get("window").width - 70;

  // ---- Analyze Lab Data ----
  const analyzeLab = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setAiResponse("");
    try {
      const res = await fetch(`${BASE_URL}/api/labs_ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setAiResponse(data.reply || "I'm still learning to interpret that report.");
    } catch {
      setAiResponse("⚠️ Network error — please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ---- View Trend Insights ----
  const viewTrends = async () => {
    if (!input.trim()) {
      Alert.alert("Enter Data", "Please paste your lab results first.");
      return;
    }
    setTrendLoading(true);
    setTrendResponse("");
    setSeries({});
    try {
      const res = await fetch(`${BASE_URL}/api/labs_trends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setTrendResponse(data.reply || "No trend insights available yet.");
      setSeries(data.series || {});
    } catch {
      setTrendResponse("⚠️ Could not fetch trends — please try again later.");
    } finally {
      setTrendLoading(false);
    }
  };

  // ---- Line Chart Component ----
    // ---- Line Chart Component (centered user value) ----
    const TrendChart = ({ title, data, color }: any) => {
    if (!data || !data.length) return null;

    // --- compute values and labels ---
    const values = data.map((d: any) => d.v);
    const lastIndex = Math.floor(values.length / 2); // center index
    const labels = data.map((_, i: number) => {
        const offset = i - lastIndex;
        return offset === 0 ? "Now" : offset > 0 ? `+${offset}` : `${offset}`;
    });

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const current = values[lastIndex];
    const riskColor =
        current > avg * 1.2 ? "#ef4444" : current < avg * 0.8 ? "#22b497" : "#facc15";

    const Decorator = ({ x, y, data }: any) => (
        <G>
        {data.map((value: number, index: number) => (
            <Circle
            key={index}
            cx={x(index)}
            cy={y(value)}
            r={index === lastIndex ? 5 : 3}
            stroke={index === lastIndex ? "#000" : color}
            fill={index === lastIndex ? "#fff" : color}
            strokeWidth={index === lastIndex ? 2 : 1.5}
            />
        ))}
        </G>
    );

    const Tooltip = ({ x, y, data }: any) => (
        <G x={x(lastIndex)} y={y(data[lastIndex])}>
        <Line y1={0} y2={150} stroke={riskColor} strokeDasharray={[4, 4]} />
        <SvgText
            x={-25}
            y={-10}
            fontSize="12"
            fill={riskColor}
            fontWeight="600"
        >
            {data[lastIndex].toFixed(1)}
        </SvgText>
        </G>
    );

    const Gradient = () => (
        <Defs key="gradient">
        <SvgGrad id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity={0.1} />
        </SvgGrad>
        </Defs>
    );

    return (
        <View style={s.chartContainer}>
        <Text style={s.chartTitle}>{title}</Text>
        <View style={{ flexDirection: "row", height: 200 }}>
            <YAxis
            data={values}
            contentInset={{ top: 20, bottom: 20 }}
            svg={{ fontSize: 10, fill: "#678", fontWeight: "500" }}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
            <LineChart
                style={{ flex: 1 }}
                data={values}
                svg={{ stroke: color, strokeWidth: 3, fill: "url(#grad)" }}
                contentInset={{ top: 20, bottom: 20 }}
                curve={shape.curveBasis}
                animate
                animationDuration={800}
            >
                <Gradient />
                <Grid svg={{ strokeDasharray: [3, 3], stroke: "#dde9f5" }} />
                <Decorator />
                <Tooltip />
            </LineChart>
            <XAxis
                style={{ marginHorizontal: -10, marginTop: 5 }}
                data={labels}
                formatLabel={(v) => labels[v]}
                contentInset={{ left: 15, right: 15 }}
                svg={{ fontSize: 10, fill: "#789", fontWeight: "500" }}
            />
            </View>
        </View>
        <Text style={s.chartInsight}>
            {`Current: ${current.toFixed(1)} | Avg: ${avg.toFixed(1)} → ${
            current > avg ? "↑ Improving" : "↓ Slight decline"
            }`}
        </Text>
        </View>
    );
    };

  const renderCharts = () => {
    if (!series || Object.keys(series).length === 0) return null;
    const colors = ["#2278f9", "#22b497", "#f97316", "#dc2626"];
    return Object.keys(series).map((key, i) => (
      <TrendChart
        key={key}
        title={key}
        data={series[key]}
        color={colors[i % colors.length]}
      />
    ));
  };

  return (
    <LinearGradient colors={["#dcf4ff", "#f7fdff", "#e4fff5"]} style={s.bg}>
      <SafeAreaView style={s.safe}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={26} color="#2278f9" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>AI Labs & Diagnostics</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 200 }} showsVerticalScrollIndicator={false}>
          {/* Analyzer */}
          <View style={s.card}>
            <View style={s.iconWrap}>
              <Ionicons name="flask-outline" size={34} color="#22b497" />
            </View>
            <Text style={s.cardTitle}>AI Lab Analyzer</Text>
            <Text style={s.cardDesc}>
              Paste or describe your lab results (e.g. “HbA1c: 6.2%, LDL: 145 mg/dL”) for instant,
              human-style AI interpretation in plain language.
            </Text>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
            >
              <TextInput
                placeholder="Paste your lab report text here..."
                placeholderTextColor="#9ab3bf"
                value={input}
                onChangeText={setInput}
                multiline
                style={s.input}
              />
              <TouchableOpacity style={s.btn} onPress={analyzeLab}>
                <Ionicons name="sparkles-outline" size={18} color="#fff" />
                <Text style={s.btnTxt}>Analyze with AI</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>

            {loading && (
              <View style={s.loading}>
                <ActivityIndicator size="small" color="#23b7a0" />
                <Text style={s.loadingTxt}>Analyzing biomarkers...</Text>
              </View>
            )}
            {aiResponse !== "" && (
              <View style={s.responseBox}>
                <Text style={s.responseTitle}>AI Interpretation</Text>
                <Text style={s.responseText}>{aiResponse}</Text>
              </View>
            )}
          </View>

          {/* Trends */}
          <View style={s.card}>
            <View style={s.iconWrap}>
              <Ionicons name="pulse-outline" size={34} color="#2563eb" />
            </View>
            <Text style={s.cardTitle}>Trend Insights</Text>
            <Text style={s.cardDesc}>
              Track key biomarkers and visualize improvements or early health risks.
            </Text>
            <TouchableOpacity
              style={[s.btn, { backgroundColor: "#2278f9" }]}
              onPress={viewTrends}
              disabled={trendLoading}
            >
              {trendLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="stats-chart-outline" size={18} color="#fff" />
                  <Text style={s.btnTxt}>View Trends</Text>
                </>
              )}
            </TouchableOpacity>

            {trendResponse !== "" && (
              <View style={s.responseBox}>
                <Text style={s.responseTitle}>AI Trend Insight</Text>
                <Text style={s.responseText}>{trendResponse}</Text>
              </View>
            )}

            {renderCharts()}
          </View>

          {/* Privacy */}
          <View style={s.card}>
            <View style={s.iconWrap}>
              <Ionicons name="shield-checkmark-outline" size={34} color="#23a7a0" />
            </View>
            <Text style={s.cardTitle}>Data Privacy Guarantee</Text>
            <Text style={s.cardDesc}>
              Your lab data stays encrypted locally. AI runs entirely on-device or private ArogyaAI servers.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ---- Styles ----
const s = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 18 },
  headerRow: { flexDirection: "row", alignItems: "center", marginTop: 10, marginBottom: 14 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#1d68af", marginLeft: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 22,
    marginBottom: 18,
    shadowColor: "#cbeafe",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
  },
  iconWrap: {
    backgroundColor: "#eaf6ff",
    width: 52,
    height: 52,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#1b3e6e" },
  cardDesc: { fontSize: 14, color: "#527389", marginBottom: 12, lineHeight: 20 },
  input: {
    backgroundColor: "#f0f9ff",
    borderRadius: 16,
    padding: 12,
    minHeight: 80,
    fontSize: 15,
    color: "#1b3e6e",
    marginBottom: 10,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#23b7a0",
    borderRadius: 14,
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginTop: 4,
  },
  btnTxt: { color: "#fff", fontWeight: "700", fontSize: 15, marginLeft: 6 },
  loading: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  loadingTxt: { marginLeft: 10, color: "#1b3e6e", fontSize: 14 },
  responseBox: {
    backgroundColor: "#f5faff",
    padding: 14,
    borderRadius: 14,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#23b7a0",
  },
  responseTitle: { fontSize: 16, fontWeight: "700", color: "#1d68af", marginBottom: 4 },
  responseText: { fontSize: 14, color: "#325c7e", lineHeight: 20 },
  chartContainer: {
    backgroundColor: "#f8fcff",
    padding: 10,
    borderRadius: 12,
    borderColor: "#e1f2ff",
    borderWidth: 1,
    marginTop: 12,
  },
  chartTitle: { fontSize: 14, fontWeight: "700", color: "#1b3e6e", marginBottom: 6 },
  chartInsight: {
    fontSize: 13,
    color: "#325c7e",
    fontStyle: "italic",
    marginTop: 8,
    textAlign: "center",
  },
});
