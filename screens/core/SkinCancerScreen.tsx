import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { useNavigation } from '@react-navigation/native';

const LABEL_DETAILS = {
  bkl: {
    name: "Benign Keratosis-Like Lesion",
    desc: "Non-cancerous, wart or seborrheic keratosis–like growth. Usually harmless.",
    malignant: false
  },
  nv: {
    name: "Melanocytic Nevus",
    desc: "A common mole. Generally benign, but monitor for changes.",
    malignant: false
  },
  df: {
    name: "Dermatofibroma",
    desc: "A benign, fibrous skin nodule. Not dangerous.",
    malignant: false
  },
  mel: {
    name: "Melanoma",
    desc: "The most dangerous skin cancer. Seek a dermatologist immediately.",
    malignant: true
  },
  vasc: {
    name: "Vascular Lesion",
    desc: "Blood vessel–related spot. Usually harmless.",
    malignant: false
  },
  bcc: {
    name: "Basal Cell Carcinoma",
    desc: "A common, slow-growing skin cancer. See a dermatologist.",
    malignant: true
  },
  akiec: {
    name: "Actinic Keratosis / Intraepithelial Carcinoma",
    desc: "Precancerous or early-stage cancer spot. Get medical advice.",
    malignant: true
  },
};

export default function SkinCancerScreen() {
  const navigation = useNavigation();
  const [showInfo, setShowInfo] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gradcam, setGradcam] = useState(null);

  const selectImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 1 });
    if (result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      resetResult();
    }
  };

  const takePhoto = async () => {
    const result = await launchCamera({ mediaType: 'photo', quality: 1 });
    if (result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      resetResult();
    }
  };

  const resetResult = () => {
    setPrediction(null);
    setConfidence(null);
    setGradcam(null);
      setShowInfo(false);
  };

  const analyzeImage = async () => {
    if (!imageUri) return;
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'skin.jpg',
    });
    try {
      setLoading(true);
      const response = await axios.post('http://192.168.1.138:5050/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const top1 = response.data.topk[0];
      setPrediction(top1.label);
      setConfidence(top1.prob);
      if (top1.gradcam) {
        setGradcam(`data:image/jpeg;base64,${top1.gradcam}`);
      }

      saveResultAsText(response.data.prediction, response.data.confidence);
    } catch (err) {
      Alert.alert('Error', 'Failed to upload or connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const saveResultAsText = async (prediction, confidence) => {
    const content = `Skin Cancer Analyzer Report\n\nPrediction: ${prediction}\nConfidence: ${(confidence * 100).toFixed(2)}%`;
    const path = `${RNFS.DocumentDirectoryPath}/SkinCancerReport.txt`;
    try {
      await RNFS.writeFile(path, content, 'utf8');
      await Share.open({ url: 'file://' + path });
    } catch (error) {
      Alert.alert('Share Failed', 'Could not share the report.');
    }
  };

  const getPredictionDetail = () => {
    if (!prediction) return null;
    const info = LABEL_DETAILS[prediction];
    if (!info) return null;
    return (
      <View style={styles.infoModalContent}>
        <Text style={styles.infoTitle}>{info.name}</Text>
        <Text style={styles.infoDesc}>{info.desc}</Text>
        <TouchableOpacity onPress={() => setShowInfo(false)} style={styles.infoClose}>
          <Text style={{ color: "#4f46e5", fontWeight: "600" }}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#e7f6ff", "#f7fdff", "#e0fff6"]} style={styles.container}>
        {showInfo && (
          <TouchableOpacity
            style={styles.infoModalOverlay}
            activeOpacity={1}
            onPress={() => setShowInfo(false)}
          >
            {getPredictionDetail()}
          </TouchableOpacity>
        )}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={26} color="#1e3a8a" />
        </TouchableOpacity>
          <Text style={styles.title}>Skin Cancer Analyzer</Text>

          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={styles.placeholderBox}>
              <Ionicons name="images-outline" size={60} color="#cbd5e1" />
              <Text style={styles.placeholderText}>No image selected</Text>
            </View>
          )}

          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.button} onPress={selectImage}>
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Upload Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>

          {imageUri && !loading && (
            <TouchableOpacity style={styles.analyzeButton} onPress={analyzeImage}>
              <Ionicons name="pulse-outline" size={22} color="#fff" />
              <Text style={styles.analyzeButtonText}>Analyze with AI</Text>
            </TouchableOpacity>
          )}

          {prediction && (
            <TouchableOpacity style={styles.resetButton} onPress={() => {setImageUri(null); resetResult();}}>
              <Ionicons name="refresh-circle-outline" size={22} color="#fff" />
              <Text style={styles.resetButtonText}>New Scan</Text>
            </TouchableOpacity>
          )}

          {loading && <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 20 }} />}

          {prediction && (
            <View style={styles.resultBox}>
              <Ionicons
                name={LABEL_DETAILS[prediction]?.malignant ? "alert-circle-outline" : "checkmark-circle-outline"}
                size={40}
                color={LABEL_DETAILS[prediction]?.malignant ? "#dc2626" : "#16a34a"}
              />
              <Text style={styles.resultText}>{LABEL_DETAILS[prediction]?.name || prediction}</Text>
              <Text style={styles.confidenceText}>
                Confidence: {(confidence * 100).toFixed(2)}%
              </Text>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => setShowInfo(true)}
              >
                <Ionicons name="information-circle-outline" size={20} color="#1e3a8a" />
                <Text style={styles.infoButtonText}>What does this mean?</Text>
              </TouchableOpacity>
              {LABEL_DETAILS[prediction]?.malignant ? (
                <Text style={styles.malignantText}>
                  Warning: This result may be cancerous. Please consult a dermatologist as soon as possible.
                </Text>
              ) : (
                <Text style={styles.benignText}>
                  This result is usually benign, but consult a doctor for changes or concerns.
                </Text>
              )}
            </View>
          )}
          {gradcam && (
            <View style={styles.gradcamBox}>
              <Text style={styles.gradcamLabel}>AI Heatmap (Grad-CAM):</Text>
              <Image
                source={{ uri: gradcam }}
                style={styles.gradcamImage}
                resizeMode="contain"
              />
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
    paddingTop: 64,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1d68af',
    marginBottom: 20,
  },
  image: {
    width: 310,
    height: 310,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cde4f5',
    marginVertical: 16,
  },
  placeholderBox: {
    width: 300,
    height: 300,
    borderRadius: 16,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  placeholderText: {
    marginTop: 12,
    color: '#94a3b8',
    fontSize: 15,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#38bdf8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginTop: 12,
  },
  analyzeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#64748b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginTop: 14,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
  },
  resultBox: {
    marginTop: 28,
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#bbf7d0',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  resultText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e3a8a',
    marginTop: 10,
  },
  confidenceText: {
    fontSize: 15,
    color: '#1e40af',
    marginTop: 4,
  },
  gradcamBox: {
  marginTop: 20,
  alignItems: 'center',
  backgroundColor: '#fff7ed',
  padding: 12,
  borderRadius: 12,
  shadowColor: '#ffedd5',
  shadowOpacity: 0.13,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 6,
  elevation: 2,
  },
  gradcamLabel: {
    fontWeight: '700',
    color: '#f97316',
    marginBottom: 8,
    fontSize: 16,
  },
  gradcamImage: {
    width: 250,
    height: 250,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  backButton: {
  position: 'absolute',
  top: 24,
  left: 14,
  zIndex: 10,
  backgroundColor: 'rgba(255,255,255,0.65)',
  borderRadius: 22,
  padding: 2,
  },

  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'center'
  },
  infoButtonText: {
    color: "#1e3a8a",
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 15,
  },
  malignantText: {
    marginTop: 8,
    color: "#dc2626",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
  benignText: {
    marginTop: 8,
    color: "#1e40af",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
  infoModalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.17)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  infoModalContent: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 26,
    width: 320,
    alignItems: "center",
    shadowColor: "#64748b",
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 10,
  },
  infoTitle: {
    fontWeight: "700",
    fontSize: 19,
    color: "#1e3a8a",
    marginBottom: 10,
    textAlign: "center"
  },
  infoDesc: {
    color: "#334155",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  infoClose: {
    marginTop: 8,
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  }
});
