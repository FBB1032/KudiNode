import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors, spacing, radius, typography, shadows } from "../theme/theme";
import { TopHeader } from "../components/TopHeader";
import { PrimaryButton } from "../components/PrimaryButton";
import { SecondaryButton } from "../components/SecondaryButton";
import { Icon } from "../components/Icon";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import {
  updateProfile,
  uploadDocument,
  submitForReview,
  DocType,
} from "../services/kudiApi";

export type RootStackParamList = {
  Login: undefined;
  RegisterKYC: undefined;
  MainTabs: undefined;
};

type Step = 1 | 2 | 3;
type IDType = "NIN" | "DRIVER_LICENSE" | "PASSPORT" | "VOTER_CARD";

const LANGUAGES = [
  { code: "English", label: "English" },
  { code: "Pidgin", label: "Naija Pidgin" },
  { code: "Hausa", label: "Hausa (Magana)" },
  { code: "Yoruba", label: "Yorùbá" },
  { code: "Igbo", label: "Asụsụ Ígbò" },
];

const MARKETS = [
  "Ikeja Central Market",
  "Mushin Ultra-Modern",
  "Yaba Trade Node",
  "Onitsha Main Market",
  "Bodija Commercial Node",
];

const COMMODITIES = [
  "Grains & Foodstuffs",
  "Provisions & FMCG",
  "Textiles & Apparel",
  "Fresh Produce & Vegetables",
  "Electronics & Repairs",
];

