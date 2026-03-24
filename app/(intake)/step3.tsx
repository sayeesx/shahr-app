import React, { useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Animated, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useIntakeSubmit } from '../../hooks/useIntakeSubmit';
import { StepIndicator } from '../../components/intake/StepIndicator';

const contactSchema = z.object({
  name:  z.string().min(2, 'Enter your full name'),
  phone: z.string().min(8).regex(/^\+?[\d\s\-()]{8,20}$/, 'Invalid phone'),
  email: z.string().email('Enter a valid email'),
});
type ContactForm = z.infer<typeof contactSchema>;

const INPUT = {
  backgroundColor: '#FFFFFF', borderRadius: 12,
  paddingVertical: 14, paddingHorizontal: 16,
  fontSize: 15, color: '#1E293B',
  borderWidth: 1.5, borderColor: '#E2E8F0',
};

export default function IntakeStep3() {
  const { intakeDraft, updateDraft } = useAppStore();
  const { mutate: submit, isPending } = useIntakeSubmit();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const { control, handleSubmit, formState: { errors } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name:  intakeDraft.contactInfo?.name  ?? '',
      phone: intakeDraft.contactInfo?.phone ?? '',
      email: intakeDraft.contactInfo?.email ?? '',
    },
  });

  const onSubmit = (vals: ContactForm) => {
    updateDraft({ contactInfo: vals });
    submit({ ...intakeDraft, purpose: intakeDraft.purpose!, ...vals } as any);
  };

  const Field = ({ label, name, placeholder, keyboard, error }: any) => (
    <View style={{ marginBottom: 18 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 8 }}>
        {label}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <TextInput
            value={field.value}
            onChangeText={field.onChange}
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
            keyboardType={keyboard ?? 'default'}
            autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
            style={[INPUT, fieldState.error && { borderColor: '#EF4444' }]}
          />
        )}
      />
      {error && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{error}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1, backgroundColor: '#FAFAF8' }}>
        <View style={{ backgroundColor: '#0D3B5C', paddingTop: 56 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
            <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          <View style={{ paddingHorizontal: 24, paddingBottom: 28 }}>
            <Text style={{ color: '#ECC94B', fontSize: 12, fontWeight: '700', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>
              Almost There
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '800', lineHeight: 32 }}>
              Contact{'\n'}Information
            </Text>
          </View>
          <StepIndicator currentStep={3} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
          <Animated.View style={{ opacity: fade }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F9F8', borderRadius: 12, padding: 14, marginBottom: 24, gap: 10, borderWidth: 1, borderColor: '#D1F5F0' }}>
              <Ionicons name="lock-closed-outline" size={16} color="#2ba89a" />
              <Text style={{ color: '#2D6A62', fontSize: 13, flex: 1, lineHeight: 18 }}>
                Your information is private and only used by our concierge team.
              </Text>
            </View>

            <Field label="Full Name"      name="name"  placeholder="e.g. Mohammed Al-Rashid"  error={errors.name?.message} />
            <Field label="Phone Number"   name="phone" placeholder="+971 50 123 4567"          keyboard="phone-pad"    error={errors.phone?.message} />
            <Field label="Email Address"  name="email" placeholder="you@example.com"           keyboard="email-address" error={errors.email?.message} />

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
              activeOpacity={0.85}
              style={{
                backgroundColor: '#0D3B5C', borderRadius: 14,
                paddingVertical: 17, alignItems: 'center',
                flexDirection: 'row', justifyContent: 'center', gap: 8,
                marginTop: 8, opacity: isPending ? 0.7 : 1,
                shadowColor: '#0D3B5C', shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.28, shadowRadius: 10, elevation: 6,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
                {isPending ? 'Submitting...' : 'Submit Request'}
              </Text>
              {!isPending && <Ionicons name="send-outline" size={18} color="#ECC94B" />}
            </TouchableOpacity>

            <Text style={{ textAlign: 'center', marginTop: 16, color: '#94A3B8', fontSize: 12, lineHeight: 18 }}>
              No payment required at this stage.
            </Text>
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
