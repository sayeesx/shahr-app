import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useAppStore } from '../../store/useAppStore';
import { uploadMedicalDocument } from '../../lib/supabase';
import { StepIndicator } from '../../components/intake/StepIndicator';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const medicalSchema = z.object({
  condition_summary: z.string().min(10, 'Please describe your condition (min 10 chars)'),
  country: z.string().min(2, 'Please enter your country'),
  travel_dates_from: z.string().min(1, 'Select travel start date'),
  travel_dates_to: z.string().min(1, 'Select travel end date'),
  budget_range: z.string().min(1, 'Please select a budget range'),
});

const tourismSchema = z.object({
  travelers_count: z.string().min(1, 'Required'),
  interests: z.string().min(2, 'Please describe your interests'),
  travel_dates_from: z.string().min(1, 'Select travel start date'),
  travel_dates_to: z.string().min(1, 'Select travel end date'),
  budget: z.string().min(1, 'Please enter your budget'),
});

type MedicalForm = z.infer<typeof medicalSchema>;
type TourismForm = z.infer<typeof tourismSchema>;

// ─── Shared field styles ──────────────────────────────────────────────────────

const FIELD_CONTAINER = {
  marginBottom: 18,
} as const;

const LABEL_STYLE = {
  fontSize: 13,
  fontWeight: '600' as const,
  color: '#334155',
  marginBottom: 8,
  letterSpacing: 0.3,
};

const INPUT_BASE = {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  paddingVertical: 13,
  paddingHorizontal: 16,
  fontSize: 15,
  color: '#1E293B',
  borderWidth: 1.5,
  borderColor: '#E2E8F0',
};

const INPUT_FOCUSED = {
  borderColor: '#0D3B5C',
};

const INPUT_ERROR = {
  borderColor: '#EF4444',
};

const ERROR_TEXT = {
  fontSize: 12,
  color: '#EF4444',
  marginTop: 5,
  marginLeft: 4,
};

// ─── Budget options ───────────────────────────────────────────────────────────

const BUDGET_OPTIONS = ['< ₹50,000', '₹50K – ₹1L', '₹1L – ₹3L', '₹3L – ₹5L', '₹5L+'];

// ─── Component ───────────────────────────────────────────────────────────────

