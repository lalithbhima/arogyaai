import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StatusBar, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import I18n, { setI18nConfig } from "./utils/i18n";

// Core Screens
import WelcomeScreen from "./screens/onboarding/WelcomeScreen";
import AuthScreen from "./screens/onboarding/AuthScreen";
import HomeScreen from "./screens/core/HomeScreen";
import PassportScreen from "./screens/core/PassportScreen";
import MoreFeaturesScreen from "./screens/core/MoreFeaturesScreen";
import HealthAssistantScreen from "./screens/core/HealthAssistantScreen";
import AssistantSummary from "./screens/core/AssistantSummary";
import PassportProfile from "./screens/core/PassportProfile";
import CalendarScreen from "./screens/core/CalendarScreen";
import SettingScreen from "./screens/core/SettingScreen";
import OnboardingScreen from "./screens/core/OnboardingScreen";
import ArogyaAIChat from "./screens/core/ArogyaAIChat";

// Modules (if you want to deep-link or push from MoreFeaturesScreen)
import LabsScreen from "./screens/core/LabsScreen";
import GlobalHealthScreen from "./screens/modules/GlobalHealthScreen";
import EthicsScreen from "./screens/modules/EthicsScreen";
import ImagingScreen from "./screens/core/ImagingScreen";
import SkinCancerScreen from "./screens/core/SkinCancerScreen";
import MentalHealthScreen from "./screens/modules/MentalHealthScreen";
import PediatricScreen from "./screens/modules/PediatricScreen";
import NutritionScreen from "./screens/modules/NutritionScreen";
import RecordImportScreen from "./screens/modules/RecordImportScreen";
import EthicsDetailScreen from "./screens/modules/EthicsDetailScreen";
import SupportScreen from "./screens/modules/SupportScreen";
import TutorialHomeScreen from "./screens/modules/TutorialHomeScreen";
import TutorialPrivacyScreen from "./screens/modules/TutorialPrivacyScreen";
import TutorialLabsScreen from "./screens/modules/TutorialLabsScreen";
import TutorialGlobalScreen from "./screens/modules/TutorialGlobalScreen";
import FitnessScreen from "./screens/modules/FitnessScreen";
import AllergyScreen from "./screens/modules/AllergyScreen";
import SleepScreen from "./screens/modules/SleepScreen";
import HealthNewsScreen from "./screens/modules/HealthNewsScreen";

// Navigation Types
export type RootStackParamList = {
  Welcome: undefined;
  Auth: undefined;
  Main: undefined;
  Labs: undefined;
  GlobalHealth: undefined;
  ChronicCare: undefined;
  ImmuneTools: undefined;
  FamilyMode: undefined;
  Ethics: undefined;
  Imaging: undefined;
  Academy: undefined;
  LabsScreen: undefined;
  PassportProfile: { profile: any };
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

function MainTabs(): JSX.Element {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "#b2c6e0",
        tabBarStyle: {
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          height: 65,
          backgroundColor: "#f6fbff",
          shadowColor: "#1d98e4",
          shadowOpacity: 0.09,
          shadowOffset: { width: 0, height: -2 },
          borderTopWidth: 0,
          elevation: 10,
        },
        tabBarLabelStyle: { fontWeight: "700", fontSize: 13, marginBottom: 5 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
      <Tab.Screen name="Passport" component={PassportScreen} options={{ title: "Passport" }} />
      <Tab.Screen name="More" component={MoreFeaturesScreen} options={{ title: "More Features" }} />
    </Tab.Navigator>
  );
}

export default function App(): JSX.Element {
  const [isReady, setIsReady] = useState(false);
  const [screen, setScreen] = useState<"welcome" | "auth" | "main">("welcome");

  useEffect(() => {
    async function initialize() {
      try {
        const userLang = await AsyncStorage.getItem("userLang");
        setI18nConfig(userLang);
      } catch (e) {
        setI18nConfig();
      }
      setScreen("welcome");
      setIsReady(true);
    }
    initialize();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fbff" }}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"} />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {screen === "welcome" && (
              <Stack.Screen
                name="Welcome"
                options={{
                  ...TransitionPresets.FadeFromBottomAndroid,
                  gestureEnabled: false,
                }}
              >
                {props => (
                  <WelcomeScreen
                    {...props}
                    onGetStarted={() => setScreen("auth")}
                  />
                )}
              </Stack.Screen>
            )}
            {screen === "auth" && (
              <Stack.Screen
                name="Auth"
                options={{
                  ...TransitionPresets.FadeFromBottomAndroid,
                  gestureEnabled: false,
                }}
              >
                {props => (
                  <AuthScreen
                    {...props}
                    onAuthSuccess={() => setScreen("main")}
                  />
                )}
              </Stack.Screen>
            )}
            {screen === "main" && (
              <Stack.Screen
                name="Main"
                component={MainTabs}
                options={{
                  ...TransitionPresets.FadeFromBottomAndroid,
                }}
              />
            )}
            

            {/* Modular / Extra Feature Screens */}
            <Stack.Screen name="LabsScreen" component={LabsScreen} />
            <Stack.Screen name="GlobalHealth" component={GlobalHealthScreen} />
            <Stack.Screen name="EthicsScreen" component={EthicsScreen} />
            <Stack.Screen name="Imaging" component={ImagingScreen} />
            <Stack.Screen name="ArogyaAIChat" component={ArogyaAIChat} />
            <Stack.Screen name="SkinCancerScreen" component={SkinCancerScreen} />
            <Stack.Screen name="MoreFeaturesScreen" component={MoreFeaturesScreen} />
            <Stack.Screen name="HealthAssistant" component={HealthAssistantScreen} />
            <Stack.Screen name="AssistantSummary" component={AssistantSummary} />
            <Stack.Screen name="PassportProfile" component={PassportProfile} />
            <Stack.Screen name="Calendar" component={CalendarScreen} />
            <Stack.Screen name="Setting" component={SettingScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Passport" component={PassportScreen} />
            <Stack.Screen name="GlobalHealthScreen" component={GlobalHealthScreen} />
            <Stack.Screen name="MentalHealthScreen" component={MentalHealthScreen} />
            <Stack.Screen name="PediatricScreen" component={PediatricScreen} />
            <Stack.Screen name="NutritionScreen" component={NutritionScreen} />
            <Stack.Screen name="RecordImportScreen" component={RecordImportScreen} />
            <Stack.Screen name="EthicsDetail" component={EthicsDetailScreen}
              options={{
                ...TransitionPresets.SlideFromRightIOS,
                headerShown: false,
              }}
            />
            <Stack.Screen name="SupportScreen" component={SupportScreen} />
            <Stack.Screen name="TutorialHomeScreen" component={TutorialHomeScreen} />
            <Stack.Screen name="TutorialPrivacyScreen" component={TutorialPrivacyScreen} />
            <Stack.Screen name="TutorialLabsScreen" component={TutorialLabsScreen} />
            <Stack.Screen name="TutorialGlobalScreen" component={TutorialGlobalScreen} />    
            <Stack.Screen name="FitnessScreen" component={FitnessScreen} />   
            <Stack.Screen name="AllergyScreen" component={AllergyScreen} />    
            <Stack.Screen name="SleepScreen" component={SleepScreen} />
            <Stack.Screen name="HealthNewsScreen" component={HealthNewsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
