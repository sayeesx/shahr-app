// app/(auth)/forgot-password.tsx — Forgot Password Screen
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

type Method = 'email' | 'phone';

export default function ForgotPasswordScreen() {
    const [method, setMethod] = useState<Method>('email');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [country, setCountry] = useState<Country>(COUNTRIES[0]);
    const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [phoneFocused, setPhoneFocused] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'warning' } | null>(null);

    /* Entrance */
    const fade = useRef(new Animated.Value(0)).current;
    const fadeY = useRef(new Animated.Value(24)).current;

    /* Toggle pill animation */
    const pillX = useRef(new Animated.Value(0)).current;  // 0 = email side, 1 = phone side
    const fldFade = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, { toValue: 1, duration: 480, useNativeDriver: true }),
            Animated.spring(fadeY, { toValue: 0, useNativeDriver: true, speed: 12, bounciness: 3 }),
        ]).start();
    }, []);

    const switchMethod = (next: Method) => {
        if (next === method) return;
        setErrors({});
        // fade out → switch → fade in
        Animated.timing(fldFade, { toValue: 0, duration: 110, useNativeDriver: true }).start(() => {
            setMethod(next);
            Animated.parallel([
                Animated.spring(pillX, { toValue: next === 'phone' ? 1 : 0, useNativeDriver: false, speed: 22, bounciness: 0 }),
                Animated.timing(fldFade, { toValue: 1, duration: 180, useNativeDriver: true }),
            ]).start();
        });
    };

    const pillTranslate = pillX.interpolate({ inputRange: [0, 1], outputRange: ['2%', '50%'] });

    const flash = (msg: string, type: 'success' | 'error' | 'warning') => {
        setToast({ msg, type });
        if (type !== 'success') setTimeout(() => setToast(null), 3500);
    };

    const handleReset = async () => {
        const errs: { email?: string; phone?: string } = {};
        if (method === 'email') {
            if (!email) errs.email = 'Email is required';
            else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address';
        } else {
            if (!phone) errs.phone = 'Phone number is required';
        }
        setErrors(errs);
        if (Object.keys(errs).length) return;

        setLoading(true);
        try {
            // TODO: supabase.auth.resetPasswordForEmail(email) or OTP
            await new Promise((r) => setTimeout(r, 1400));
            setSent(true);
        } catch (e: any) {
            flash(e.message || 'Something went wrong. Try again.', 'error');
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
                            <Text style={[s.greeting, { fontFamily: AF.regular }]}>
                                {sent ? 'All done' : 'Forgot password?'}
                            </Text>
                            <Text style={[s.title, { fontFamily: AF.bold }]}>Reset Password</Text>
                            <View style={s.accent} />
                        </View>

                        {/* ── Toast ── */}
                        {toast && (
                            <View style={s.toastWrap}>
                                <AuthToast message={toast.msg} type={toast.type} visible={!!toast} />
                            </View>
                        )}

                        {sent ? (
                            /* ── Success state ── */
                            <View style={s.successBox}>
                                <View style={s.successCircle}>
                                    <Ionicons name="checkmark" size={36} color={AC.primary} />
                                </View>
                                <Text style={[s.successTitle, { fontFamily: AF.semibold }]}>
                                    {method === 'email' ? 'Check your inbox' : 'Check your messages'}
                                </Text>
                                <Text style={[s.successBody, { fontFamily: AF.regular }]}>
                                    {method === 'email'
                                        ? `A reset link was sent to ${email}.`
                                        : `An OTP was sent to ${country.dial} ${phone}.`}
                                </Text>
                                <View style={{ marginTop: 10, width: '100%' }}>
                                    <AuthButton
                                        label="Back to Sign In"
                                        onPress={() => router.replace('/(auth)')}
                                    />
                                </View>
                            </View>
                        ) : (
                            <>
                                {/* ── Subtext ── */}
                                <Text style={[s.sub, { fontFamily: AF.regular }]}>
                                    Choose how you'd like to receive your reset instructions.
                                </Text>

                                {/* ── Method toggle ── */}
                                <View style={s.toggleTrack}>
                                    <Animated.View style={[s.pill, { left: pillTranslate }]} />
                                    <TouchableOpacity style={s.toggleOpt} onPress={() => switchMethod('email')}>
                                        <Ionicons
                                            name="mail-outline" size={13}
                                            color={method === 'email' ? AC.text : AC.textMuted}
                                        />
                                        <Text style={[s.toggleTxt, { fontFamily: AF.semibold, color: method === 'email' ? AC.text : AC.textMuted }]}>
                                            Email
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={s.toggleOpt} onPress={() => switchMethod('phone')}>
                                        <Ionicons
                                            name="phone-portrait-outline" size={13}
                                            color={method === 'phone' ? AC.text : AC.textMuted}
                                        />
                                        <Text style={[s.toggleTxt, { fontFamily: AF.semibold, color: method === 'phone' ? AC.text : AC.textMuted }]}>
                                            Phone
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* ── Animated field ── */}
                                <Animated.View style={[s.fieldWrap, { opacity: fldFade }]}>
                                    {method === 'email' ? (
                                        <AuthField
                                            label="Email address"
                                            iconName="mail-outline"
                                            value={email}
                                            onChangeText={(t) => { setEmail(t); setErrors((p) => ({ ...p, email: undefined })); }}
                                            error={errors.email}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                        />
                                    ) : (
                                        <View style={s.phoneOuter}>
                                            <View
                                                style={[
                                                    s.phoneField,
                                                    { borderColor: errors.phone ? AC.error : phoneFocused ? AC.border : AC.borderSubtle },
                                                ]}
                                            >
                                                <Ionicons
                                                    name="call-outline" size={17}
                                                    color={phoneFocused ? AC.primary : AC.textMuted}
                                                    style={s.phoneIcon}
                                                />
                                                <CountryPicker selected={country} onSelect={setCountry} />
                                                <TextInput
                                                    style={[s.phoneInput, { fontFamily: AF.regular }]}
                                                    placeholder="Phone number"
                                                    placeholderTextColor={AC.textMuted}
                                                    value={phone}
                                                    onChangeText={(t) => { setPhone(t); setErrors((p) => ({ ...p, phone: undefined })); }}
                                                    onFocus={() => setPhoneFocused(true)}
                                                    onBlur={() => setPhoneFocused(false)}
                                                    keyboardType="phone-pad"
                                                    selectionColor={AC.primary}
                                                />
                                            </View>
                                            {errors.phone ? (
                                                <Text style={[s.phoneErr, { fontFamily: AF.regular }]}>{errors.phone}</Text>
                                            ) : null}
                                        </View>
                                    )}
                                </Animated.View>

                                {/* ── CTA ── */}
                                <View style={s.cta}>
                                    <AuthButton
                                        label={method === 'email' ? 'Send Reset Link' : 'Send OTP'}
                                        onPress={handleReset}
                                        loading={loading}
                                    />
                                </View>
                            </>
                        )}

                        {/* ── Footer link ── */}
                        {!sent && (
                            <TouchableOpacity style={s.footerLink} onPress={() => router.back()} activeOpacity={0.6}>
                                <Ionicons name="arrow-back-outline" size={13} color={AC.textMuted} />
                                <Text style={[s.footerTxt, { fontFamily: AF.regular }]}>Back to Sign In</Text>
                            </TouchableOpacity>
                        )}

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

    head: { marginBottom: 20 },
    greeting: { fontSize: 15, color: AC.textSub, letterSpacing: 0.3, marginBottom: 6 },
    title: { fontSize: 36, color: AC.text, letterSpacing: 0.2, lineHeight: 42 },
    accent: { width: 36, height: 3, borderRadius: 100, backgroundColor: AC.primary, marginTop: 12 },

    toastWrap: { marginBottom: 18 },

    sub: { fontSize: 14, color: AC.textSub, lineHeight: 20, marginBottom: 24 },

    /* Toggle */
    toggleTrack: {
        flexDirection: 'row',
        height: 48,
        backgroundColor: AC.surface,
        borderRadius: AR.toggle,
        borderWidth: 1.5,
        borderColor: AC.borderSubtle,
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
    },
    pill: {
        position: 'absolute',
        top: 4,
        width: '48%',
        height: 38,
        borderRadius: 100,
        backgroundColor: AC.primary,
    },
    toggleOpt: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        zIndex: 1,
    },
    toggleTxt: { fontSize: 13.5 },

    fieldWrap: { width: '100%', marginBottom: 4 },

    /* Phone */
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

    cta: { marginTop: 28 },

    /* Footer */
    footerLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 32,
    },
    footerTxt: { fontSize: 13, color: AC.textMuted },

    /* Success */
    successBox: {
        alignItems: 'center',
        gap: 14,
        paddingTop: 16,
    },
    successCircle: {
        width: 80, height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: AC.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    successTitle: { fontSize: 20, color: AC.text, letterSpacing: 0.2 },
    successBody: { fontSize: 14, color: AC.textSub, textAlign: 'center', lineHeight: 21 },
});