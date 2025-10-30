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
  SafeAreaView,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { useNavigation } from '@react-navigation/native';

// ---- Configure your backend here ----
const API_BASE = 'http://192.168.1.138:5051';
const USE_PING = false;

export default function ImagingScreen() {
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [lowResB64, setLowResB64] = useState<string | null>(null);
  const [enhancedB64, setEnhancedB64] = useState<string | null>(null);
  const [explainB64, setExplainB64] = useState<string | null>(null); // NEW
  const [loading, setLoading] = useState(false);

  // --- Image Selection ---
  const selectImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 1 });
    if (result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri || null);
      setLowResB64(null);
      setEnhancedB64(null);
      setExplainB64(null); // NEW
    }
  };

  const takePhoto = async () => {
    const result = await launchCamera({ mediaType: 'photo', quality: 1 });
    if (result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri || null);
      setLowResB64(null);
      setEnhancedB64(null);
      setExplainB64(null); // NEW
    }
  };

  // --- AI Enhancement ---
  const enhanceImage = async () => {
    if (!imageUri) return;

    Alert.alert(
      'AI Image Enhancement',
      'Your X-ray will be enhanced by our advanced AI model for clarity. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Enhance',
          style: 'default',
          onPress: async () => {
            try {
              setLoading(true);

              if (USE_PING) {
                const ping = await axios.get(`${API_BASE}/ping_image`, { timeout: 15000 });
                const b64 = ping?.data?.enhanced || ping?.data?.enhanced_jpeg;
                if (!b64) throw new Error('No data from /ping_image');
                setLowResB64(null);
                setEnhancedB64(`data:image/jpeg;base64,${b64}`);
                setExplainB64(null);
                return;
              }

              const formData: any = new FormData();
              formData.append('image', {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'scan.jpg',
              });

              const res = await axios.post(`${API_BASE}/enhance_xray?alpha=1.25&clahe=1`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 60000,
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
              });

              const low = res?.data?.low_res;
              const enh = res?.data?.enhanced || res?.data?.enhanced_jpeg;

              if (!enh || (typeof enh === 'string' && enh.length < 1000)) {
                Alert.alert('Error', 'AI did not return a valid enhanced image.');
                return;
              }

              setLowResB64(low ? `data:image/jpeg;base64,${low}` : null);
              setEnhancedB64(`data:image/jpeg;base64,${enh}`);
              setExplainB64(null); // reset until user asks for explain
            } catch (err: any) {
              Alert.alert('Error', `Failed to connect to the AI server. ${err?.message ?? ''}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  // --- NEW: Explain/Grad-CAM overlay ---
  const explainImage = async () => {
    if (!imageUri) return;
    try {
      setLoading(true);

      const formData: any = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'scan.jpg',
      });

      const res = await axios.post(`${API_BASE}/enhance_xray_explain?alpha=1.25&clahe=1`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      const low = res?.data?.low_res;
      const enh = res?.data?.enhanced;
      const exp = res?.data?.explain;

      if (!exp || exp.length < 1000) {
        Alert.alert('Explain Error', 'Could not generate the heatmap overlay.');
        return;
      }

      // keep the same images (API also returns them so we refresh)
      setLowResB64(low ? `data:image/jpeg;base64,${low}` : lowResB64);
      setEnhancedB64(enh ? `data:image/jpeg;base64,${enh}` : enhancedB64);
      setExplainB64(`data:image/jpeg;base64,${exp}`);
    } catch (err: any) {
      Alert.alert('Error', `Explain endpoint failed. ${err?.message ?? ''}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Download/Share ---
  const saveEnhanced = async () => {
    if (!enhancedB64) return;
    const path = `${RNFS.DocumentDirectoryPath}/EnhancedMedicalImage.jpg`;
    const base64Data = enhancedB64.replace(/^data:image\/\w+;base64,/, '');
    await RNFS.writeFile(path, base64Data, 'base64');
    await Share.open({ url: 'file://' + path });
  };

  const resetAll = () => {
    setImageUri(null);
    setLowResB64(null);
    setEnhancedB64(null);
    setExplainB64(null);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={['#e3f0ff', '#f6fcff', '#e0f7fa']} style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#1565c0" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>ArogyaAI Medical Imaging (AI X-ray Enhancer)</Text>
          <Text style={styles.caption}>
            Upload a chest X-ray, and see it enhanced by our advanced AI model—built with real medical super-resolution
            deep learning. {'\n'}
            (HIPAA-safe: images are processed locally or in a secure private cloud.)
          </Text>

          {!imageUri && (
            <View style={styles.placeholderBox}>
              <Ionicons name="images-outline" size={60} color="#cbd5e1" />
              <Text style={styles.placeholderText}>No scan uploaded</Text>
            </View>
          )}

          {imageUri && (
            <View style={styles.imageRow}>
              <View style={styles.imageColumn}>
                <Text style={styles.imageLabel}>Low-Res Input</Text>
                <Image source={lowResB64 ? { uri: lowResB64 } : { uri: imageUri }} style={styles.image} />
              </View>
              {enhancedB64 && (
                <View style={styles.imageColumn}>
                  <Text style={styles.imageLabel}>AI Enhanced</Text>
                  <Image source={{ uri: enhancedB64 }} style={styles.image} />
                </View>
              )}
              {explainB64 && (
                <View style={styles.imageColumn}>
                  <Text style={styles.imageLabel}>Explain (Heatmap)</Text>
                  <Image source={{ uri: explainB64 }} style={styles.image} />
                </View>
              )}
            </View>
          )}

          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.button} onPress={selectImage}>
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Upload Scan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
            {imageUri && (
              <TouchableOpacity style={styles.resetButton} onPress={resetAll}>
                <Ionicons name="refresh-circle-outline" size={22} color="#fff" />
                <Text style={styles.resetButtonText}>New Scan</Text>
              </TouchableOpacity>
            )}
          </View>

          {imageUri && !loading && !enhancedB64 && (
            <TouchableOpacity
              style={[styles.enhanceButton, !enhancedB64 && styles.primaryButton]}
              onPress={enhanceImage}
              disabled={!!enhancedB64}
            >
              <Ionicons name="magic-wand-outline" size={22} color="#fff" />
              <Text style={styles.enhanceButtonText}>Enhance with AI</Text>
            </TouchableOpacity>
          )}

          {enhancedB64 && !loading && (
            <TouchableOpacity style={styles.explainButton} onPress={explainImage}>
              <Ionicons name="flame-outline" size={20} color="#fff" />
              <Text style={styles.explainButtonText}>Explain AI (Heatmap)</Text>
            </TouchableOpacity>
          )}

          {loading && <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 24 }} />}

          {enhancedB64 && (
            <TouchableOpacity style={styles.shareButton} onPress={saveEnhanced}>
              <Ionicons name="share-social-outline" size={20} color="#fff" />
              <Text style={styles.shareButtonText}>Download / Share Enhanced</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, alignItems: 'center', padding: 24, paddingTop: 64 },
  title: { fontSize: 26, fontWeight: '800', color: '#1565c0', marginBottom: 8, textAlign: 'center' },
  caption: { color: '#546e7a', fontSize: 14, marginBottom: 12, textAlign: 'center' },
  placeholderBox: {
    width: 320, height: 300, borderRadius: 18, backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#dbeafe',
    alignItems: 'center', justifyContent: 'center', marginVertical: 18,
  },
  placeholderText: { marginTop: 12, color: '#94a3b8', fontSize: 15 },
  imageRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginVertical: 12, flexWrap: 'wrap' },
  imageColumn: { alignItems: 'center' },
  imageLabel: { color: '#0288d1', fontWeight: '700', marginBottom: 6, fontSize: 16 },
  image: { width: 180, height: 180, borderRadius: 14, borderWidth: 1, borderColor: '#cde4f5', marginBottom: 10 },
  buttonGroup: { flexDirection: 'row', gap: 10, marginBottom: 10, justifyContent: 'center', flexWrap: 'wrap' },
  button: {
    flexDirection: 'row', backgroundColor: '#1976d2', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, alignItems: 'center', gap: 6,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  resetButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#90a4ae', paddingHorizontal: 14,
    paddingVertical: 10, borderRadius: 12, marginLeft: 4,
  },
  resetButtonText: { color: '#fff', fontWeight: '600', fontSize: 15, marginLeft: 8 },
  enhanceButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#00bcd4', paddingVertical: 12,
    paddingHorizontal: 20, borderRadius: 14, marginTop: 12, opacity: 1,
  },
  primaryButton: { backgroundColor: '#0288d1' },
  enhanceButtonText: { color: '#fff', fontWeight: '700', fontSize: 16, marginLeft: 8 },
  explainButton: {  // NEW
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ef6c00',
    paddingVertical: 12, paddingHorizontal: 20, borderRadius: 14, marginTop: 12, alignSelf: 'center',
  },
  explainButtonText: { color: '#fff', fontWeight: '700', fontSize: 16, marginLeft: 8 },
  shareButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#4f46e5', paddingVertical: 12,
    paddingHorizontal: 20, borderRadius: 14, marginTop: 18, alignSelf: 'center',
  },
  shareButtonText: { color: '#fff', fontWeight: '700', fontSize: 16, marginLeft: 8 },
  backButton: { position: 'absolute', top: 24, left: 14, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 22, padding: 2 },
});
