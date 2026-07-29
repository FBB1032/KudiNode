/**
 * AppNavigator — KudiNode AI
 * All routes registered. Expo Go SDK 54 compatible.
 */
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BottomTabBar }  from './components/BottomTabBar';
import { LanguageProvider } from './context/LanguageContext';
import { Icon } from './components/Icon';
import { colors, radius, shadows } from './theme/theme';
import { AiAdvisorModal } from './components/AiAdvisorModal';

// ── Onboarding & Auth ─────────────────────────────────────────────
import { SplashScreen }       from './screens/SplashScreen';
import { OnboardingScreen }   from './screens/OnboardingScreen';
import { LoginScreen }        from './screens/LoginScreen';
import { RegisterKYCScreen }  from './screens/RegisterKYCScreen';

// ── Tab screens ───────────────────────────────────────────────────
import { HomeScreen }         from './screens/HomeScreen';
import { CoopEsusuScreen }    from './screens/CoopEsusuScreen';
import { TrustScoreScreen }   from './screens/TrustScoreScreen';
import { ProfileScreen }      from './screens/ProfileScreen';

// ── Stack screens ─────────────────────────────────────────────────
import { SalesIntakeScreen }      from './screens/SalesIntakeScreen';
import { VerificationScreen }     from './screens/VerificationScreen';
import { TransferPinScreen }      from './screens/TransferPinScreen';
import { NotificationsScreen }    from './screens/NotificationsScreen';
import { AllTransactionsScreen }  from './screens/AllTransactionsScreen';
import { LedgerScreen }           from './screens/LedgerScreen';
import { CoopCreateScreen }       from './screens/CoopCreateScreen';
import { SecuritySettingsScreen } from './screens/SecuritySettingsScreen';
import { KYCDocumentsScreen }     from './screens/KYCDocumentsScreen';
import { HelpSupportScreen }      from './screens/HelpSupportScreen';
import { ApplyLoanScreen }        from './screens/ApplyLoanScreen';
import { VoiceTransferScreen }    from './screens/VoiceTransferScreen';
import { ManualTransferScreen }   from './screens/ManualTransferScreen';

export type RootStackParamList = {
  Splash:          undefined;
  Onboarding:      undefined;
  Login:           undefined;
  RegisterKYC:     undefined;
  MainTabs:        undefined;
  SalesIntake:     undefined;
  Verification:    undefined;
  TransferPin: {
    prefilledAccount?: string;
    prefilledBank?: string;
    prefilledRecipient?: string;
    prefilledAmount?: string;
  } | undefined;
  TrustScore:      undefined;
  Notifications:   undefined;
  AllTransactions: undefined;
  Profile:         undefined;
  CoopEsusu:       undefined;
  Ledger:          undefined;
  CoopCreate:      undefined;
  SecuritySettings:undefined;
  KYCDocuments:    undefined;
  HelpSupport:     undefined;
  ApplyLoan:       undefined;
  VoiceTransfer:   undefined;
  ManualTransfer:  {
    prefilled?: {
      prefilledRecipient?: string;
      prefilledBank?: string;
      prefilledAccount?: string;
      prefilledAmount?: string;
    };
  } | undefined;
};

export type MainTabsParamList = {
  Home:       undefined;
  CoopEsusu:  undefined;
  LogSales:   undefined;
  WemaCredit: undefined;
  Profile:    undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs  = createBottomTabNavigator<MainTabsParamList>();

function LogSalesPlaceholder() { return <View />; }

function MainTabsNavigator() {
  const [showAdvisor, setShowAdvisor] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <Tabs.Navigator
        tabBar={(props) => <BottomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
        initialRouteName="Home"
      >
        <Tabs.Screen name="Home"       component={HomeScreen} />
        <Tabs.Screen name="CoopEsusu"  component={CoopEsusuScreen} />
        <Tabs.Screen
          name="LogSales"
          component={LogSalesPlaceholder}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate('SalesIntake');
            },
          })}
        />
        <Tabs.Screen name="WemaCredit" component={TrustScoreScreen} />
        <Tabs.Screen name="Profile"    component={ProfileScreen} />
      </Tabs.Navigator>

      {/* 🤖 FLOATING ROBOT AI ADVISOR FAB (Sitting Above Bottom Tab Bar) */}
      <TouchableOpacity
        style={[styles.floatingRobotFab, shadows.button]}
        onPress={() => setShowAdvisor(true)}
        activeOpacity={0.88}
      >
        <View style={styles.robotIconBadge}>
          <Icon name="robot" size={24} color={colors.white} />
        </View>
        <Text style={styles.robotFabText}>KudiBot AI</Text>
      </TouchableOpacity>

      {/* AI Financial Advisor Modal */}
      <AiAdvisorModal visible={showAdvisor} onClose={() => setShowAdvisor(false)} />
    </View>
  );
}

export default function AppNavigator() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <LanguageProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            {/* Splash & Onboarding */}
            <Stack.Screen name="Splash"     component={SplashScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: 'fade' }} />

            {/* Auth */}
            <Stack.Screen name="Login"       component={LoginScreen} />
            <Stack.Screen name="RegisterKYC" component={RegisterKYCScreen} />

            {/* Main tabs */}
            <Stack.Screen
              name="MainTabs"
              component={MainTabsNavigator}
              options={{ animation: 'fade' }}
            />

            {/* Sales flow */}
            <Stack.Screen
              name="SalesIntake"
              component={SalesIntakeScreen}
              options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="Verification" component={VerificationScreen} />

            {/* Finance */}
            <Stack.Screen name="TransferPin"     component={TransferPinScreen} />
            <Stack.Screen name="VoiceTransfer"   component={VoiceTransferScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="ManualTransfer"  component={ManualTransferScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="TrustScore"      component={TrustScoreScreen} />
            <Stack.Screen name="AllTransactions" component={AllTransactionsScreen} />
            <Stack.Screen name="Ledger"          component={LedgerScreen} />
            <Stack.Screen name="ApplyLoan"       component={ApplyLoanScreen} />

            {/* Co-op */}
            <Stack.Screen name="CoopEsusu"  component={CoopEsusuScreen} />
            <Stack.Screen name="CoopCreate" component={CoopCreateScreen} />

            {/* Account & Profile */}
            <Stack.Screen name="Notifications"   component={NotificationsScreen} />
            <Stack.Screen name="Profile"         component={ProfileScreen} />
            <Stack.Screen name="SecuritySettings"component={SecuritySettingsScreen} />
            <Stack.Screen name="KYCDocuments"    component={KYCDocumentsScreen} />
            <Stack.Screen name="HelpSupport"     component={HelpSupportScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  floatingRobotFab: {
    position: 'absolute',
    right: 16,
    bottom: 85, // Sitting comfortably above the bottom tab bar
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryDeep,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    elevation: 8,
    zIndex: 999,
  },
  robotIconBadge: {
    position: 'relative',
  },
  robotPulseDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.successGreen,
    borderWidth: 1.5,
    borderColor: colors.primaryDeep,
  },
  robotFabText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.white,
  },
});
