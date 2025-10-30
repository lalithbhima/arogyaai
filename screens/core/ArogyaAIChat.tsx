import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
type Role = "user" | "assistant" | "system";
interface Msg {
  id: string;
  role: Role;
  content: string;
  ts: number;
}

export default function ArogyaAIChat({ navigation }: any) {
  const BASE_URL =
    Platform.OS === "ios" ? "http://192.168.1.138:5040" : "http://10.0.2.2:5040";

  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "sys-1",
      role: "assistant",
      ts: Date.now(),
      content:
        "👋 Hi, I’m ArogyaAI, your personal health companion. Ask me any health question — I can help explain conditions, lab results, treatments, and preventive care.\n\n> Remember: I’m not a doctor and can’t assist in emergencies. If it’s urgent, please contact your healthcare provider or local emergency number.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const flatListRef = useRef<FlatList<Msg>>(null);

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, typing]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? draft).trim();
    if (!content || sending) return;

    const userMsg: Msg = {
      id: `u-${Date.now()}`,
      role: "user",
      content,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
    setSending(true);
    setTyping(true);

    try {
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].slice(-12).map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });
      const data = await res.json();
      const aiMsg: Msg = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.reply || "I’m still learning, but I’ll do my best to help!",
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      const fail: Msg = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content:
          "⚠️ I couldn’t connect to ArogyaAI right now. Try again later — I’ll be here for you.",
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, fail]);
    } finally {
      setSending(false);
      setTyping(false);
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  const renderMessage = ({ item }: any) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          s.msgBubble,
          isUser ? s.userBubble : s.aiBubble,
          { alignSelf: isUser ? "flex-end" : "flex-start" },
        ]}
      >
        <Text
          style={[s.msgText, isUser ? s.userText : s.aiText]}
        >
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <LinearGradient colors={["#dff3ff", "#f7fdff", "#e0fff6"]} style={s.bg}>
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
            <Ionicons name="chevron-back" size={26} color="#2278f9" />
          </TouchableOpacity>
          <Text style={s.header}>ArogyaAI Chat 💬</Text>
        </View>

        {/* Chat Window */}
        <View style={s.chatBox}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 20 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
          {typing && (
            <View style={s.thinking}>
              <ActivityIndicator size="small" color="#22b497" />
              <Text style={s.thinkingText}>ArogyaAI is thinking...</Text>
            </View>
          )}
        </View>

        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 10}
        >
          <View style={s.inputRow}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Ask anything about your health..."
              placeholderTextColor="#89a6b5"
              style={s.input}
              multiline
              returnKeyType="send"
              onSubmitEditing={() => sendMessage()}
            />
            <TouchableOpacity
              style={[s.sendBtn, sending && { opacity: 0.6 }]}
              onPress={() => sendMessage()}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="send" size={22} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 12,
  },
  back: { padding: 4 },
  header: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1d68af",
    marginLeft: 10,
  },
  chatBox: {
    flex: 1,
    backgroundColor: "#faffff",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingBottom: 70,
    shadowColor: "#d0f0ff",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  msgBubble: {
    maxWidth: "80%",
    borderRadius: 18,
    padding: 12,
    marginVertical: 6,
  },
  aiBubble: {
    backgroundColor: "#eaf6ff",
  },
  userBubble: {
    backgroundColor: "#2278f9",
  },
  msgText: { fontSize: 15, lineHeight: 20 },
  aiText: { color: "#1b3e6e" },
  userText: { color: "#fff" },
  thinking: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 5,
    marginLeft: 10,
  },
  thinkingText: {
    color: "#23a7a0",
    marginLeft: 8,
    fontStyle: "italic",
    fontSize: 13.5,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    shadowColor: "#cbeafe",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    marginTop: 6,
    marginBottom: Platform.OS === "ios" ? 6 : 4,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    color: "#1b3e6e",
    fontSize: 15,
  },
  sendBtn: {
    backgroundColor: "#22b497",
    borderRadius: 50,
    padding: 10,
    marginLeft: 8,
  },
});
