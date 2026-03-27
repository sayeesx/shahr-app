// app/(auth)/index.tsx  — Login Screen
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { AC, AF, AS, AR } from '../../lib/authTheme';
import { AuthField } from '../../components/auth/AuthField';
import { AuthButton } from '../../components/auth/AuthButton';
import { AuthToast } from '../../components/auth/AuthToast';
import { signIn } from '../../lib/supabase';
import { useAppStore } from '../../store/useAppStore';

const TERMS_URL = 'https://shahr.app/terms';
const PRIVACY_URL = 'https://shahr.app/privacy';

type Errs = { email?: string; password?: string };

function validate(email: string, password: string): Errs {
  const e: Errs = {};
  if (!email) e.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email address';
  if (!password) e.password = 'Password is required';
  else if (password.length < 6) e.password = 'At least 6 characters required';
  return e;
}

export default function LoginScreen() {
  const params = useLocalSearchParams<{ prefillEmail?: string; successMessage?: string }>();
  const setSession = useAppStore((s) => s.setSession);

  const [email, setEmail] = useState(params.prefillEmail ?? '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errs>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const fadeY = useRef(new Animated.Value(24)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.spring(fadeY, { toValue: 0, useNativeDriver: true, speed: 12, bounciness: 3 }),
    ]).start();

    if (params.successMessage) {
      setToast({ msg: params.successMessage, type: 'success' });
      const t = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(t);
    }
  }, []);

  const flash = (msg: string, type: 'success' | 'error' | 'warning') => {
    setToast({ msg, type });
    if (type !== 'success') setTimeout(() => setToast(null), 3500);
  };

  const clearErr = (k: keyof Errs) => setErrors((p) => ({ ...p, [k]: undefined }));

  const handleLogin = async () => {
    const errs = validate(email, password);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const { user } = await signIn(email, password);
      await setSession({
        user: {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata,
        },
        name: user.user_metadata?.name ?? '',
        phone: user.user_metadata?.phone ?? '',
        email: user.email ?? '',
      });
      router.replace('/(main)');
    } catch (e: any) {
      const msg = e.message || 'Login failed. Please try again.';
      if (msg.toLowerCase().includes('network')) {
        flash('Network error. Please check your connection.', 'error');
      } else if (msg.toLowerCase().includes('invalid')) {
        flash('Invalid email or password.', 'error');
      } else {
        flash(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={AC.bg} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.kav}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[s.inner, { opacity: fade, transform: [{ translateY: fadeY }] }]}>

            {/* ── Heading ── */}
            <View style={s.head}>
              <Text style={[s.greeting, { fontFamily: AF.regular }]}>Welcome back</Text>
              <Text style={[s.title, { fontFamily: AF.bold }]}>Sign In</Text>
              <View style={s.accent} />
            </View>

            {/* ── Toast ── */}
            {toast && (
              <View style={s.toastWrap}>
                <AuthToast message={toast.msg} type={toast.type} visible={!!toast} />
              </View>
            )}

            {/* ── Fields ── */}
            <View style={s.form}>
              <AuthField
                label="Email address"
                iconName="mail-outline"
                value={email}
                onChangeText={(t) => { setEmail(t); clearErr('email'); }}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <AuthField
                label="Password"
                iconName="lock-closed-outline"
                value={password}
                onChangeText={(t) => { setPassword(t); clearErr('password'); }}
                error={errors.password}
                isPassword
              />

              <TouchableOpacity
                style={s.forgot}
                onPress={() => router.push('/(auth)/forgot-password')}
                activeOpacity={0.6}
              >
                <View style={s.linkUnderline}>
                  <Text style={[s.forgotTxt, { fontFamily: AF.semibold }]}>Forgot password?</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* ── Actions ── */}
            <View style={s.actions}>
              <AuthButton label="Sign In" onPress={handleLogin} loading={loading} />

              <View style={s.divRow}>
                <View style={s.divLine} />
                <Text style={[s.divTxt, { fontFamily: AF.regular }]}>or</Text>
                <View style={s.divLine} />
              </View>

              <View style={s.signupRow}>
                <Text style={[s.signupLbl, { fontFamily: AF.regular }]}>
                  Don't have an account?
                </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/signup')} activeOpacity={0.6}>
                  <View style={s.linkUnderline}>
                    <Text style={[s.signupLink, { fontFamily: AF.semibold }]}>Sign Up</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Terms footer ── */}
            <View style={s.termsRow}>
              <Text style={[s.terms, { fontFamily: AF.regular }]}>By signing in you agree to our </Text>
              <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)} activeOpacity={0.6}>
                <View style={s.linkUnderline}>
                  <Text style={[s.termsLinkTxt, { fontFamily: AF.regular }]}>Terms</Text>
                </View>
              </TouchableOpacity>
              <Text style={[s.terms, { fontFamily: AF.regular }]}> and </Text>
              <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)} activeOpacity={0.6}>
                <View style={s.linkUnderline}>
                  <Text style={[s.termsLinkTxt, { fontFamily: AF.regular }]}>Privacy Policy</Text>
                </View>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AC.bg },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: AS.pad, paddingTop: 56, paddingBottom: 48 },
  inner: { flex: 1 },

  /* heading */
  head: { marginBottom: 40 },
  greeting: { fontSize: 16, color: AC.textSub, letterSpacing: 0.3, marginBottom: 6, lineHeight: 22 },
  title: { fontSize: 36, color: AC.text, letterSpacing: 0.2, lineHeight: 42 },
  accent: {
    width: 36, height: 3, borderRadius: 100,
    backgroundColor: AC.primary, marginTop: 12,
  },

  toastWrap: { marginBottom: 20 },

  /* form */
  form: { gap: AS.gap, marginBottom: 4 },

  forgot: { alignSelf: 'flex-end', marginTop: 2 },
  forgotTxt: { fontSize: 13, color: AC.text, letterSpacing: 0.2 },
  linkUnderline: { borderBottomWidth: 1, borderBottomColor: AC.borderSubtle },

  /* actions */
  actions: { marginTop: 32, gap: 22 },

  divRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  divLine: { flex: 1, height: 1, backgroundColor: AC.borderSubtle },
  divTxt: { fontSize: 13, color: AC.textSub, letterSpacing: 0.3 },

  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  signupLbl: { fontSize: 14, color: AC.textSub, lineHeight: 20 },
  signupLink: { fontSize: 14, color: AC.text },

  terms: { fontSize: 12, color: AC.textSub, lineHeight: 18 },
  termsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  termsLinkTxt: { fontSize: 12, color: AC.text },
});