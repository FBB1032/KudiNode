/**
 * VoiceTransferScreen — KudiNode AI
 * Purple-branded voice-first transfer entry screen.
 * Mic tap → Recording state → AI parse → TransferPin
 * Manual fallback at the bottom → ManualTransfer
 */
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, radius, typography, shadows } from "../theme/theme";
import { Icon } from "../components/Icon";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigator";
import { parseVoiceTransferFromAudio } from "../services/aiApi";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function VoiceTransferScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<
    "idle" | "recording" | "processing" | "done"
  >("idle");
  const [seconds, setSeconds] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);

  // Pulse animation for mic ring
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  // Sound-wave bars animation
  const waveAnims = useRef(
    Array.from({ length: 7 }, () => new Animated.Value(0.3)),
  ).current;

  useEffect(() => {
    let timer: any;
    if (phase === "recording") {
      setSeconds(0);
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);

      // Pulse ring
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoop.current.start();

      // Wave bars
      waveAnims.forEach((anim, i) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 300 + i * 80,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 300 + i * 80,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
          ]),
        ).start();
      });
    } else {
      clearInterval(timer);
      pulseLoop.current?.stop();
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      waveAnims.forEach((a) =>
        Animated.timing(a, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: false,
        }).start(),
      );
    }
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Microphone Required",
          "Please grant microphone permission to use voice transfer.",
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      await recording.startAsync();
      recordingRef.current = recording;
      setPhase("recording");
    } catch (error) {
      Alert.alert(
        "Recording Error",
        "Unable to start recording. Please try again.",
      );
      setPhase("idle");
    }
  };

  const stopAndParse = async () => {
    try {
      setPhase("processing");
      const recording = recordingRef.current;
      if (!recording) {
        throw new Error("No active recording found");
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;

      if (!uri) {
        throw new Error("No audio file generated");
      }

      const result = await parseVoiceTransferFromAudio(uri);
      const amount = result.parsed.amount;

      const prefilled = {
        prefilledRecipient: result.parsed.recipientName ?? "",
        prefilledBank: result.parsed.bankName ?? "",
        prefilledAccount: result.parsed.accountNumber ?? "",
        prefilledAmount: amount != null ? amount.toLocaleString() : "",
      };

      setPhase("done");
      setTimeout(() => {
        nav.replace("ManualTransfer", {
          prefilled,
          aiMeta: {
            confidence: result.parsed.confidence,
            languageDetected: result.parsed.languageDetected,
            transcript: result.transcript,
            transcriptionProvider: result.meta.transcriptionProvider,
          },
        });
      }, 450);
    } catch (_error) {
      setPhase("idle");
      Alert.alert(
        "Voice Parse Failed",
        "Could not understand the recording clearly. Please try again or use Manual Transfer.",
      );
    }
  };

  const handleMicPress = async () => {
    if (phase === "idle") {
      await startRecording();
    } else if (phase === "recording") {
      await stopAndParse();
    }
  };

  const micBg = phase === "recording" ? "#EF4444" : colors.white;
  const micIconColor =
    phase === "recording" ? colors.white : colors.primaryDeep;

  const statusLabel =
    phase === "idle"
      ? "Tap to Speak"
      : phase === "recording"
        ? `Listening… 0:${String(seconds).padStart(2, "0")}`
        : phase === "processing"
          ? "Processing Voice…"
          : "Voice Parsed ✓";

  const statusColor =
    phase === "idle"
      ? "rgba(255,255,255,0.8)"
      : phase === "recording"
        ? "#FCA5A5"
        : phase === "done"
          ? "#86EFAC"
          : "rgba(255,255,255,0.8)";

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryDeep}
        translucent={false}
      />

      <LinearGradient
        colors={["#3B0764", colors.primaryMid, colors.primaryDeep]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, 16) + spacing.md },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => nav.goBack()}
          activeOpacity={0.75}
        >
          <Icon name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Voice Transfer</Text>
          <Text style={styles.headerSub}>Speak your transfer command</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Main content */}
      <View style={styles.body}>
        {/* Sound-wave bars (visible while recording) */}
        <View style={styles.waveRow}>
          {waveAnims.map((anim, i) => (
            <Animated.View
              key={i}
              style={[
                styles.waveBar,
                {
                  height: anim.interpolate({
                    inputRange: [0.3, 1],
                    outputRange: [8, 44],
                  }),
                  backgroundColor:
                    phase === "recording"
                      ? "#FCA5A5"
                      : "rgba(255,255,255,0.25)",
                },
              ]}
            />
          ))}
        </View>

        {/* Mic Button */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulseAnim }],
              borderColor:
                phase === "recording"
                  ? "rgba(239,68,68,0.4)"
                  : "rgba(255,255,255,0.18)",
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.micBtn, { backgroundColor: micBg }]}
            onPress={handleMicPress}
            activeOpacity={0.85}
            disabled={phase === "processing" || phase === "done"}
          >
            {phase === "processing" ? (
              <Icon name="refresh" size={38} color={colors.primaryDeep} />
            ) : (
              <Icon name="mic" size={38} color={micIconColor} />
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Status text */}
        <Text style={[styles.statusLabel, { color: statusColor }]}>
          {statusLabel}
        </Text>
        <Text style={styles.statusHint}>
          {phase === "idle"
            ? "Speak in Hausa, Yoruba, Igbo, Pidgin, or English"
            : phase === "recording"
              ? "Tap again when done speaking"
              : phase === "processing"
                ? "KudiBot AI is parsing your command…"
                : "Redirecting to confirm details…"}
        </Text>

        {/* Supported languages pills */}
        {phase === "idle" && (
          <View style={styles.langRow}>
            {["EN", "HA", "YO", "IG", "PID"].map((l) => (
              <View key={l} style={styles.langPill}>
                <Text style={styles.langPillText}>{l}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Bottom — Manual fallback */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 20) + spacing.lg },
        ]}
      >
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>
        <TouchableOpacity
          style={[styles.manualBtn, shadows.button]}
          onPress={() => nav.replace("ManualTransfer")}
          activeOpacity={0.85}
        >
          <Icon name="pencil" size={17} color={colors.primaryDeep} />
          <Text style={styles.manualBtnText}>Use Manual Transfer Instead</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primaryDeep },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontSize: typography.sizes.h4,
    fontWeight: "800",
    color: colors.white,
  },
  headerSub: {
    fontSize: typography.sizes.tiny,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },

  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },

  hintBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.xl,
    marginBottom: spacing.xl * 1.5,
  },
  hintText: {
    fontSize: typography.sizes.tiny,
    color: "rgba(255,255,255,0.85)",
    flex: 1,
    lineHeight: 16,
  },

  waveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 52,
    marginBottom: spacing.xl,
  },
  waveBar: { width: 5, borderRadius: 3 },

  pulseRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  micBtn: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },

  statusLabel: {
    fontSize: typography.sizes.h3,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  statusHint: {
    fontSize: typography.sizes.small,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 20,
  },

  langRow: { flexDirection: "row", gap: 6, marginTop: spacing.lg },
  langPill: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  langPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255,255,255,0.85)",
  },

  bottomBar: { paddingHorizontal: spacing.xl, gap: spacing.md },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.2)" },
  dividerText: {
    fontSize: typography.sizes.tiny,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "700",
  },
  manualBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    paddingVertical: 14,
  },
  manualBtnText: {
    fontSize: typography.sizes.body,
    fontWeight: "800",
    color: colors.primaryDeep,
  },
});
