import React, { useState, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";


export default function MentalHealthScreen({ navigation }: any) {
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "ai",
      text: "Hi there 👋 I’m your ArogyaAI Mental Health companion. How are you feeling today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), sender: "user", text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Replace this with your backend endpoint:
      const res = await fetch("http://192.168.1.138:5001/api/mental_health_chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: data.reply || "I'm here to listen. Tell me more about what’s on your mind.",
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = {
        id: (Date.now() + 2).toString(),
        sender: "ai",
        text: "Hmm, I’m having trouble connecting right now, but you’re not alone. Try again soon 💙",
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  const renderMessage = ({ item }: any) => (
    <View
      style={[
        s.msgBubble,
        item.sender === "user" ? s.userBubble : s.aiBubble,
      ]}
    >
      <Text style={[s.msgText, item.sender === "user" ? s.userText : s.aiText]}>
        {item.text}
      </Text>
    </View>
  );

    return (
    <LinearGradient colors={["#dff3ff", "#f7fdff", "#e0fff6"]} style={s.bg}>
        <SafeAreaView style={s.safe}>
        {/* Header */}
        <View style={s.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
            <Ionicons name="chevron-back" size={26} color="#2278f9" />
            </TouchableOpacity>
            <Text style={s.header}>Mental Health AI</Text>
        </View>

        {/* Chat area */}
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
        {loading && (
            <View style={s.thinking}>
            <ActivityIndicator size="small" color="#22b497" />
            <Text style={s.thinkingText}>ArogyaAI is thinking...</Text>
            </View>
        )}
        </View>

        {/* Input area (will rise with keyboard) */}
        <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 10}
        >
        <View style={[s.inputRow, { marginBottom: Platform.OS === "ios" ? 6 : 4 }]}>
            <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your thoughts..."
            placeholderTextColor="#89a6b5"
            style={s.input}
            multiline
            />
            <TouchableOpacity style={s.sendBtn} onPress={sendMessage}>
            <Ionicons name="send" size={22} color="#fff" />
            </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
        </SafeAreaView>
    </LinearGradient>
    );
}

/* --- STYLES --- */
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
    paddingVertical: 0,
  },
  msgBubble: {
    maxWidth: "80%",
    borderRadius: 18,
    padding: 12,
    marginVertical: 6,
  },
  aiBubble: {
    backgroundColor: "#eaf6ff",
    alignSelf: "flex-start",
  },
  userBubble: {
    backgroundColor: "#2278f9",
    alignSelf: "flex-end",
  },
  msgText: { fontSize: 15, lineHeight: 20 },
  aiText: { color: "#1b3e6e" },
  userText: { color: "#fff" },
  thinking: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 0,
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
    borderRadius: 20,
    paddingHorizontal: 12,
    shadowColor: "#cbeafe",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
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
   inputContainer: {
   backgroundColor: "transparent",
   paddingBottom: Platform.OS === "ios" ? 6 : 10,
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
    },
});
