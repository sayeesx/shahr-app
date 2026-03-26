import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Our beautiful auth theme and components
import { AC, AF, AR, AS } from '../../lib/authTheme';
import { AuthField } from '../../components/auth/AuthField';
import { AuthButton } from '../../components/auth/AuthButton';
import { AuthToast } from '../../components/auth/AuthToast';

// Store & Backend
import { useAppStore } from '../../store/useAppStore';
import { signOut, getProfile, updateProfile } from '../../lib/supabase';
import type { UserProfile } from '../../types';

export default function ProfileScreen() {
  const { session, clearSession } = useAppStore();
  const userId = session?.user?.id;
  const initialEmail = session?.user?.email ?? '';

  // Data fetching
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fetching, setFetching] = useState(true);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');

  // Fetch true profile from DB on mount
  useEffect(() => {
    if (!userId) {
      setFetching(false);
      return;
    }
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setFetching(true);
      const data = await getProfile(userId!);
      if (data) {
        setProfile(data);
        populateForm(data);
      } else if (userId) {
        // First time, no profiles row yet. AUTO-INITIALIZE the row silently!
        const metaName = session?.user?.user_metadata?.name || '';
        const metaPhone = session?.user?.user_metadata?.phone || '';

        setFullName(metaName);
        setPhone(metaPhone);

        // Silent creation of the row in the background
        const initialProfile = await updateProfile(userId, {
          full_name: metaName,
          email: initialEmail,
          phone: metaPhone,
        });
        setProfile(initialProfile);
      }
    } catch (e: any) {
      // Missing table or RLS Error
      console.warn('Failed to fetch profile:', e.message);
    } finally {
      setFetching(false);
    }
  };

  const populateForm = (p: UserProfile) => {
    setFullName(p.full_name || '');
    setPhone(p.phone || '');
    setAge(p.age ? String(p.age) : '');
    setGender(p.gender || '');
    setLocation(p.location || '');
  };

  const flash = useCallback((msg: string, type: 'success' | 'error' | 'warning') => {
    setToast({ msg, type });
    if (type !== 'success') setTimeout(() => setToast(null), 3500);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      clearSession();
      router.replace('/(auth)' as any);
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    if (!fullName.trim()) {
      flash('Full name is required', 'warning');
      return;
    }

    setSaving(true);
    try {
      const updates: Partial<UserProfile> = {
        full_name: fullName,
        email: initialEmail,
        phone: phone,
        age: age ? parseInt(age) : undefined,
        gender: gender,
        location: location,
      };

      const updated = await updateProfile(userId, updates);
      setProfile(updated);
      setIsEditing(false);

      flash('Profile updated successfully!', 'success');
      setTimeout(() => setToast(null), 2500);
    } catch (e: any) {
      flash(e.message || 'Failed to update profile. (Check Supabase Tables)', 'error');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    if (profile) populateForm(profile);
    setIsEditing(false);
  };

  // Render components

  if (fetching) {
    return (
      <View style={[s.safe, s.center]}>
        <ActivityIndicator color={AC.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={AC.bg} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.kav}
      >
        {/* TOP HEADER */}
        <View style={s.header}>
          <Text style={[s.title, { fontFamily: AF.bold }]}>
            {isEditing ? 'Edit Profile' : 'My Profile'}
          </Text>
          {!isEditing && (
            <TouchableOpacity style={s.editBtn} onPress={() => setIsEditing(true)}>
              <Ionicons name="pencil" size={18} color={AC.text} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Toast */}
          {toast && (
            <View style={s.toastWrap}>
              <AuthToast message={toast.msg} type={toast.type} visible={!!toast} />
            </View>
          )}

          {/* AVATAR + TOP CARD (Only show gracefully when not editing) */}
          {!isEditing && (
            <View style={s.topCard}>
              <View style={s.avatarWrap}>
                <View style={s.avatar}>
                  <Text style={[s.avatarInitial, { fontFamily: AF.bold }]}>
                    {profile?.full_name?.charAt(0)?.toUpperCase() || fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
              </View>
              <Text style={[s.profileName, { fontFamily: AF.bold }]} numberOfLines={1}>
                {profile?.full_name || fullName || 'New User'}
              </Text>
              <Text style={[s.profileEmail, { fontFamily: AF.regular }]}>
                {initialEmail || 'No Email'}
              </Text>
            </View>
          )}

          {/* EDIT FORM */}
          {isEditing ? (
            <View style={s.formWrap}>
              <AuthField
                label="Full Name"
                iconName="person-outline"
                value={fullName}
                onChangeText={setFullName}
              />

              <AuthField
                label="Email (Read Only)"
                iconName="mail-outline"
                value={initialEmail}
                onChangeText={() => { }}
                editable={false}
              />

              <AuthField
                label="Phone Number"
                iconName="call-outline"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <AuthField
                label="Age"
                iconName="calendar-outline"
                value={age}
                onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={3}
              />

              <AuthField
                label="Gender (Male/Female/Other)"
                iconName="male-female-outline"
                value={gender}
                onChangeText={setGender}
              />

              <AuthField
                label="Location (City, Country)"
                iconName="location-outline"
                value={location}
                onChangeText={setLocation}
              />

              <View style={s.actions}>
                <AuthButton label="Save Changes" onPress={handleSave} loading={saving} />
                <TouchableOpacity style={s.cancelLink} onPress={cancelEdit} disabled={saving}>
                  <Text style={[s.cancelTxt, { fontFamily: AF.semibold }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* VIEW MODE DETAILS */
            <View style={s.detailsWrap}>
              <View style={s.detailCard}>
                <InfoRow icon="call-outline" label="Phone" value={profile?.phone || phone || 'Not set'} />
                <View style={s.line} />
                <InfoRow icon="calendar-outline" label="Age" value={profile?.age ? `${profile.age} years` : 'Not set'} />
                <View style={s.line} />
                <InfoRow icon="male-female-outline" label="Gender" value={profile?.gender || 'Not set'} />
                <View style={s.line} />
                <InfoRow icon="location-outline" label="Location" value={profile?.location || 'Not set'} />
              </View>

              {/* Logout */}
              <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
                <Ionicons name="log-out-outline" size={20} color={AC.error} />
                <Text style={[s.logoutTxt, { fontFamily: AF.semibold }]}>Log Out</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Helper ──────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <View style={s.infoIconWrap}>
        <Ionicons name={icon} size={18} color={AC.textSub} />
      </View>
      <View style={s.infoTextWrap}>
        <Text style={[s.infoLabel, { fontFamily: AF.regular }]}>{label}</Text>
        <Text style={[s.infoValue, { fontFamily: AF.semibold }]}>{value}</Text>
      </View>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AC.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: AS.pad, paddingBottom: 64 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: AS.pad,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    color: AC.text,
    letterSpacing: 0.2,
  },
  editBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AC.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AC.borderSubtle,
  },

  toastWrap: { marginBottom: 20 },

  /* View Mode Top Card */
  topCard: {
    alignItems: 'center',
    backgroundColor: AC.bg,
    borderRadius: AR.card,
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 24,
    // Soft shadow
    shadowColor: AC.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  avatarWrap: {
    padding: 6,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: AC.borderFaint,
    marginBottom: 16,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: AC.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 32,
    color: '#0A0A0A',
  },
  profileName: {
    fontSize: 24,
    color: AC.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: AC.textSub,
  },

  /* Form */
  formWrap: { marginVertical: 8, gap: AS.gap },
  actions: { marginTop: 20, gap: 16, paddingBottom: 20 },
  cancelLink: { alignItems: 'center', padding: 12 },
  cancelTxt: { fontSize: 15, color: AC.textSub },

  /* Details Card */
  detailsWrap: { gap: 32 },
  detailCard: {
    backgroundColor: AC.surface,
    borderRadius: AR.card,
    padding: 24,
    borderWidth: 1.5,
    borderColor: AC.borderSubtle,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: AC.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: AC.borderSubtle,
  },
  infoTextWrap: { flex: 1 },
  infoLabel: { fontSize: 13, color: AC.textSub, marginBottom: 2 },
  infoValue: { fontSize: 15, color: AC.text },

  line: {
    height: 1,
    backgroundColor: AC.borderSubtle,
    marginVertical: 18,
    marginHorizontal: 4,
  },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: AR.button,
    backgroundColor: '#FFF0F0',
    borderWidth: 1.5,
    borderColor: '#FFD6D6',
  },
  logoutTxt: {
    fontSize: 15,
    color: AC.error,
  },
});
