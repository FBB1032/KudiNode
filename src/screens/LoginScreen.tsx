import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing, radius, typography, shadows } from "../theme/theme";
import { Icon } from "../components/Icon";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../AppNavigator";
import { KudiNodeLogo } from "../components/KudiNodeLogo";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { FloatingLabelInput } from "../components/FloatingLabelInput";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function LoginScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      setError(t("login.errorEmpty"));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signIn(phone.trim(), password);
      nav.reset({ index: 0, routes: [{ name: "MainTabs" }] });
    } catch (e: any) {
      setError(e?.message || t("login.errorSignIn"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDeep} />

      {/* Hero gradient panel */}
      <LinearGradient
        colors={["#1A0840", colors.primaryDeep, "#4C1D95"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroBand, { paddingTop: insets.top + spacing.xl }]}
      >
        <View style={styles.brandCenter}>
          <KudiNodeLogo size="large" variant="light" showSub={true} />
        </View>
      </LinearGradient>

      {/* White lift sheet */}
      <ScrollView
        style={styles.sheet}
        contentContainerStyle={[
          styles.sheetContent,
          { paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dragHandle} />

        <Text style={styles.heading}>{t("login.welcomeBack")}</Text>
        <Text style={styles.subheading}>{t("login.signInSub")}</Text>

        {error && (
          <View style={styles.errorBox}>
            <Icon name="alert-circle" size={15} color="#D97706" />
            <Text style={styles.errorMsg}>{error}</Text>
          </View>
        )}

        <View style={styles.fieldsBlock}>
          <FloatingLabelInput
            label={t("login.phone")}
            prefix="+234"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={11}
            trailingIcon="call"
          />

          <FloatingLabelInput
            label={t("login.password")}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            trailingIcon={showPassword ? "eye-off" : "eye"}
            onTrailingIconPress={() => setShowPassword((p) => !p)}
          />

          <TouchableOpacity activeOpacity={0.7} style={styles.forgotRow}>
            <Text style={styles.forgotText}>{t("login.forgotPassword")}</Text>
          </TouchableOpacity>
        </View>

        {/* Sign in CTA */}
        <TouchableOpacity
          style={[styles.ctaBtn, shadows.button]}
          onPress={handleLogin}
          activeOpacity={0.88}
          disabled={loading}
        >
          <LinearGradient
            colors={[colors.primaryLight, colors.primaryDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGrad}
          >
            {loading ? (
              <Icon name="sync" size={20} color={colors.white} />
            ) : (
              <>
                <Text style={styles.ctaText}>{t("login.signIn")}</Text>
                <Icon name="arrow-forward" size={18} color={colors.white} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t("login.newToKudiNode")}</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Register link */}
        <TouchableOpacity
          style={styles.registerBtn}
          onPress={() => nav.navigate("RegisterKYC")}
          activeOpacity={0.8}
        >
          <Icon name="person-add" size={16} color={colors.primaryMid} />
          <Text style={styles.registerBtnText}>{t("login.createAccount")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  heroBand: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl + spacing.xl,
  },
  brandCenter: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.white,
    marginTop: -(spacing.xxxl),
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
  },
  sheetContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: spacing.xl,
  },
  heading: {
    fontSize: typography.sizes.h2,
    fontWeight: "900",
    color: colors.textDark,
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: typography.sizes.small,
    color: colors.textMuted,
    marginTop: 3,
    marginBottom: spacing.lg,
    fontWeight: "500",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorMsg: {
    flex: 1,
    fontSize: typography.sizes.small,
    color: "#92400E",
    fontWeight: "600",
  },
  fieldsBlock: { gap: 0 },
  forgotRow: {
    alignSelf: "flex-end",
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  forgotText: {
    fontSize: typography.sizes.small,
    color: colors.primaryMid,
    fontWeight: "700",
  },
  ctaBtn: {
    borderRadius: radius.xl,
    overflow: "hidden",
    marginBottom: spacing.xl,
  },
  ctaGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 17,
  },
  ctaText: {
    fontSize: typography.sizes.body,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: 0.4,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: typography.sizes.small,
    color: colors.textMuted,
    fontWeight: "600",
  },
  registerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    backgroundColor: colors.accentLight,
  },
  registerBtnText: {
    fontSize: typography.sizes.body,
    fontWeight: "800",
    color: colors.primaryMid,
  },
});