export function RegisterKYCScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const cameraRef = React.useRef<CameraView>(null);

  // Account credentials — merchant registers with email + password.
  // (They later sign in with their phone number + a 4-digit PIN.)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  // Step 1 State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bvn, setBvn] = useState("");
  const [nin, setNin] = useState("");
  const [selectedLang, setSelectedLang] = useState("English");

  // Step 2 State
  const [marketCluster, setMarketCluster] = useState(MARKETS[0]);
  const [commodityType, setCommodityType] = useState(COMMODITIES[0]);
  const [esusuCoopName, setEsusuCoopName] = useState("");
  const [wemaAccountNumber, setWemaAccountNumber] = useState("0129384756");
  const [wemaAccountName, setWemaAccountName] = useState(
    "Amina Babangida Bello",
  );

  // Step 3 State
  const [idType, setIdType] = useState<IDType>("NIN");
  const [idCaptured, setIdCaptured] = useState(false);
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [ledgerCaptured, setLedgerCaptured] = useState(false);

  // Camera Modal State
  const [cameraMode, setCameraMode] = useState<
    "SELFIE" | "DOC_ID" | "DOC_LEDGER" | null
  >(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  // Verification Modal State
  const [verifying, setVerifying] = useState(false);
  const [completed, setCompleted] = useState(false);

  const ID_DOC_TYPE: Record<IDType, DocType> = {
    NIN: "id_nin",
    DRIVER_LICENSE: "id_driver_license",
    PASSPORT: "id_passport",
    VOTER_CARD: "id_voter_card",
  };

  // Step 1 → creates the (pending) account, then saves personal details.
  const handleNextStep = async () => {
    setFormError(null);

    if (currentStep === 1) {
      if (
        !fullName.trim() ||
        !phone.trim() ||
        !email.trim() ||
        password.length < 8
      ) {
        setFormError(
          "Please provide your name, phone, email, and a password of at least 8 characters.",
        );
        return;
      }
      setBusy(true);
      try {
        if (!accountCreated) {
          await register({
            email: email.trim(),
            password,
            phone: phone.trim(),
            full_name: fullName.trim(),
            preferred_language: selectedLang,
          });
          setAccountCreated(true);
        }

        // Persist personal identity data to the profile.
        await updateProfile({
          full_name: fullName.trim(),
          phone,
          bvn,
          nin,
          preferred_language: selectedLang,
        } as any);
        setCurrentStep(2);
      } catch (e: any) {
        setFormError(e?.message || "Could not create your account.");
      } finally {
        setBusy(false);
      }
      return;
    }

    if (currentStep === 2) {
      setBusy(true);
      try {
        await updateProfile({
          market_cluster: marketCluster,
          commodity_type: commodityType,
          esusu_coop_name: esusuCoopName,
          wema_account_number: wemaAccountNumber,
          wema_account_name: wemaAccountName,
        } as any);
        setCurrentStep(3);
      } catch (e: any) {
        setFormError(e?.message || "Could not save your trade details.");
      } finally {
        setBusy(false);
      }
      return;
    }

    // Step 3 → submit for admin review.
    if (!idCaptured || !selfieCaptured) {
      setFormError(
        "Please capture your ID document and a live selfie before submitting.",
      );
      return;
    }
    setVerifying(true);
    try {
      await submitForReview();
      setVerifying(false);
      setCompleted(true);
    } catch (e: any) {
      setVerifying(false);
      setFormError(e?.message || "Submission failed. Please try again.");
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    } else {
      navigation.goBack();
    }
  };

  // After submission the merchant is pending — send them to Login, not the app.
  const handleCompleteKYC = () => {
    setCompleted(false);
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const openCamera = async (mode: "SELFIE" | "DOC_ID" | "DOC_LEDGER") => {
    if (!cameraPermission?.granted) {
      const res = await requestCameraPermission();
      if (!res.granted) return;
    }
    setCameraMode(mode);
  };

  // Capture the photo, upload it to the backend (→ Supabase Storage), and mark
  // the corresponding artifact as captured.
  const handleCaptureFromCamera = async () => {
    const mode = cameraMode;
    if (!mode) return;
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.6 });
      if (!photo?.uri) throw new Error("Could not capture photo");

      const docType: DocType =
        mode === "SELFIE"
          ? "selfie"
          : mode === "DOC_LEDGER"
            ? "ledger"
            : ID_DOC_TYPE[idType];

      setBusy(true);
      await uploadDocument(photo.uri, docType);

      if (mode === "SELFIE") setSelfieCaptured(true);
      if (mode === "DOC_ID") setIdCaptured(true);
      if (mode === "DOC_LEDGER") setLedgerCaptured(true);
    } catch (e: any) {
      setFormError(e?.message || "Upload failed. Please retry the capture.");
    } finally {
      setBusy(false);
      setCameraMode(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryDeep}
        translucent={false}
      />
      <TopHeader
        showBack
        title="Merchant KYC Registration"
        subtitle="Tier-1 Regulatory Identity Intake"
      />

      {/* Stepper Bar */}
      <View style={styles.stepperBar}>
        {[1, 2, 3].map((s) => {
          const active = s === currentStep;
          const done = s < currentStep;
          return (
            <View key={s} style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  done && styles.stepDotDone,
                  active && styles.stepDotActive,
                ]}
              >
                {done ? (
                  <Icon name="checkmark" size={14} color={colors.white} />
                ) : (
                  <Text
                    style={[styles.stepNum, active && styles.stepNumActive]}
                  >
                    {s}
                  </Text>
                )}
              </View>
              <Text
                style={[styles.stepLabel, active && styles.stepLabelActive]}
              >
                {s === 1 ? "Personal" : s === 2 ? "Trade" : "Documents"}
              </Text>
            </View>
          );
        })}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* STEP 1: Personal Details */}
          {currentStep === 1 && (
            <View style={[styles.card, shadows.card]}>
              <View style={styles.cardHeaderRow}>
                <Icon name="person" size={22} color={colors.primaryMid} />
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.cardTitle}>1. Personal Identity</Text>
                  <Text style={styles.cardSub}>
                    BVN & NIN real-time identity validation
                  </Text>
                </View>
              </View>

              {formError && (
                <View style={styles.errorBanner}>
                  <Icon
                    name="alert-circle"
                    size={16}
                    color={colors.warningOrange}
                  />
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="mail" size={18} color={colors.textMuted} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!accountCreated}
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Password (min. 8 characters)
                </Text>
                <View style={styles.inputWrapper}>
                  <Icon name="lock" size={18} color={colors.textMuted} />
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPassword}
                    editable={!accountCreated}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((p) => !p)}
                    style={{ padding: 4 }}
                  >
                    <Icon
                      name={showPassword ? "eye-off" : "eye"}
                      size={18}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.hintText}>
                  You'll use your phone number + a 4-digit PIN to sign in.
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Legal Name</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Amina Babangida"
                    placeholderTextColor={colors.textMuted}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                  <Icon name="person" size={18} color={colors.textMuted} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Mobile Phone Number (OTP Linked)
                </Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.prefixText}>+234</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="801 234 5678"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    maxLength={11}
                  />
                  <Icon name="call" size={18} color={colors.textMuted} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Bank Verification Number (11-Digit BVN)
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="221 984 567 10"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    secureTextEntry
                    value={bvn}
                    onChangeText={setBvn}
                    maxLength={11}
                  />
                  <Icon
                    name="shield-checkmark"
                    size={18}
                    color={colors.successGreen}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  National Identification Number (11-Digit NIN)
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="709 123 456 89"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    value={nin}
                    onChangeText={setNin}
                    maxLength={11}
                  />
                  <Icon name="card" size={18} color={colors.textMuted} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Preferred Voice & App Language
                </Text>
                <View style={styles.langGrid}>
                  {LANGUAGES.map((lang) => {
                    const selected = selectedLang === lang.code;
                    return (
                      <TouchableOpacity
                        key={lang.code}
                        style={[
                          styles.langChip,
                          selected && styles.langChipSelected,
                        ]}
                        onPress={() => setSelectedLang(lang.code)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.langChipText,
                            selected && styles.langChipTextSelected,
                          ]}
                        >
                          {lang.label}
                        </Text>
                        {selected && (
                          <Icon
                            name="checkmark"
                            size={14}
                            color={colors.white}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {/* STEP 2: Trade & Location */}
          {currentStep === 2 && (
            <View style={[styles.card, shadows.card]}>
              <View style={styles.cardHeaderRow}>
                <Icon name="receipt" size={22} color={colors.primaryMid} />
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.cardTitle}>
                    2. Trade & Settlement Details
                  </Text>
                  <Text style={styles.cardSub}>
                    Market cluster & settlement account assignment
                  </Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Primary Market Location Cluster
                </Text>
                <View style={styles.pickerOptionsWrap}>
                  {MARKETS.map((mkt) => {
                    const selected = marketCluster === mkt;
                    return (
                      <TouchableOpacity
                        key={mkt}
                        style={[
                          styles.optionRow,
                          selected && styles.optionRowSelected,
                        ]}
                        onPress={() => setMarketCluster(mkt)}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.radioDot,
                            selected && styles.radioDotSelected,
                          ]}
                        />
                        <Text
                          style={[
                            styles.optionText,
                            selected && styles.optionTextSelected,
                          ]}
                        >
                          {mkt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Commodities Sold</Text>
                <View style={styles.pickerOptionsWrap}>
                  {COMMODITIES.map((item) => {
                    const selected = commodityType === item;
                    return (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.optionRow,
                          selected && styles.optionRowSelected,
                        ]}
                        onPress={() => setCommodityType(item)}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.radioDot,
                            selected && styles.radioDotSelected,
                          ]}
                        />
                        <Text
                          style={[
                            styles.optionText,
                            selected && styles.optionTextSelected,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Market Association / Esusu Co-op Name (Optional)
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Mushin Traders Progressive Esusu"
                    placeholderTextColor={colors.textMuted}
                    value={esusuCoopName}
                    onChangeText={setEsusuCoopName}
                  />
                  <Icon name="people" size={18} color={colors.textMuted} />
                </View>
              </View>

              {/* Wema Bank Account Details for Settlement */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Wema Bank Account Number (10 Digits)
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0123456789"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    value={wemaAccountNumber}
                    onChangeText={setWemaAccountNumber}
                    maxLength={10}
                  />
                  <Icon name="bank" size={18} color={colors.primaryDeep} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Wema Account Name (Verified via NIP)
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Amina Babangida Bello"
                    placeholderTextColor={colors.textMuted}
                    value={wemaAccountName}
                    onChangeText={setWemaAccountName}
                  />
                  <Icon
                    name="checkmark-circle"
                    size={18}
                    color={colors.successGreen}
                  />
                </View>
              </View>

              <View style={styles.settlementBanner}>
                <Icon name="bank" size={24} color={colors.primaryDeep} />
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.settlementTitle}>
                    Wema Settlement Account Verified
                  </Text>
                  <Text style={styles.settlementAccNum}>
                    {wemaAccountNumber} · {wemaAccountName}
                  </Text>
                  <Text style={styles.settlementSub}>
                    Direct NIP settlement linked for daily sales payouts &
                    credit disbursement
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* STEP 3: Camera Capture & Biometrics */}
          {currentStep === 3 && (
            <View style={[styles.card, shadows.card]}>
              <View style={styles.cardHeaderRow}>
                <Icon name="camera" size={22} color={colors.primaryMid} />
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.cardTitle}>
                    3. Camera Capture & Biometrics
                  </Text>
                  <Text style={styles.cardSub}>
                    Liveness selfie match & ID document scan
                  </Text>
                </View>
              </View>

              {/* ID Document Selector & Camera Scan */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Government Identification Type
                </Text>
                <View style={styles.idTypeRow}>
                  {[
                    { id: "NIN", label: "NIN Slip" },
                    { id: "DRIVER_LICENSE", label: "Driver License" },
                    { id: "PASSPORT", label: "Passport" },
                    { id: "VOTER_CARD", label: "Voters Card" },
                  ].map((doc) => {
                    const selected = idType === doc.id;
                    return (
                      <TouchableOpacity
                        key={doc.id}
                        style={[
                          styles.idChip,
                          selected && styles.idChipSelected,
                        ]}
                        onPress={() => setIdType(doc.id as IDType)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.idChipText,
                            selected && styles.idChipTextSelected,
                          ]}
                        >
                          {doc.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={[styles.uploadBox, idCaptured && styles.uploadBoxDone]}
                  onPress={() => openCamera("DOC_ID")}
                  activeOpacity={0.8}
                >
                  <Icon
                    name={idCaptured ? "checkmark-circle" : "camera"}
                    size={32}
                    color={idCaptured ? colors.successGreen : colors.primaryMid}
                  />
                  <Text style={styles.uploadBoxTitle}>
                    {idCaptured
                      ? "Primary ID Document Scanned"
                      : "Scan ID Document with Camera"}
                  </Text>
                  <Text style={styles.uploadBoxSub}>
                    {idCaptured
                      ? "Photo captured & verified via Prembly sandbox"
                      : "Tap to open camera and scan your ID document"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Live Selfie Camera Capture */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Live Selfie / Liveness Biometric Match
                </Text>
                <TouchableOpacity
                  style={[
                    styles.selfieBox,
                    selfieCaptured && styles.selfieBoxDone,
                  ]}
                  onPress={() => openCamera("SELFIE")}
                  activeOpacity={0.85}
                >
                  <View style={styles.faceMeshGuide}>
                    <Icon
                      name={selfieCaptured ? "shield-checkmark" : "person"}
                      size={40}
                      color={
                        selfieCaptured ? colors.successGreen : colors.white
                      }
                    />
                  </View>
                  <Text style={styles.selfieTitle}>
                    {selfieCaptured
                      ? "Liveness Selfie Captured"
                      : "Take Live Selfie with Camera"}
                  </Text>
                  <Text style={styles.selfieSub}>
                    {selfieCaptured
                      ? "Matched 99.4% against BVN facial database"
                      : "Tap to open front camera and take liveness selfie"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Proof of Business / Trade Evidence Scan */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Proof of Business / Trade Ledger Scan (Optional)
                </Text>
                <TouchableOpacity
                  style={[
                    styles.uploadBox,
                    ledgerCaptured && styles.uploadBoxDone,
                  ]}
                  onPress={() => openCamera("DOC_LEDGER")}
                  activeOpacity={0.8}
                >
                  <Icon
                    name={ledgerCaptured ? "checkmark-circle" : "document-text"}
                    size={32}
                    color={
                      ledgerCaptured ? colors.successGreen : colors.primaryMid
                    }
                  />
                  <Text style={styles.uploadBoxTitle}>
                    {ledgerCaptured
                      ? "Handwritten Sales Ledger Uploaded"
                      : "Scan Paper Receipts / Exercise Book"}
                  </Text>
                  <Text style={styles.uploadBoxSub}>
                    {ledgerCaptured
                      ? "AI parsed 14 trade entries for Trust Score credit"
                      : "Tap camera to scan paper sales ledger photo"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Navigation Control Buttons */}
          <View style={styles.actionRow}>
            {currentStep > 1 && (
              <View style={{ flex: 1, marginRight: spacing.md }}>
                <SecondaryButton title="Back" onPress={handlePrevStep} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <PrimaryButton
                title={currentStep === 3 ? "Submit" : "Continue"}
                showArrow={currentStep !== 3}
                onPress={handleNextStep}
              />
            </View>
          </View>

          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── EXPO CAMERA CAPTURE MODAL (For Selfie & Document Scanning) ── */}
      <Modal visible={cameraMode !== null} transparent animationType="slide">
        <View style={styles.cameraModalRoot}>
          {cameraMode !== null && (
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing={cameraMode === "SELFIE" ? "front" : "back"}
            />
          )}
          <View style={styles.cameraOverlay} />

          {/* Camera Header */}
          <View
            style={[
              styles.cameraHeader,
              { paddingTop: Math.max(insets.top, 24) + 8 },
            ]}
          >
            <TouchableOpacity
              style={styles.cameraCloseBtn}
              onPress={() => setCameraMode(null)}
              activeOpacity={0.8}
            >
              <Icon name="close" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.cameraHeaderTitle}>
              {cameraMode === "SELFIE"
                ? "Take Liveness Selfie"
                : "Scan Document"}
            </Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Camera Guide Frame */}
          <View style={styles.cameraGuideWrap}>
            {cameraMode === "SELFIE" ? (
              <View style={styles.ovalSelfieFrame}>
                <Text style={styles.cameraGuideText}>
                  Center your face in oval frame
                </Text>
              </View>
            ) : (
              <View style={styles.rectDocFrame}>
                <Text style={styles.cameraGuideText}>
                  Align document within rectangular frame
                </Text>
              </View>
            )}
          </View>

          {/* Camera Shutter Action */}
          <View
            style={[
              styles.cameraShutterWrap,
              { paddingBottom: Math.max(insets.bottom, 16) + 16 },
            ]}
          >
            <TouchableOpacity
              style={styles.shutterBtn}
              onPress={handleCaptureFromCamera}
              activeOpacity={0.85}
            >
              <View style={styles.shutterBtnOuter}>
                <View style={styles.shutterBtnInner} />
              </View>
            </TouchableOpacity>
            <Text style={styles.shutterCaption}>
              Tap shutter to capture photo
            </Text>
          </View>
        </View>
      </Modal>

      {/* Verification Modal */}
      <Modal visible={verifying || completed} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          {verifying ? (
            <View style={styles.modalCard}>
              <ActivityIndicator size="large" color={colors.primaryMid} />
              <Text style={styles.verifyingTitle}>
                Connecting to Regulatory Sandboxes...
              </Text>
              <Text style={styles.verifyingSub}>
                Executing BVN / NIN liveness match & provisioning Wema Bank
                settlement account (&lt; 60s)
              </Text>
            </View>
          ) : (
            <View style={styles.modalCard}>
              <View style={styles.successIconCircle}>
                <Icon
                  name="checkmark-circle"
                  size={48}
                  color={colors.successGreen}
                />
              </View>
              <Text style={styles.successTitle}>KYC Submitted!</Text>
              <Text style={styles.successSub}>
                Your details and documents have been submitted for review. An
                admin will verify your account shortly — you'll be able to sign
                in once you're approved.
              </Text>

              <View style={styles.detailsBox}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailKey}>Merchant Name:</Text>
                  <Text style={styles.detailVal}>
                    {fullName || "Amina Babangida"}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailKey}>Account Number:</Text>
                  <Text style={styles.detailVal}>
                    {wemaAccountNumber} (Wema Bank)
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailKey}>Verified Status:</Text>
                  <Text
                    style={[styles.detailVal, { color: colors.successGreen }]}
                  >
                    Tier-1 Verified
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailKey}>Daily Limit:</Text>
                  <Text style={styles.detailVal}>₦50,000 / Day</Text>
                </View>
              </View>

              <PrimaryButton
                title="Enter KudiNode Hub"
                icon={
                  <Icon name="arrow-forward" size={18} color={colors.white} />
                }
                onPress={handleCompleteKYC}
              />
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayBG,
  },
  stepperBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepItem: {
    alignItems: "center",
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.grayBG,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    borderColor: colors.primaryMid,
    backgroundColor: colors.accentLight,
  },
  stepDotDone: {
    borderColor: colors.successGreen,
    backgroundColor: colors.successGreen,
  },
  stepNum: {
    fontSize: typography.sizes.tiny,
    fontWeight: "700",
    color: colors.textMuted,
  },
  stepNumActive: {
    color: colors.primaryDeep,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textMuted,
    marginTop: 4,
  },
  stepLabelActive: {
    color: colors.primaryDeep,
    fontWeight: "700",
  },
  scrollContent: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.sizes.h4,
    fontWeight: "800",
    color: colors.textDark,
  },
  cardSub: {
    fontSize: typography.sizes.tiny,
    color: colors.textMuted,
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.sizes.small,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  hintText: {
    fontSize: typography.sizes.tiny,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.grayBG,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  prefixText: {
    fontSize: typography.sizes.body,
    fontWeight: "700",
    color: colors.textDark,
    marginRight: spacing.xs,
  },
  textInput: {
    flex: 1,
    fontSize: typography.sizes.body,
    color: colors.textDark,
  },
  langGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  langChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.grayBG,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  langChipSelected: {
    backgroundColor: colors.primaryDeep,
    borderColor: colors.primaryDeep,
  },
  langChipText: {
    fontSize: typography.sizes.tiny,
    fontWeight: "600",
    color: colors.textDark,
  },
  langChipTextSelected: {
    color: colors.white,
  },
  pickerOptionsWrap: {
    gap: spacing.xs,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.grayBG,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  optionRowSelected: {
    borderColor: colors.primaryMid,
    backgroundColor: colors.accentLight,
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  radioDotSelected: {
    borderColor: colors.primaryDeep,
    backgroundColor: colors.primaryDeep,
  },
  optionText: {
    fontSize: typography.sizes.body,
    color: colors.textDark,
  },
  optionTextSelected: {
    fontWeight: "700",
    color: colors.primaryDeep,
  },
  settlementBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accentLight,
    borderWidth: 1,
    borderColor: "rgba(74, 29, 122, 0.15)",
    borderRadius: radius.xl,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  settlementTitle: {
    fontSize: typography.sizes.tiny,
    fontWeight: "700",
    color: colors.primaryDeep,
  },
  settlementAccNum: {
    fontSize: typography.sizes.h4,
    fontWeight: "800",
    color: colors.primaryDeep,
    letterSpacing: 1,
  },
  settlementSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  idTypeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  idChip: {
    backgroundColor: colors.grayBG,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  idChipSelected: {
    backgroundColor: colors.primaryMid,
    borderColor: colors.primaryMid,
  },
  idChipText: {
    fontSize: typography.sizes.tiny,
    color: colors.textDark,
  },
  idChipTextSelected: {
    color: colors.white,
    fontWeight: "700",
  },
  uploadBox: {
    backgroundColor: colors.grayBG,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBoxDone: {
    backgroundColor: "#E8FFF2",
    borderColor: colors.successGreen,
    borderStyle: "solid",
  },
  uploadBoxTitle: {
    fontSize: typography.sizes.body,
    fontWeight: "700",
    color: colors.textDark,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  uploadBoxSub: {
    fontSize: typography.sizes.tiny,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: "center",
  },
  selfieBox: {
    backgroundColor: colors.primaryDeep,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
  },
  selfieBoxDone: {
    backgroundColor: colors.successGreen,
  },
  faceMeshGuide: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  selfieTitle: {
    fontSize: typography.sizes.body,
    fontWeight: "800",
    color: colors.white,
  },
  selfieSub: {
    fontSize: typography.sizes.tiny,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
    textAlign: "center",
  },
  actionRow: {
    flexDirection: "row",
    marginTop: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  modalCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    alignItems: "center",
  },
  verifyingTitle: {
    fontSize: typography.sizes.h3,
    fontWeight: "800",
    color: colors.textDark,
    marginTop: spacing.lg,
    textAlign: "center",
  },
  verifyingSub: {
    fontSize: typography.sizes.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: "center",
    lineHeight: 18,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E8FFF2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: typography.sizes.h2,
    fontWeight: "800",
    color: colors.textDark,
    textAlign: "center",
  },
  successSub: {
    fontSize: typography.sizes.small,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  detailsBox: {
    width: "100%",
    backgroundColor: colors.grayBG,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailKey: {
    fontSize: typography.sizes.tiny,
    color: colors.textMuted,
  },
  detailVal: {
    fontSize: typography.sizes.small,
    fontWeight: "700",
    color: colors.textDark,
  },

  // Camera Modal
  cameraModalRoot: { flex: 1, backgroundColor: "#000" },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  cameraHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  cameraCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraHeaderTitle: {
    color: colors.white,
    fontWeight: "800",
    fontSize: typography.sizes.body,
  },
  cameraGuideWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  ovalSelfieFrame: {
    width: 220,
    height: 280,
    borderRadius: 110,
    borderWidth: 3,
    borderColor: colors.successGreen,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: spacing.lg,
  },
  rectDocFrame: {
    width: "85%",
    aspectRatio: 3 / 2,
    borderRadius: radius.lg,
    borderWidth: 3,
    borderColor: colors.successGreen,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: spacing.md,
  },
  cameraGuideText: {
    color: colors.white,
    fontSize: typography.sizes.tiny,
    fontWeight: "700",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  cameraShutterWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: spacing.xs,
  },
  shutterBtn: { alignItems: "center", justifyContent: "center" },
  shutterBtnOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
  },
  shutterCaption: {
    color: "rgba(255,255,255,0.8)",
    fontSize: typography.sizes.tiny,
    fontWeight: "600",
  },

  // Inline error banner
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#FFF3E8",
    borderWidth: 1,
    borderColor: colors.warningOrange,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    flex: 1,
    fontSize: typography.sizes.small,
    color: colors.textDark,
    fontWeight: "600",
  },
});
