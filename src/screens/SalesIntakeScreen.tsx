import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, radius, typography, shadows } from "../theme/theme";
import { Icon } from "../components/Icon";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigator";
import { extractReceiptFromImage, parseVoiceSalesLog } from "../services/aiApi";
import {
  WHISPER_RECORDING_OPTIONS,
  LANG_OPTIONS,
} from "../constants/voice";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "SalesIntake">;
type Mode = "PHOTO" | "VOICE";

export function SalesIntakeScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const initialMode = route.params?.initialMode ?? "PHOTO";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [isRecording, setIsRecording] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState("auto");

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const audioRecordingRef = useRef<Audio.Recording | null>(null);

  // Recording pulse animation
  useEffect(() => {
    if (isRecording) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.22,
            duration: 480,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 480,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isRecording, pulseAnim]);

  const handleMicPress = async () => {
    if (isRecording) {
      // Stop recording and process
      setIsRecording(false);
      try {
        if (!audioRecordingRef.current) {
          throw new Error("No active recording found");
        }

        setIsProcessingVoice(true);
        await audioRecordingRef.current.stopAndUnloadAsync();
        const uri = audioRecordingRef.current.getURI();
        audioRecordingRef.current = null;

        if (!uri) {
          throw new Error("Recording failed to save");
        }

        // Call the voice sales log API
        const result = await parseVoiceSalesLog(uri, voiceLanguage);
        
        // Navigate to verification with parsed items
        nav.navigate("Verification", { parsedSalesLog: result.parsed });
      } catch (error: any) {
        const errorMessage = error?.message || "Unknown error occurred";

        if (
          errorMessage.includes("AI features are temporarily unavailable") ||
          errorMessage.includes("GROQ_API_KEY")
        ) {
          Alert.alert(
            "AI Service Unavailable",
            "Voice sales log parsing is currently unavailable. Please contact support or try again later.",
          );
        } else {
          Alert.alert(
            "Voice Parsing Failed",
            "Could not parse your voice recording. Please try again with clearer speech or contact support if this persists.",
          );
        }
      } finally {
        setIsProcessingVoice(false);
      }
    } else {
      // Start recording
      try {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) {
          Alert.alert(
            "Microphone Access Required",
            "Please grant microphone access to record voice sales logs.",
          );
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(WHISPER_RECORDING_OPTIONS);
        await recording.startAsync();
        audioRecordingRef.current = recording;
        setIsRecording(true);
      } catch (error) {
        Alert.alert(
          "Recording Error",
          "Could not start audio recording. Please check microphone permissions.",
        );
      }
    }
  };

  const handleSnap = async () => {
    if (isProcessingPhoto) return;
    if (!cameraRef.current) {
      Alert.alert("Camera Not Ready", "Please wait a moment and try again.");
      return;
    }

    try {
      setIsProcessingPhoto(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (!photo?.uri) throw new Error("No photo URI returned from camera");

      const result = await extractReceiptFromImage(photo.uri);
      nav.navigate("Verification", { parsedReceipt: result.parsed });
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error occurred";
      
      if (errorMessage.includes("AI features are temporarily unavailable") || 
          errorMessage.includes("OPENROUTER_API_KEY")) {
        Alert.alert(
          "AI Service Unavailable",
          "Receipt scanning AI is currently unavailable. Please contact support or try again later.",
        );
      } else {
        Alert.alert(
          "Scan Failed",
          "Could not parse this receipt. Please retake with better lighting or contact support if this persists.",
        );
      }
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  // Permission check
  if (!permission) {
    return (
      <View style={styles.permRoot}>
        <Text style={styles.permText}>Requesting camera access...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permRoot}>
        <Icon name="camera" size={48} color={colors.primaryMid} />
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permSub}>
          KudiNode needs camera access to scan receipts and sales ledgers.
        </Text>
        <TouchableOpacity
          style={styles.permBtn}
          onPress={requestPermission}
          activeOpacity={0.85}
        >
          <Text style={styles.permBtnText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const topPadding = Math.max(insets.top, 24) + 12;

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* ── CAMERA VIEWFINDER (full screen) ── */}
      {mode === "PHOTO" && (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          flash={flashOn ? "on" : "off"}
        />
      )}

      {/* ── VOICE MODE BACKGROUND ── */}
      {mode === "VOICE" && (
        <LinearGradient
          colors={["#0D0B14", colors.primaryDeep]}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* ── Overlay tint ── */}
      <View style={styles.overlay} />

      {/* ── TOP BAR (Cleanly positioned down so back button is always 100% clickable) ── */}
      <View style={[styles.topBarContainer, { paddingTop: topPadding }]}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.topBtn}
            onPress={() => nav.goBack()}
            activeOpacity={0.7}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Icon name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>

          <Text style={styles.topTitle}>
            {mode === "PHOTO" ? "Receipt Scanner" : "Voice Sales Log"}
          </Text>

          {mode === "PHOTO" ? (
            <TouchableOpacity
              style={styles.topBtn}
              onPress={() => setFlashOn((f) => !f)}
              activeOpacity={0.8}
            >
              <Icon
                name="flash"
                size={20}
                color={flashOn ? colors.warningOrange : colors.white}
              />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 44 }} />
          )}
        </View>
      </View>

      {/* ── VIEWFINDER CORNERS (Photo mode) ── */}
      {mode === "PHOTO" && (
        <View style={styles.finderWrap}>
          <View style={styles.finderFrame}>
            <View style={[styles.corner, styles.cTL]} />
            <View style={[styles.corner, styles.cTR]} />
            <View style={[styles.corner, styles.cBL]} />
            <View style={[styles.corner, styles.cBR]} />
            <Text style={styles.finderHint}>Align receipt within frame</Text>
          </View>
        </View>
      )}

      {/* ── VOICE AREA ── */}
      {mode === "VOICE" && (
        <View style={styles.voiceArea}>
          <Animated.View
            style={[styles.micRingOuter, { transform: [{ scale: pulseAnim }] }]}
          >
            <View
              style={[
                styles.micRingInner,
                isRecording && styles.micRingInnerActive,
              ]}
            >
              <Icon name="mic" size={52} color={colors.white} />
            </View>
          </Animated.View>

          {/* Recording indicator */}
          {isRecording && (
            <View style={styles.recordingBadge}>
              <View style={styles.recDot} />
              <Text style={styles.recText}>
                {isProcessingVoice
                  ? "Processing..."
                  : "Recording · AI parsing active"}
              </Text>
            </View>
          )}

          {/* Waveform bars */}
          {isRecording && (
            <View style={styles.waveform}>
              {Array.from({ length: 30 }).map((_, i) => {
                const h = 8 + Math.abs(Math.sin(i * 0.7)) * 22 + (i % 3) * 5;
                return (
                  <View
                    key={i}
                    style={{
                      width: 3.5,
                      height: h,
                      backgroundColor: colors.successGreen,
                      borderRadius: 2,
                      opacity: 0.85,
                    }}
                  />
                );
              })}
            </View>
          )}

          <Text style={styles.voiceHint}>
            {isRecording
              ? "Speak items & prices in English, Pidgin, Hausa, Yoruba or Igbo"
              : "Tap mic to record your sales. AI will parse items & amounts."}
          </Text>

          {!isRecording && (
            <View style={styles.langRow}>
              {LANG_OPTIONS.map((opt) => {
                const active = voiceLanguage === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.langPill,
                      active && styles.langPillActive,
                    ]}
                    onPress={() => setVoiceLanguage(opt.value)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.langPillText,
                        active && styles.langPillTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* ── BOTTOM CONTROLS ── */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 12 },
        ]}
      >
        <View style={styles.bottomBar}>
          {/* Mode Switcher */}
          <View style={styles.segmented}>
            <TouchableOpacity
              style={[styles.seg, mode === "PHOTO" && styles.segActive]}
              onPress={() => {
                setMode("PHOTO");
                setIsRecording(false);
              }}
              activeOpacity={0.8}
            >
              <Icon
                name="camera"
                size={15}
                color={mode === "PHOTO" ? colors.primaryDeep : colors.white}
              />
              <Text
                style={[
                  styles.segText,
                  mode === "PHOTO" && styles.segTextActive,
                ]}
              >
                Photo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.seg, mode === "VOICE" && styles.segActive]}
              onPress={() => setMode("VOICE")}
              activeOpacity={0.8}
            >
              <Icon
                name="mic"
                size={15}
                color={mode === "VOICE" ? colors.primaryDeep : colors.white}
              />
              <Text
                style={[
                  styles.segText,
                  mode === "VOICE" && styles.segTextActive,
                ]}
              >
                Voice
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Button */}
          <View style={styles.actionRow}>
            {mode === "PHOTO" ? (
              /* Camera shutter */
              <TouchableOpacity
                style={styles.shutter}
                onPress={handleSnap}
                activeOpacity={0.85}
              >
                <View style={styles.shutterOuter}>
                  {isProcessingPhoto ? (
                    <ActivityIndicator
                      color={colors.primaryDeep}
                      size="small"
                    />
                  ) : (
                    <View style={styles.shutterInner} />
                  )}
                </View>
                <Text style={styles.actionCaption}>
                  {isProcessingPhoto
                    ? "Extracting receipt..."
                    : "Tap to capture receipt"}
                </Text>
              </TouchableOpacity>
            ) : (
              /* Mic record button */
              <View style={styles.micActionWrap}>
                <View style={styles.recIndicatorBox}>
                  {isRecording ? (
                    <>
                      <View style={styles.stopSquare} />
                      <Text style={styles.recIndicatorText}>Stop</Text>
                    </>
                  ) : (
                    <>
                      <View style={styles.recCircle} />
                      <Text style={styles.recIndicatorText}>Record</Text>
                    </>
                  )}
                </View>

                {/* Main mic FAB */}
                <TouchableOpacity
                  onPress={handleMicPress}
                  activeOpacity={0.88}
                  disabled={isProcessingVoice}
                >
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <LinearGradient
                      colors={
                        isRecording
                          ? ["#E53935", "#B71C1C"]
                          : [colors.primaryMid, colors.primaryDeep]
                      }
                      style={styles.micFAB}
                    >
                      {isProcessingVoice ? (
                        <ActivityIndicator color={colors.white} size="large" />
                      ) : (
                        <Icon
                          name={isRecording ? "checkmark" : "mic"}
                          size={36}
                          color={colors.white}
                        />
                      )}
                    </LinearGradient>
                  </Animated.View>
                </TouchableOpacity>

                <View style={{ width: 72 }} />
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const CORNER_SIZE = 28;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D0B14" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  permRoot: {
    flex: 1,
    backgroundColor: colors.grayBG,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.md,
  },
  permTitle: {
    fontSize: typography.sizes.h3,
    fontWeight: "800",
    color: colors.textDark,
    textAlign: "center",
  },
  permSub: {
    fontSize: typography.sizes.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  permText: { fontSize: typography.sizes.body, color: colors.textMuted },
  permBtn: {
    backgroundColor: colors.primaryDeep,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  permBtnText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: typography.sizes.body,
  },

  // Top Bar Container
  topBarContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  topTitle: {
    fontSize: typography.sizes.body,
    fontWeight: "800",
    color: colors.white,
  },

  // Finder
  finderWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  finderFrame: {
    width: "80%",
    aspectRatio: 3 / 4,
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: spacing.md,
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: colors.successGreen,
  },
  cTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cBL: {
    bottom: 30,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cBR: {
    bottom: 30,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  finderHint: {
    fontSize: typography.sizes.tiny,
    color: colors.white,
    fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },

  // Voice area
  voiceArea: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
    paddingTop: 100,
  },
  micRingOuter: {
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: "rgba(107, 47, 165, 0.20)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  micRingInner: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: colors.primaryMid,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  micRingInnerActive: { backgroundColor: "#C0392B" },
  recordingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(192, 57, 43, 0.85)",
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginBottom: spacing.lg,
  },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF8A80" },
  recText: {
    color: colors.white,
    fontSize: typography.sizes.small,
    fontWeight: "700",
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3.5,
    height: 56,
    marginBottom: spacing.lg,
  },
  voiceHint: {
    color: "rgba(255,255,255,0.8)",
    fontSize: typography.sizes.small,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "500",
  },
  langRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginTop: spacing.lg,
    maxWidth: 320,
  },
  langPill: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "transparent",
  },
  langPillActive: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  langPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255,255,255,0.85)",
  },
  langPillTextActive: {
    color: colors.primaryDeep,
  },

  // Bottom Container
  bottomContainer: { position: "absolute", bottom: 0, left: 0, right: 0 },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    backgroundColor: "rgba(0,0,0,0.75)",
    gap: spacing.md,
  },
  segmented: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: radius.pill,
    padding: 3,
    gap: 2,
  },
  seg: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: radius.pill,
    minWidth: 100,
    justifyContent: "center",
  },
  segActive: { backgroundColor: colors.white },
  segText: {
    fontSize: typography.sizes.small,
    fontWeight: "700",
    color: colors.white,
  },
  segTextActive: { color: colors.primaryDeep },
  actionRow: { alignItems: "center", paddingBottom: spacing.sm },
  shutter: { alignItems: "center", gap: spacing.sm },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
  },
  actionCaption: {
    fontSize: typography.sizes.tiny,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
  micActionWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: spacing.md,
  },
  recIndicatorBox: { alignItems: "center", width: 72 },
  recCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF3B30",
    marginBottom: 5,
  },
  stopSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    marginBottom: 5,
  },
  recIndicatorText: {
    fontSize: typography.sizes.tiny,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
  },
  micFAB: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.2)",
  },
});
