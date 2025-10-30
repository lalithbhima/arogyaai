// App.tsx
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StatusBar, Platform } from "react-native";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

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
import ImagingScreen from "./screens/core/ImagingScreen";
import SkinCancerScreen from "./screens/core/SkinCancerScreen";
import LabsScreen from "./screens/core/LabsScreen";
import ProfileDetailScreen from "./screens/core/ProfileDetailScreen";
import AddMemberScreen from "./screens/core/AddMemberScreen";
import SettingsDetailScreen from "./screens/core/SettingsDetailScreen";

// Module Screens
import GlobalHealthScreen from "./screens/modules/GlobalHealthScreen";
import EthicsScreen from "./screens/modules/EthicsScreen";
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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
export const navigationRef = createNavigationContainerRef();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
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
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Records"
        component={PassportScreen}
        options={{
          title: "Records",
          tabBarIcon: ({ color }) => (
            <Ionicons name="id-card-outline" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreFeaturesScreen}
        options={{
          title: "More",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="dots-horizontal"
              size={26}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App(): JSX.Element {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const userLang = await AsyncStorage.getItem("userLang");
        setI18nConfig(userLang);
      } catch {
        setI18nConfig();
      }
      setIsReady(true);
    }
    init();
  }, []);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8fbff",
        }}
      >
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <StatusBar
            barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
          />
          <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{ headerShown: false }}
          >
            {/* Onboarding flow */}
            <Stack.Screen name="Welcome">
              {(props) => (
                <WelcomeScreen
                  {...props}
                  onGetStarted={() => navigationRef.navigate("Auth")}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Auth">
              {(props) => (
                <AuthScreen
                  {...props}
                  onAuthSuccess={() => navigationRef.navigate("Main")}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ ...TransitionPresets.FadeFromBottomAndroid }}
            />

            {/* Core + Modules */}
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
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
            <Stack.Screen name="GlobalHealthScreen" component={GlobalHealthScreen} />
            <Stack.Screen name="MentalHealthScreen" component={MentalHealthScreen} />
            <Stack.Screen name="PediatricScreen" component={PediatricScreen} />
            <Stack.Screen name="NutritionScreen" component={NutritionScreen} />
            <Stack.Screen name="RecordImportScreen" component={RecordImportScreen} />
            <Stack.Screen
              name="EthicsDetail"
              component={EthicsDetailScreen}
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
            <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
            <Stack.Screen name="AddMemberScreen" component={AddMemberScreen} />
            <Stack.Screen name="SettingsDetailScreen" component={SettingsDetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
