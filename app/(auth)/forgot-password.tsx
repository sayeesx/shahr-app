// app/(auth)/forgot-password.tsx — OTP-based Forgot Password with Email/Phone toggle
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
type Step = 'input' | 'otp' | 'reset';

export default function ForgotPasswordScreen() {
    // Method toggle
    const [method, setMethod] = useState<Method>('email');
    const [step, setStep] = useState<Step>('input');

    // Input fields
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [country, setCountry] = useState<Country>(COUNTRIES[0]);
    const [phoneFocused, setPhoneFocused] = useState(false);
    const [inputErrors, setInputErrors] = useState<{ email?: string; phone?: string }>({});

    // OTP
    const [otp, setOtp] = useState(['', '', '', '']);
    const otpRefs = useRef<(TextInput | null)[]>([null, null, null, null]);

    // Reset password
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordErrors, setPasswordErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

    // Shared
    const [loading, setLoading] = useState(false);
    const [btnLabel, setBtnLabel] = useState('Send OTP');
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'warning' } | null>(null);

    // Entrance animation
    const fade = useRef(new Animated.Value(0)).current;
    const fadeY = useRef(new Animated.Value(24)).current;

    // Toggle pill animation
    const pillX = useRef(new Animated.Value(0)).current;
    const fldFade = useRef(new Animated.Value(1)).current;

    // Step transition
    const stepFade = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, { toValue: 1, duration: 480, useNativeDriver: true }),
            Animated.spring(fadeY, { toValue: 0, useNativeDriver: true, speed: 12, bounciness: 3 }),
        ]).start();
    }, []);

    const flash = useCallback((msg: string, type: 'success' | 'error' | 'warning') => {
        setToast({ msg, type });
        if (type !== 'success') setTimeout(() => setToast(null), 3500);
    }, []);

    // ── Toggle method ───────────────────────────────────────────────────────
    const switchMethod = (next: Method) => {
        if (next === method || step !== 'input') return;
        setInputErrors({});
        Animated.timing(fldFade, { toValue: 0, duration: 110, useNativeDriver: true }).start(() => {
            setMethod(next);
            Animated.parallel([
                Animated.spring(pillX, { toValue: next === 'phone' ? 1 : 0, useNativeDriver: false, speed: 22, bounciness: 0 }),
                Animated.timing(fldFade, { toValue: 1, duration: 180, useNativeDriver: true }),
            ]).start();
        });
    };

    const pillTranslate = pillX.interpolate({ inputRange: [0, 1], outputRange: ['2%', '50%'] });

    // ── Step transition ─────────────────────────────────────────────────────
    const goToStep = (nextStep: Step) => {
        Animated.timing(stepFade, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
            setStep(nextStep);
            Animated.timing(stepFade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        });
    };

    // ── Step 1: Send OTP ────────────────────────────────────────────────────
    const handleSendOTP = async () => {
        const errs: { email?: string; phone?: string } = {};
        if (method === 'email') {
            if (!email) errs.email = 'Email is required';
            else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address';
        } else {
            if (!phone) errs.phone = 'Phone number is required';
        }
        setInputErrors(errs);
        if (Object.keys(errs).length) return;

        setLoading(true);
        setBtnLabel('Sending…');
        try {
            // TODO: Call your backend to send OTP
            await new Promise((r) => setTimeout(r, 1200));
            flash('Verification code sent!', 'success');
            setTimeout(() => setToast(null), 2000);
            goToStep('otp');
        } catch (e: any) {
            flash(e.message || 'Failed to send OTP. Try again.', 'error');
        } finally {
            setLoading(false);
            setBtnLabel('Send OTP');
        }
    };

    // ── Step 2: OTP input ───────────────────────────────────────────────────
    const handleOtpChange = (text: string, index: number) => {
        const digit = text.replace(/[^0-9]/g, '').slice(-1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        if (digit && index < 3) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            const newOtp = [...otp];
            newOtp[index - 1] = '';
            setOtp(newOtp);
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOTP = async () => {
        const code = otp.join('');
        if (code.length < 4) {
            flash('Please enter the complete 4-digit code.', 'warning');
            return;
        }
        setLoading(true);
        try {
            // TODO: Verify OTP with your backend
            await new Promise((r) => setTimeout(r, 1000));
            flash('Code verified!', 'success');
            setTimeout(() => setToast(null), 1500);
            goToStep('reset');
        } catch (e: any) {
            flash(e.message || 'Invalid code. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 3: Reset password ──────────────────────────────────────────────
    const handleResetPassword = async () => {
        const errs: { newPassword?: string; confirmPassword?: string } = {};
        if (!newPassword) errs.newPassword = 'Password is required';
        else if (newPassword.length < 6) errs.newPassword = 'At least 6 characters required';
        if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
        else if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
        setPasswordErrors(errs);
        if (Object.keys(errs).length) return;

        setLoading(true);
        setBtnLabel('Resetting…');
        try {
            // TODO: Call your backend to reset the password
            await new Promise((r) => setTimeout(r, 1200));
            setBtnLabel('Success');
            setLoading(false);
            flash('Password reset successfully!', 'success');
            setTimeout(() => {
                router.replace({
                    pathname: '/(auth)',
                    params: {
                        prefillEmail: method === 'email' ? email : '',
                        successMessage: 'Password reset successfully. Please sign in.',
                    },
                });
            }, 1800);
        } catch (e: any) {
            flash(e.message || 'Failed to reset password. Try again.', 'error');
            setLoading(false);
            setBtnLabel('Reset Password');
        }
    };

    // ── Step info ───────────────────────────────────────────────────────────
    const stepIndex = step === 'input' ? 0 : step === 'otp' ? 1 : 2;
    const heading = step === 'input'
        ? 'Forgot password?'
        : step === 'otp'
            ? 'Enter OTP'
            : 'New Password';
    const subtitle = step === 'input'
        ? 'Choose how you\'d like to receive your reset code.'
        : step === 'otp'
            ? method === 'email'
                ? `We sent a 4-digit code to ${email}`
                : `We sent a 4-digit code to ${country.dial} ${phone}`
            : 'Choose a new password for your account.';

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
                        <TouchableOpacity
                            style={s.backBtn}
                            onPress={() => {
                                if (step === 'otp') goToStep('input');
                                else if (step === 'reset') goToStep('otp');
                                else router.back();
                            }}
                            activeOpacity={0.6}
                        >
                            <Ionicons name="arrow-back" size={20} color={AC.textSub} />
                        </TouchableOpacity>

                        {/* ── Heading ── */}
                        <View style={s.head}>
                            <Text style={[s.greeting, { fontFamily: AF.regular }]}>{heading}</Text>
                            <Text style={[s.title, { fontFamily: AF.bold }]}>Reset Password</Text>
                            <View style={s.accent} />
                        </View>

                        {/* ── Step indicator ── */}
                        <View style={s.stepRow}>
                            {[0, 1, 2].map((i) => (
                                <View
                                    key={i}
                                    style={[
                                        s.stepDot,
                                        i <= stepIndex && s.stepDotActive,
                                        i < 2 && s.stepDotGap,
                                    ]}
                                />
                            ))}
                            <Text style={[s.stepLabel, { fontFamily: AF.regular }]}>
                                Step {stepIndex + 1} of 3
                            </Text>
                        </View>

                        {/* ── Toast ── */}
                        {toast && (
                            <View style={s.toastWrap}>
                                <AuthToast message={toast.msg} type={toast.type} visible={!!toast} />
                            </View>
                        )}

                        {/* ── Subtitle ── */}
                        <Text style={[s.sub, { fontFamily: AF.regular }]}>{subtitle}</Text>

                        {/* ── Step content ── */}
                        <Animated.View style={{ opacity: stepFade }}>

                            {/* ──── STEP 1: Input ──── */}
                            {step === 'input' && (
                                <>
                                    {/* Method toggle */}
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

                                    {/* Animated field */}
                                    <Animated.View style={[s.fieldWrap, { opacity: fldFade }]}>
                                        {method === 'email' ? (
                                            <AuthField
                                                label="Email address"
                                                iconName="mail-outline"
                                                value={email}
                                                onChangeText={(t) => { setEmail(t); setInputErrors((p) => ({ ...p, email: undefined })); }}
                                                error={inputErrors.email}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                autoCorrect={false}
                                            />
                                        ) : (
                                            <View style={s.phoneOuter}>
                                                <View
                                                    style={[
                                                        s.phoneField,
                                                        { borderColor: inputErrors.phone ? AC.error : phoneFocused ? AC.border : AC.borderSubtle },
                                                    ]}
                                                >
                                                    <Ionicons
                                                        name="call-outline" size={17}
                                                        color={inputErrors.phone ? AC.error : phoneFocused ? AC.text : AC.textSub}
                                                        style={s.phoneIcon}
                                                    />
                                                    <CountryPicker selected={country} onSelect={setCountry} />
                                                    <TextInput
                                                        style={[s.phoneInput, { fontFamily: AF.regular }]}
                                                        placeholder="Phone number"
                                                        placeholderTextColor={AC.textMuted}
                                                        value={phone}
                                                        onChangeText={(t) => { setPhone(t); setInputErrors((p) => ({ ...p, phone: undefined })); }}
                                                        onFocus={() => setPhoneFocused(true)}
                                                        onBlur={() => setPhoneFocused(false)}
                                                        keyboardType="phone-pad"
                                                        selectionColor={AC.text}
                                                    />
                                                </View>
                                                {inputErrors.phone ? (
                                                    <Text style={[s.phoneErr, { fontFamily: AF.regular }]}>{inputErrors.phone}</Text>
                                                ) : null}
                                            </View>
                                        )}
                                    </Animated.View>

                                    <View style={s.cta}>
                                        <AuthButton label={btnLabel} onPress={handleSendOTP} loading={loading} />
                                    </View>
                                </>
                            )}

                            {/* ──── STEP 2: OTP ──── */}
                            {step === 'otp' && (
                                <View style={s.stepContent}>
                                    <View style={s.otpRow}>
                                        {otp.map((digit, index) => (
                                            <TextInput
                                                key={index}
                                                ref={(ref) => { otpRefs.current[index] = ref; }}
                                                style={[
                                                    s.otpInput,
                                                    { fontFamily: AF.bold },
                                                    digit ? s.otpInputFilled : null,
                                                ]}
                                                value={digit}
                                                onChangeText={(text) => handleOtpChange(text, index)}
                                                onKeyPress={(e) => handleOtpKeyPress(e, index)}
                                                keyboardType="number-pad"
                                                maxLength={1}
                                                selectionColor={AC.text}
                                                autoFocus={index === 0}
                                            />
                                        ))}
                                    </View>

                                    <TouchableOpacity
                                        style={s.resendRow}
                                        onPress={() => {
                                            setOtp(['', '', '', '']);
                                            handleSendOTP();
                                        }}
                                        activeOpacity={0.6}
                                    >
                                        <Ionicons name="refresh-outline" size={14} color={AC.text} />
                                        <Text style={[s.resendTxt, { fontFamily: AF.semibold }]}>Resend Code</Text>
                                    </TouchableOpacity>

                                    <View style={s.cta}>
                                        <AuthButton label="Verify Code" onPress={handleVerifyOTP} loading={loading} />
                                    </View>
                                </View>
                            )}

                            {/* ──── STEP 3: Reset Password ──── */}
                            {step === 'reset' && (
                                <View style={s.stepContent}>
                                    <AuthField
                                        label="New password (min 6 characters)"
                                        iconName="lock-closed-outline"
                                        value={newPassword}
                                        onChangeText={(t) => { setNewPassword(t); setPasswordErrors((p) => ({ ...p, newPassword: undefined })); }}
                                        error={passwordErrors.newPassword}
                                        isPassword
                                    />

                                    <AuthField
                                        label="Confirm new password"
                                        iconName="lock-closed-outline"
                                        value={confirmPassword}
                                        onChangeText={(t) => { setConfirmPassword(t); setPasswordErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                                        error={passwordErrors.confirmPassword}
                                        isPassword
                                    />

                                    <View style={s.cta}>
                                        <AuthButton
                                            label={btnLabel}
                                            onPress={handleResetPassword}
                                            loading={loading}
                                        />
                                    </View>
                                </View>
                            )}

                        </Animated.View>

                        {/* ── Footer ── */}
                        {step === 'input' && (
                            <TouchableOpacity style={s.footerLink} onPress={() => router.back()} activeOpacity={0.6}>
                                <Ionicons name="arrow-back-outline" size={13} color={AC.textSub} />
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
    greeting: { fontSize: 16, color: AC.textSub, letterSpacing: 0.3, marginBottom: 6, lineHeight: 22 },
    title: { fontSize: 36, color: AC.text, letterSpacing: 0.2, lineHeight: 42 },
    accent: { width: 36, height: 3, borderRadius: 100, backgroundColor: AC.primary, marginTop: 12 },

    /* Step indicators */
    stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    stepDot: { width: 28, height: 4, borderRadius: 100, backgroundColor: AC.borderSubtle },
    stepDotActive: { backgroundColor: AC.primary },
    stepDotGap: { marginRight: 6 },
    stepLabel: { fontSize: 12, color: AC.textSub, marginLeft: 12, letterSpacing: 0.2 },

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
    stepContent: { gap: AS.gap },

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

    /* OTP */
    otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 8 },
    otpInput: {
        width: 58, height: 64,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: AC.borderSubtle,
        backgroundColor: AC.bg,
        textAlign: 'center',
        fontSize: 24,
        color: AC.text,
    },
    otpInputFilled: {
        borderColor: AC.primary,
        backgroundColor: 'rgba(166,217,90,0.08)',
    },
    resendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 },
    resendTxt: { fontSize: 13, color: AC.text, letterSpacing: 0.2 },

    cta: { marginTop: 28 },

    /* Footer */
    footerLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 32 },
    footerTxt: { fontSize: 13, color: AC.textSub },
});