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
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing, radius, typography, shadows } from "../theme/theme";
import { Icon } from "../components/Icon";
import { PrimaryButton } from "../components/PrimaryButton";
import { SecondaryButton } from "../components/SecondaryButton";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { FloatingLabelInput } from "../components/FloatingLabelInput";
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
  const { t } = useLanguage();
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
          t("register.requiredFields"),
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
        t("register.captureRequired"),
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

  const STEP_LABELS = [t('register.step1'), t('register.step2'), t('register.step3')];
  const STEP_ICONS: string[] = [
    'person-outline',
    'storefront-outline',
    'document-text-outline',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1A0840"
        translucent={false}
      />

      {/* ── Hero header ── */}
      <LinearGradient
        colors={['#1A0840', colors.primaryDeep, '#4C1D95']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroHeader}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handlePrevStep}
          activeOpacity={0.8}
        >
        <Icon name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.heroTextBlock}>
          <Text style={styles.heroTitle}>{t('register.title')}</Text>
          <Text style={styles.heroSub}>{t('register.subtitle')}</Text>
        </View>
        <View style={styles.heroBadge}>
          <Icon name="shield-checkmark" size={12} color="#34D399" />
          <Text style={styles.heroBadgeText}>{t('register.kyc')}</Text>
        </View>
      </LinearGradient>

      {/* ── Premium stepper ── */}
      <View style={styles.stepperBar}>
        {[1, 2, 3].map((s, idx) => {
          const active = s === currentStep;
          const done = s < currentStep;
          return (
            <React.Fragment key={s}>
              {/* connector line */}
              {idx > 0 && (
                <View
                  style={[
                    styles.stepConnector,
                    done && styles.stepConnectorDone,
                  ]}
                />
              )}
              <View style={styles.stepItem}>
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
                    <Icon
                      name={STEP_ICONS[idx] as string}
                      size={14}
                      color={active ? colors.primaryDeep : colors.textMuted}
                    />
                  )}
                </View>
                <Text
                  style={[styles.stepLabel, active && styles.stepLabelActive]}
                >
                  {STEP_LABELS[idx]}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                <View style={[styles.cardIconWrap, { backgroundColor: '#F3E8FF' }]}>
                  <Icon name="person" size={18} color={colors.primaryMid} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.cardTitle}>{t('register.personalIdentity')}</Text>
                  <Text style={styles.cardSub}>{t('register.personalSub')}</Text>
                </View>
              </View>

              {formError && (
                <View style={styles.errorBanner}>
                  <Icon name="alert-circle" size={16} color="#D97706" />
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              )}

              <FloatingLabelInput
                label={t("register.email")}
                leadingIcon="mail"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!accountCreated}
                value={email}
                onChangeText={setEmail}
              />

              <FloatingLabelInput
                label={t("register.password")}
                leadingIcon="lock"
                secureTextEntry={!showPassword}
                editable={!accountCreated}
                value={password}
                onChangeText={setPassword}
                trailingIcon={showPassword ? "eye-off" : "eye"}
                onTrailingIconPress={() => setShowPassword((p) => !p)}
              />

              <FloatingLabelInput
                label={t("register.fullName")}
                leadingIcon="person"
                value={fullName}
                onChangeText={setFullName}
              />

              <FloatingLabelInput
                label={t("register.phone")}
                prefix="+234"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={11}
                trailingIcon="call"
              />

              <FloatingLabelInput
                label={t("register.bvn")}
                leadingIcon="card"
                keyboardType="number-pad"
                secureTextEntry
                value={bvn}
                onChangeText={setBvn}
                maxLength={11}
                trailingIcon={
                  <Icon name="shield-checkmark" size={18} color={colors.successGreen} />
                }
              />

              <FloatingLabelInput
                label={t("register.nin")}
                leadingIcon="card"
                keyboardType="number-pad"
                value={nin}
                onChangeText={setNin}
                maxLength={11}
              />

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {t("register.preferredLanguage")}
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
                <View style={[styles.cardIconWrap, { backgroundColor: '#FEF3C7' }]}>
                  <Icon name="storefront-outline" size={18} color="#D97706" />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.cardTitle}>{t('register.tradeSettlement')}</Text>
                  <Text style={styles.cardSub}>{t('register.tradeSub')}</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("register.marketLocation")}</Text>
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
                <Text style={styles.inputLabel}>{t("register.commodities")}</Text>
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

              <FloatingLabelInput
                label={t("register.esusuCoop")}
                leadingIcon="people"
                value={esusuCoopName}
                onChangeText={setEsusuCoopName}
              />

              <FloatingLabelInput
                label={t("register.wemaAccount")}
                leadingIcon="bank"
                keyboardType="number-pad"
                value={wemaAccountNumber}
                onChangeText={setWemaAccountNumber}
                maxLength={10}
              />

              <FloatingLabelInput
                label={t("register.wemaAccountName")}
                value={wemaAccountName}
                onChangeText={setWemaAccountName}
                trailingIcon={
                  <Icon name="checkmark-circle" size={18} color={colors.successGreen} />
                }
              />

              <View style={styles.settlementBanner}>
                <View style={styles.settlementIconWrap}>
                  <Icon name="bank-outline" size={22} color={colors.primaryDeep} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={styles.settlementTitle}>{t('register.settlementAccount')}</Text>
                    <Icon name="checkmark-circle" size={13} color={colors.successGreen} />
                  </View>
                  <Text style={styles.settlementAccNum}>
                    {wemaAccountNumber} · {wemaAccountName}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* STEP 3: Camera Capture & Biometrics */}
          {currentStep === 3 && (
            <View style={[styles.card, shadows.card]}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardIconWrap, { backgroundColor: '#D1FAE5' }]}>
                  <Icon name="camera-outline" size={18} color="#059669" />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.cardTitle}>{t('register.biometrics')}</Text>
                  <Text style={styles.cardSub}>{t('register.biometricSub')}</Text>
                </View>
              </View>

              {/* ID Document Selector & Camera Scan */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("register.idType")}</Text>
                <View style={styles.idTypeRow}>
                  {[
                    { id: "NIN", labelKey: "register.idNin" },
                    { id: "DRIVER_LICENSE", labelKey: "register.idDriver" },
                    { id: "PASSPORT", labelKey: "register.idPassport" },
                    { id: "VOTER_CARD", labelKey: "register.idVoter" },
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
                          {t(doc.labelKey)}
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
                    name={idCaptured ? "checkmark-circle" : "camera-outline"}
                    size={32}
                    color={idCaptured ? colors.successGreen : colors.primaryMid}
                  />
                  <Text style={styles.uploadBoxTitle}>
                    {idCaptured ? t("register.idScanned") : t("register.scanId")}
                  </Text>
                  <Text style={styles.uploadBoxSub}>
                    {idCaptured ? t("register.capturedVerified") : t("register.tapToOpen")}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Live Selfie Camera Capture */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("register.liveSelfie")}</Text>
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
                      name={selfieCaptured ? "shield-checkmark" : "person-outline"}
                      size={40}
                      color={selfieCaptured ? '#34D399' : colors.white}
                    />
                  </View>
                  <Text style={styles.selfieTitle}>
                    {selfieCaptured ? t("register.selfieCaptured") : t("register.takeSelfie")}
                  </Text>
                  <Text style={styles.selfieSub}>
                    {selfieCaptured ? t("register.livenessVerified") : t("register.tapToOpen")}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Proof of Business / Trade Evidence Scan */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("register.tradeLedger")}</Text>
                <TouchableOpacity
                  style={[
                    styles.uploadBox,
                    ledgerCaptured && styles.uploadBoxDone,
                  ]}
                  onPress={() => openCamera("DOC_LEDGER")}
                  activeOpacity={0.8}
                >
                  <Icon
                    name={ledgerCaptured ? "checkmark-circle" : "document-text-outline"}
                    size={32}
                    color={ledgerCaptured ? colors.successGreen : colors.primaryMid}
                  />
                  <Text style={styles.uploadBoxTitle}>
                    {ledgerCaptured ? t("register.ledgerUploaded") : t("register.scanLedger")}
                  </Text>
                  <Text style={styles.uploadBoxSub}>
                    {ledgerCaptured ? t("register.aiParsedTrust") : t("register.tapToScan")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Navigation Control Buttons */}
          <View style={styles.actionRow}>
            {currentStep > 1 && (
              <View style={{ flex: 1, marginRight: spacing.md }}>
                <SecondaryButton title={t("register.back")} onPress={handlePrevStep} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <PrimaryButton
                title={currentStep === 3 ? t("register.submit") : t("register.continue")}
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
                ? t("register.takeSelfie")
                : t("register.scanDocument")}
            </Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Camera Guide Frame */}
          <View style={styles.cameraGuideWrap}>
            {cameraMode === "SELFIE" ? (
              <View style={styles.ovalSelfieFrame}>
                <Text style={styles.cameraGuideText}>
                  {t("register.faceFrame")}
                </Text>
              </View>
            ) : (
              <View style={styles.rectDocFrame}>
                <Text style={styles.cameraGuideText}>
                  {t("register.docFrame")}
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
              {t("register.tapShutter")}
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
                {t("register.verifyingTitle")}
              </Text>
              <Text style={styles.verifyingSub}>
                {t("register.verifyingSub")}
              </Text>
            </View>
          ) : (
            <View style={styles.modalCard}>
              <View style={styles.successIconCircle}>
                <Icon name="checkmark-circle" size={48} color={colors.successGreen} />
              </View>
              <Text style={styles.successTitle}>{t("register.submitted")}</Text>
              <Text style={styles.successSub}>
                {t("register.submittedSub")}
              </Text>

              <View style={styles.detailsBox}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailKey}>{t("register.merchantName")}</Text>
                  <Text style={styles.detailVal}>
                    {fullName || "Amina Babangida"}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailKey}>{t("register.accountNumber")}</Text>
                  <Text style={styles.detailVal}>
                    {wemaAccountNumber} (Wema Bank)
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailKey}>{t("register.verifiedStatus")}</Text>
                  <Text
                    style={[styles.detailVal, { color: colors.successGreen }]}
                  >
                    {t("register.tier1Verified")}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailKey}>{t("register.dailyLimit")}</Text>
                  <Text style={styles.detailVal}>₦50,000 / Day</Text>
                </View>
              </View>

              <PrimaryButton
                title={t("register.enterHub")}
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

  /* Hero header */
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextBlock: { flex: 1 },
  heroTitle: {
    fontSize: typography.sizes.body,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.2,
  },
  heroSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '600',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(52,211,153,0.18)',
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.35)',
  },
  heroBadgeText: {
    fontSize: 10,
    color: '#34D399',
    fontWeight: '800',
  },

  /* Premium stepper */
  stepperBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
    marginBottom: 16,
  },
  stepConnectorDone: {
    backgroundColor: colors.successGreen,
  },
  stepItem: {
    alignItems: "center",
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  stepLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textMuted,
    marginTop: 4,
  },
  stepLabelActive: {
    color: colors.primaryDeep,
    fontWeight: "800",
  },
  scrollContent: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: typography.sizes.h4,
    fontWeight: "800",
    color: colors.textDark,
  },
  cardSub: {
    fontSize: typography.sizes.tiny,
    color: colors.textMuted,
    marginTop: 1,
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
    gap: spacing.md,
  },
  settlementIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(59,21,102,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
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
