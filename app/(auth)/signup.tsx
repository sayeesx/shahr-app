// app/(auth)/signup.tsx — Sign Up Screen
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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AC, AF, AS, AR } from '../../lib/authTheme';
import { AuthField } from '../../components/auth/AuthField';
import { AuthButton } from '../../components/auth/AuthButton';
import { AuthToast } from '../../components/auth/AuthToast';
import { CountryPicker, COUNTRIES, Country } from '../../components/auth/CountryPicker';
import { signUp } from '../../lib/supabase';

type Errs = { name?: string; email?: string; phone?: string; password?: string };

function validate(name: string, email: string, password: string): Errs {
  const e: Errs = {};
  if (!name.trim()) e.name = 'Full name is required';
  if (!email) e.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email address';
  if (!password) e.password = 'Password is required';
  else if (password.length < 6) e.password = 'At least 6 characters required';
  return e;
}

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [errors, setErrors] = useState<Errs>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [phoneFocused, setPhoneFocused] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const fadeY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.spring(fadeY, { toValue: 0, useNativeDriver: true, speed: 12, bounciness: 3 }),
    ]).start();
  }, []);

  const flash = (msg: string, type: 'success' | 'error' | 'warning') => {
    setToast({ msg, type });
    if (type !== 'success') setTimeout(() => setToast(null), 3500);
  };

  const clearErr = (k: keyof Errs) => setErrors((p) => ({ ...p, [k]: undefined }));

  const handleSignup = async () => {
    const errs = validate(name, email, password);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const fullPhone = phone ? `${country.dial}${phone}` : '';
      await signUp(email, password, name, fullPhone);

      // Flash then redirect to login with prefilled email
      flash('Account created! Redirecting…', 'success');
      setTimeout(() => {
        router.replace({
          pathname: '/(auth)',
          params: {
            prefillEmail: email,
            successMessage: 'Account created successfully. Please sign in.',
          },
        });
      }, 1400);
    } catch (e: any) {
      flash(e.message || 'Sign up failed. Please try again.', 'error');
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

            {/* ── Back ── */}
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.6}>
              <Ionicons name="arrow-back" size={20} color={AC.textSub} />
            </TouchableOpacity>

            {/* ── Heading ── */}
            <View style={s.head}>
              <Text style={[s.greeting, { fontFamily: AF.regular }]}>Join Shahr</Text>
              <Text style={[s.title, { fontFamily: AF.bold }]}>Create Account</Text>
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
                label="Full Name"
                iconName="person-outline"
                value={name}
                onChangeText={(t) => { setName(t); clearErr('name'); }}
                error={errors.name}
                autoCorrect={false}
              />

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

              {/* ── Phone with country picker ── */}
              <View style={s.phoneOuter}>
                <Animated.View
                  style={[
                    s.phoneField,
                    {
                      borderColor: errors.phone
                        ? AC.error
                        : phoneFocused
                          ? AC.border
                          : AC.borderSubtle,
                    },
                  ]}
                >
                  <Ionicons
                    name="call-outline"
                    size={17}
                    color={phoneFocused ? AC.primary : AC.textMuted}
                    style={s.phoneIcon}
                  />
                  <CountryPicker selected={country} onSelect={setCountry} />
                  <TextInput
                    style={[s.phoneInput, { fontFamily: AF.regular }]}
                    placeholder="Phone (optional)"
                    placeholderTextColor={AC.textMuted}
                    value={phone}
                    onChangeText={(t) => { setPhone(t); clearErr('phone'); }}
                    onFocus={() => setPhoneFocused(true)}
                    onBlur={() => setPhoneFocused(false)}
                    keyboardType="phone-pad"
                    selectionColor={AC.primary}
                  />
                </Animated.View>
                {errors.phone ? (
                  <Text style={[s.phoneErr, { fontFamily: AF.regular }]}>{errors.phone}</Text>
                ) : null}
              </View>

              <AuthField
                label="Password (min 6 characters)"
                iconName="lock-closed-outline"
                value={password}
                onChangeText={(t) => { setPassword(t); clearErr('password'); }}
                error={errors.password}
                isPassword
              />
            </View>

            {/* ── Actions ── */}
            <View style={s.actions}>
              <AuthButton label="Create Account" onPress={handleSignup} loading={loading} />

              <View style={s.loginRow}>
                <Text style={[s.loginLbl, { fontFamily: AF.regular }]}>
                  Already have an account?
                </Text>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.6}>
                  <Text style={[s.loginLink, { fontFamily: AF.semibold }]}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Terms ── */}
            <Text style={[s.terms, { fontFamily: AF.regular }]}>
              By creating an account you agree to our{' '}
              <Text style={s.termsLink}>Terms</Text>
              {' '}and{' '}
              <Text style={s.termsLink}>Privacy Policy</Text>
            </Text>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AC.bg },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: AS.pad, paddingTop: 24, paddingBottom: 48 },
  inner: { flex: 1 },

  backBtn: {
    width: 40, height: 40,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: AC.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  head: { marginBottom: 32 },
  greeting: { fontSize: 15, color: AC.textSub, letterSpacing: 0.3, marginBottom: 6 },
  title: { fontSize: 36, color: AC.text, letterSpacing: 0.2, lineHeight: 42 },
  accent: {
    width: 36, height: 3, borderRadius: 100,
    backgroundColor: AC.primary, marginTop: 12,
  },

  toastWrap: { marginBottom: 18 },

  form: { gap: AS.gap, marginBottom: 4 },

  /* Phone field */
  phoneOuter: { width: '100%' },
  phoneField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AC.bg,
    borderRadius: AR.field,
    borderWidth: 1.5,
    height: AS.fieldHeight,
    paddingHorizontal: 20,
  },
  phoneIcon: { marginRight: 10 },
  phoneInput: { flex: 1, color: AC.text, fontSize: 15, letterSpacing: 0.2 },
  phoneErr: { color: AC.error, fontSize: 11.5, marginTop: 5, marginLeft: 22, letterSpacing: 0.1 },

  actions: { marginTop: 32, gap: 22 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  loginLbl: { fontSize: 14, color: AC.textSub },
  loginLink: { fontSize: 14, color: AC.text, textDecorationLine: 'underline' },

  terms: { textAlign: 'center', fontSize: 12, color: AC.textMuted, lineHeight: 18, marginTop: 28 },
  termsLink: { color: AC.text, textDecorationLine: 'underline' },
});