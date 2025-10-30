import React, { useRef, useEffect, useState } from "react";
import {
  Keyboard,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { app } from "../../firebaseConfig";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import ReactNativeBiometrics from "react-native-biometrics";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FaceIdSVG from "../../FaceIdSVG";
const auth = getAuth(app);
const rnBiometrics = new ReactNativeBiometrics();

export default function AuthScreen(props: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup" | null>(null); // will be set by user check
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);
  const [checkingUser, setCheckingUser] = useState(true);
  const autoPromptedRef = useRef(false); // To prevent repeat auto-prompt in session

  // On first mount, decide which mode to show
  useEffect(() => {
    const checkUserStatus = async () => {
      const savedEmail = await AsyncStorage.getItem("savedEmail");
      const savedPassword = await AsyncStorage.getItem("savedPassword");
      const hasUsedBiometric = await AsyncStorage.getItem("hasUsedBiometric");
      const hasSignedUp = await AsyncStorage.getItem("hasSignedUp");

      // 🧭 Determine mode
      if (!hasSignedUp && !savedEmail && !hasUsedBiometric) {
        setMode("signup"); // brand-new user
      } else {
        setMode("login"); // returning user
      }

      // 🟢 Prefill saved credentials (but do NOT auto-login yet)
      if (savedEmail) setEmail(savedEmail);
      if (savedPassword) setPassword(savedPassword);

      setCheckingUser(false);
    };
    checkUserStatus();
  }, []);

  // Check biometrics on mount AND every time mode changes to 'login'
  useEffect(() => {
    if (mode === "login") {
      rnBiometrics.isSensorAvailable()
        .then(resultObject => {
          const { available, biometryType } = resultObject;
          setBiometricAvailable(
            !!available && (
              biometryType === "TouchID" ||
              biometryType === "FaceID" ||
              biometryType === "Biometrics"
            )
          );
        })
        .catch(() => setBiometricAvailable(false));
    }
    // When entering signup mode, ensure biometricAvailable is off
    if (mode === "signup") {
      setBiometricAvailable(false);
    }
  }, [mode]);

  // Auto-prompt FaceID/Biometrics after the first successful login
  useEffect(() => {
    const maybePromptBiometric = async () => {
      if (
        mode === "login" &&
        biometricAvailable &&
        !autoPromptedRef.current
      ) {
        const hasUsedBiometric = await AsyncStorage.getItem("hasUsedBiometric");
        if (hasUsedBiometric === "true") {
          autoPromptedRef.current = true;
          try {
            await handleBiometricLogin();
          } catch (err) {
            console.log("⚠️ Biometric failed, staying on login screen");
            // Do nothing — user stays on login screen
          }
        }
      }
    };

    maybePromptBiometric(); // ✅ <---- this line was missing

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, biometricAvailable]);

  // Use user's saved credentials for biometric login
  const handleBiometricLogin = async () => {
    console.log("🟣 Biometric prompt starting…");
    try {
      const { available } = await rnBiometrics.isSensorAvailable();
      if (!available) {
        Alert.alert("No biometric hardware found");
        return;
      }

      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: "Log in with Face ID / Touch ID / Biometrics",
        cancelButtonText: "Cancel",
      });

      if (success) {
        // ✅ Biometric success → load credentials and login
        let savedEmail = await AsyncStorage.getItem("savedEmail");
        let savedPassword = await AsyncStorage.getItem("savedPassword");

        if (!savedEmail || !savedPassword) {
          Alert.alert("No stored credentials found", "Please log in manually first.");
          return;
        }

        setEmail(savedEmail);
        setPassword(savedPassword);
        handleLogin(savedEmail, savedPassword);
      } else {
        // ❌ User cancelled biometric prompt → clear inputs
        console.log("🚫 Biometric cancelled by user");
        setEmail("");
        setPassword("");
      }
    } catch (e: any) {
      console.log("❌ Biometric auth failed", e?.message);
      Alert.alert("Biometric auth failed", e?.message || "Unknown error");

      // ❌ On biometric failure → clear email & password fields
      setEmail("");
      setPassword("");
    }
  };

  // Store credentials & flag on successful login
  const handleLogin = async (e = email, p = password) => {
    console.log("🔵 handleLogin called", e, p); // ✅ ADD HERE
    setLoading(true);
    try {
      console.log("🟢 Attempting Firebase login…"); // ✅ ADD HERE
      await signInWithEmailAndPassword(auth, e, p);
      console.log("✅ Firebase login success"); // ✅ ADD HERE
      await AsyncStorage.setItem("savedEmail", e);
      await AsyncStorage.setItem("savedPassword", p);
      await AsyncStorage.setItem("hasUsedBiometric", "true"); // <--- set flag

      if (typeof props.onAuthSuccess === "function") {
        props.onAuthSuccess();
      }
    } catch (err: any) {
      console.log("[Firebase Login Error]", err);
      Alert.alert("Login failed", err.message);
    }
    setLoading(false);
  };

  // DO NOT store credentials or enable FaceID after signup
    const handleSignup = async () => {
      setLoading(true);
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert("Welcome!", "Let's personalize your ArogyaAI profile.");

        // ✅ Save user credentials & flags for next launch
        await AsyncStorage.multiSet([
          ["hasSignedUp", "true"],
          ["savedEmail", email],
          ["savedPassword", password],
          ["hasUsedBiometric", "true"]
        ]);

        Keyboard.dismiss();
        props.navigation.replace("Onboarding");
      } catch (err: any) {
        console.log("[Firebase Signup Error]", err);
        Alert.alert("Signup failed", err.message);
      }
      setLoading(false);
    };


  // Loader while checking if user is new or returning
  if (checkingUser || !mode) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#23c07e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>ArogyaAI</Text>
      <Text style={styles.title}>{mode === "login" ? "Welcome back!" : "Create your account"}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        autoCapitalize="none"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        returnKeyType="go"
        onSubmitEditing={() => (mode === "login" ? handleLogin() : handleSignup())}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => (mode === "login" ? handleLogin() : handleSignup())}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {mode === "login" ? "Log In" : "Sign Up"}
          </Text>
        )}
      </TouchableOpacity>

      {/* Face ID/Touch ID/Biometrics Button */}
      {mode === "login" && (Platform.OS === "ios" || Platform.OS === "android") && biometricAvailable && (
        <TouchableOpacity onPress={handleBiometricLogin} style={styles.faceBtn}>
          <FaceIdSVG size={28} color="#23c07e" />
          <Text style={styles.faceBtnText}>
            Login with Face ID
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={async () => {
          if (mode === "login") {
            setMode("signup");
            autoPromptedRef.current = false;
            // Clear Face ID flags and credentials when going to signup!
            await AsyncStorage.removeItem("savedEmail");
            await AsyncStorage.removeItem("savedPassword");
            await AsyncStorage.removeItem("hasUsedBiometric");
            setBiometricAvailable(false);
          } else {
            setMode("login");
            autoPromptedRef.current = false;
          }
        }}
        style={{ marginTop: 16 }}
      >
        <Text style={styles.switchMode}>
          {mode === "login"
            ? "Don't have an account? Sign Up"
            : "Already have an account? Log In"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e7f3fb", alignItems: "center", justifyContent: "center", padding: 18 },
  logo: { fontSize: 40, fontWeight: "bold", color: "#246fff", marginBottom: 22 },
  title: { fontSize: 22, fontWeight: "700", color: "#232b50", marginBottom: 18 },
  input: { width: "92%", height: 50, borderColor: "#c6e2ff", borderWidth: 1.5, borderRadius: 13, marginBottom: 12, paddingHorizontal: 15, fontSize: 17, backgroundColor: "#fff" },
  button: { backgroundColor: "#23c07e", padding: 14, borderRadius: 14, alignItems: "center", marginTop: 7, width: "92%" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  switchMode: { color: "#258cff", fontWeight: "600", fontSize: 15 },
  faceBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    backgroundColor: "#e4fbf2",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 9,
    shadowColor: "#23c07e",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
  },
  faceBtnText: { marginLeft: 10, fontSize: 16, color: "#23c07e", fontWeight: "700" },
});