export default function IntakeStep2() {
  const { intakeDraft, updateDraft } = useAppStore();
  const purpose = intakeDraft.purpose ?? 'tourism';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const [uploadedFile, setUploadedFile] = React.useState<{
    name: string;
    uri: string;
    mimeType: string;
    url?: string;
  } | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const isMedical = purpose === 'medical';

  // Medical form
  const medForm = useForm<MedicalForm>({
    resolver: zodResolver(medicalSchema),
    defaultValues: {
      condition_summary: intakeDraft.medicalFields?.condition_summary ?? '',
      country: intakeDraft.medicalFields?.country ?? '',
      travel_dates_from: intakeDraft.medicalFields?.travel_dates_from ?? '',
      travel_dates_to: intakeDraft.medicalFields?.travel_dates_to ?? '',
      budget_range: intakeDraft.medicalFields?.budget_range ?? '',
    },
  });

  // Tourism form
  const tourForm = useForm<TourismForm>({
    resolver: zodResolver(tourismSchema),
    defaultValues: {
      travelers_count: String(intakeDraft.tourismFields?.travelers_count ?? ''),
      interests: intakeDraft.tourismFields?.interests?.join(', ') ?? '',
      travel_dates_from: intakeDraft.tourismFields?.travel_dates_from ?? '',
      travel_dates_to: intakeDraft.tourismFields?.travel_dates_to ?? '',
      budget: intakeDraft.tourismFields?.budget ?? '',
    },
  });

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setUploadedFile({
          name: asset.name,
          uri: asset.uri,
          mimeType: asset.mimeType ?? 'application/octet-stream',
        });
      }
    } catch {
      Alert.alert('Error', 'Failed to pick document.');
    }
  };

  const uploadDocument = async () => {
    if (!uploadedFile) return;
    setUploading(true);
    try {
      const url = await uploadMedicalDocument(
        uploadedFile.uri,
        uploadedFile.name,
        uploadedFile.mimeType,
      );
      setUploadedFile((prev) => (prev ? { ...prev, url } : null));
      Alert.alert('Uploaded', 'Document uploaded successfully.');
    } catch (e: any) {
      Alert.alert('Upload Failed', e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleMedicalSubmit = (vals: MedicalForm) => {
    updateDraft({
      medicalFields: {
        ...vals,
        medical_document_url: uploadedFile?.url,
      },
    });
    router.push('/(intake)/step3');
  };

  const handleTourismSubmit = (vals: TourismForm) => {
    updateDraft({
      tourismFields: {
        travelers_count: Number(vals.travelers_count),
        interests: vals.interests.split(',').map((s) => s.trim()),
        travel_dates_from: vals.travel_dates_from,
        travel_dates_to: vals.travel_dates_to,
        budget: vals.budget,
      },
    });
    router.push('/(intake)/step3');
  };

  // ─── Shared field components ────────────────────────────────────────────────

  function Field({
    label,
    error,
    children,
  }: {
    label: string;
    error?: string;
    children: React.ReactNode;
  }) {
    return (
      <View style={FIELD_CONTAINER}>
        <Text style={LABEL_STYLE}>{label}</Text>
        {children}
        {error && <Text style={ERROR_TEXT}>{error}</Text>}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF8' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#0D3B5C', paddingTop: 56, paddingBottom: 0 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ paddingHorizontal: 20, paddingBottom: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        <View style={{ paddingHorizontal: 24, paddingBottom: 28 }}>
          <Text style={{ color: '#ECC94B', fontSize: 12, fontWeight: '700', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>
            Tell Us More
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '800', lineHeight: 32 }}>
            {isMedical ? 'Medical Details' : 'Trip Details'}
          </Text>
        </View>
        <StepIndicator currentStep={2} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {isMedical ? (
            /* ──── MEDICAL FIELDS ──── */
            <>
              <Field
                label="Describe Your Condition"
                error={medForm.formState.errors.condition_summary?.message}
              >
                <Controller
                  control={medForm.control}
                  name="condition_summary"
                  render={({ field, fieldState }) => (
                    <TextInput
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder="e.g. Knee replacement surgery, seeking second opinion..."
                      placeholderTextColor="#94A3B8"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      style={[
                        INPUT_BASE,
                        { minHeight: 100 },
                        fieldState.error && INPUT_ERROR,
                      ]}
                    />
                  )}
                />
              </Field>

              <Field
                label="Your Country"
                error={medForm.formState.errors.country?.message}
              >
                <Controller
                  control={medForm.control}
                  name="country"
                  render={({ field, fieldState }) => (
                    <TextInput
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder="e.g. UAE, UK, Saudi Arabia..."
                      placeholderTextColor="#94A3B8"
                      style={[INPUT_BASE, fieldState.error && INPUT_ERROR]}
                    />
                  )}
                />
              </Field>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Travel From"
                    error={medForm.formState.errors.travel_dates_from?.message}
                  >
                    <Controller
                      control={medForm.control}
                      name="travel_dates_from"
                      render={({ field, fieldState }) => (
                        <TextInput
                          value={field.value}
                          onChangeText={field.onChange}
                          placeholder="DD/MM/YYYY"
                          placeholderTextColor="#94A3B8"
                          style={[INPUT_BASE, fieldState.error && INPUT_ERROR]}
                        />
                      )}
                    />
                  </Field>
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Travel To"
                    error={medForm.formState.errors.travel_dates_to?.message}
                  >
                    <Controller
                      control={medForm.control}
                      name="travel_dates_to"
                      render={({ field, fieldState }) => (
                        <TextInput
                          value={field.value}
                          onChangeText={field.onChange}
                          placeholder="DD/MM/YYYY"
                          placeholderTextColor="#94A3B8"
                          style={[INPUT_BASE, fieldState.error && INPUT_ERROR]}
                        />
                      )}
                    />
                  </Field>
                </View>
              </View>

              {/* Budget selector */}
              <Field
                label="Budget Range"
                error={medForm.formState.errors.budget_range?.message}
              >
                <Controller
                  control={medForm.control}
                  name="budget_range"
                  render={({ field }) => (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {BUDGET_OPTIONS.map((opt) => (
                        <TouchableOpacity
                          key={opt}
                          onPress={() => field.onChange(opt)}
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 14,
                            borderRadius: 99,
                            backgroundColor: field.value === opt ? '#0D3B5C' : '#FFFFFF',
                            borderWidth: 1.5,
                            borderColor: field.value === opt ? '#0D3B5C' : '#E2E8F0',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: '600',
                              color: field.value === opt ? '#FFFFFF' : '#64748B',
                            }}
                          >
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                />
              </Field>

              {/* Document upload */}
              <View style={FIELD_CONTAINER}>
                <Text style={LABEL_STYLE}>Medical Documents (Optional)</Text>
                <TouchableOpacity
                  onPress={pickDocument}
                  style={{
                    borderWidth: 1.5,
                    borderColor: '#CBD5E1',
                    borderStyle: 'dashed',
                    borderRadius: 12,
                    padding: 20,
                    alignItems: 'center',
                    backgroundColor: '#F8FAFC',
                  }}
                >
                  <Ionicons name="document-attach-outline" size={28} color="#2ba89a" />
                  <Text style={{ color: '#334155', fontWeight: '600', marginTop: 8, fontSize: 14 }}>
                    {uploadedFile ? uploadedFile.name : 'Tap to upload PDF or image'}
                  </Text>
                  <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>
                    Medical reports, prescriptions, etc.
                  </Text>
                </TouchableOpacity>
                {uploadedFile && !uploadedFile.url && (
                  <TouchableOpacity
                    onPress={uploadDocument}
                    disabled={uploading}
                    style={{
                      marginTop: 10,
                      backgroundColor: '#2ba89a',
                      borderRadius: 10,
                      paddingVertical: 10,
                      alignItems: 'center',
                    }}
                  >
                    {uploading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                        Upload Now
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
                {uploadedFile?.url && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
                    <Ionicons name="checkmark-circle" size={16} color="#2ba89a" />
                    <Text style={{ color: '#2ba89a', fontSize: 13, fontWeight: '600' }}>
                      Document uploaded
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={medForm.handleSubmit(handleMedicalSubmit)}
                style={{
                  backgroundColor: '#0D3B5C',
                  borderRadius: 14,
                  paddingVertical: 16,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 8,
                  shadowColor: '#0D3B5C',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          ) : (
            /* ──── TOURISM/NRI/HYBRID FIELDS ──── */
            <>
              <Field
                label="Number of Travellers"
                error={tourForm.formState.errors.travelers_count?.message}
              >
                <Controller
                  control={tourForm.control}
                  name="travelers_count"
                  render={({ field, fieldState }) => (
                    <TextInput
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder="e.g. 2"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      style={[INPUT_BASE, fieldState.error && INPUT_ERROR]}
                    />
                  )}
                />
              </Field>

              <Field
                label="Interests"
                error={tourForm.formState.errors.interests?.message}
              >
                <Controller
                  control={tourForm.control}
                  name="interests"
                  render={({ field, fieldState }) => (
                    <TextInput
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder="e.g. Backwaters, Ayurveda, Wildlife, Culture..."
                      placeholderTextColor="#94A3B8"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      style={[INPUT_BASE, { minHeight: 80 }, fieldState.error && INPUT_ERROR]}
                    />
                  )}
                />
              </Field>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Travel From"
                    error={tourForm.formState.errors.travel_dates_from?.message}
                  >
                    <Controller
                      control={tourForm.control}
                      name="travel_dates_from"
                      render={({ field, fieldState }) => (
                        <TextInput
                          value={field.value}
                          onChangeText={field.onChange}
                          placeholder="DD/MM/YYYY"
                          placeholderTextColor="#94A3B8"
                          style={[INPUT_BASE, fieldState.error && INPUT_ERROR]}
                        />
                      )}
                    />
                  </Field>
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Travel To"
                    error={tourForm.formState.errors.travel_dates_to?.message}
                  >
                    <Controller
                      control={tourForm.control}
                      name="travel_dates_to"
                      render={({ field, fieldState }) => (
                        <TextInput
                          value={field.value}
                          onChangeText={field.onChange}
                          placeholder="DD/MM/YYYY"
                          placeholderTextColor="#94A3B8"
                          style={[INPUT_BASE, fieldState.error && INPUT_ERROR]}
                        />
                      )}
                    />
                  </Field>
                </View>
              </View>

              <Field
                label="Total Budget"
                error={tourForm.formState.errors.budget?.message}
              >
                <Controller
                  control={tourForm.control}
                  name="budget"
                  render={({ field, fieldState }) => (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {BUDGET_OPTIONS.map((opt) => (
                        <TouchableOpacity
                          key={opt}
                          onPress={() => field.onChange(opt)}
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 14,
                            borderRadius: 99,
                            backgroundColor: field.value === opt ? '#2ba89a' : '#FFFFFF',
                            borderWidth: 1.5,
                            borderColor: field.value === opt ? '#2ba89a' : '#E2E8F0',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: '600',
                              color: field.value === opt ? '#FFFFFF' : '#64748B',
                            }}
                          >
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                />
              </Field>

              <TouchableOpacity
                onPress={tourForm.handleSubmit(handleTourismSubmit)}
                style={{
                  backgroundColor: '#2ba89a',
                  borderRadius: 14,
                  paddingVertical: 16,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 8,
                  shadowColor: '#2ba89a',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
