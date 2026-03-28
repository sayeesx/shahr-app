// components/auth/CountryPicker.tsx
import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    TextInput,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AC, AF } from '../../lib/authTheme';

const { height: SCREEN_H } = Dimensions.get('window');

export interface Country {
    code: string;
    name: string;
    dial: string;
    flag: string;
}

export const COUNTRIES: Country[] = [
    { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
    { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
    { code: 'AE', name: 'UAE', dial: '+971', flag: '🇦🇪' },
    { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦' },
    { code: 'QA', name: 'Qatar', dial: '+974', flag: '🇶🇦' },
    { code: 'KW', name: 'Kuwait', dial: '+965', flag: '🇰🇼' },
    { code: 'BH', name: 'Bahrain', dial: '+973', flag: '🇧🇭' },
    { code: 'OM', name: 'Oman', dial: '+968', flag: '🇴🇲' },
    { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
    { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
    { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
    { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
    { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬' },
    { code: 'MY', name: 'Malaysia', dial: '+60', flag: '🇲🇾' },
];

interface CountryPickerProps {
    selected: Country;
    onSelect: (c: Country) => void;
}

export function CountryPicker({ selected, onSelect }: CountryPickerProps) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState('');

    const filtered = useMemo(
        () => COUNTRIES.filter(
            (c) =>
                c.name.toLowerCase().includes(q.toLowerCase()) ||
                c.dial.includes(q)
        ),
        [q]
    );

    const handleSelect = (country: Country) => {
        onSelect(country);
        setOpen(false);
        setQ('');
    };

    return (
        <>
            <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)} activeOpacity={0.7}>
                <Text style={styles.flag}>{selected.flag}</Text>
                <Text style={[styles.dial, { fontFamily: AF.regular }]}>{selected.dial}</Text>
                <Ionicons name="chevron-down" size={11} color={AC.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <Modal 
                visible={open} 
                animationType="slide" 
                transparent 
                statusBarTranslucent
                onRequestClose={() => setOpen(false)}
            >
                <SafeAreaView style={styles.overlay}>
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <View style={styles.sheet}>
                            {/* Handle */}
                            <View style={styles.handle} />

                            {/* Header */}
                            <View style={styles.sheetHead}>
                                <Text style={[styles.sheetTitle, { fontFamily: AF.semibold }]}>Select Country</Text>
                                <TouchableOpacity onPress={() => { setOpen(false); setQ(''); }}>
                                    <Ionicons name="close" size={20} color={AC.textSub} />
                                </TouchableOpacity>
                            </View>

                            {/* Search */}
                            <View style={styles.searchWrap}>
                                <Ionicons name="search-outline" size={15} color={AC.textMuted} />
                                <TextInput
                                    style={[styles.searchInput, { fontFamily: AF.regular }]}
                                    placeholder="Search country or code…"
                                    placeholderTextColor={AC.textMuted}
                                    value={q}
                                    onChangeText={setQ}
                                    autoFocus
                                    selectionColor={AC.primary}
                                />
                            </View>

                            {/* List - Fixed height container */}
                            <View style={styles.listContainer}>
                                <FlatList
                                    data={filtered}
                                    keyExtractor={(c) => c.code}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.listContent}
                                    ListEmptyComponent={
                                        <View style={styles.emptyState}>
                                            <Text style={{ color: AC.textMuted, fontFamily: AF.regular }}>
                                                No countries found
                                            </Text>
                                        </View>
                                    }
                                    renderItem={({ item }) => {
                                        const active = item.code === selected.code;
                                        return (
                                            <TouchableOpacity
                                                style={[styles.row, active && styles.rowActive]}
                                                onPress={() => handleSelect(item)}
                                                activeOpacity={0.6}
                                            >
                                                <Text style={styles.flagLg}>{item.flag}</Text>
                                                <Text style={[styles.countryName, { fontFamily: AF.regular }]}>{item.name}</Text>
                                                <Text style={[styles.countryDial, { fontFamily: AF.regular }]}>{item.dial}</Text>
                                                {active && <Ionicons name="checkmark" size={15} color={AC.primary} />}
                                            </TouchableOpacity>
                                        );
                                    }}
                                />
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingRight: 0,
        paddingLeft: 12,
    },
    flag: { fontSize: 18 },
    dial: { fontSize: 13.5, color: AC.textSub },
    divider: {
        width: 1,
        height: 20,
        backgroundColor: AC.borderSubtle,
        marginHorizontal: 12,
    },

    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    keyboardView: {
        width: '100%',
    },
    // FIX: Fixed height instead of maxHeight - prevents shrinking when searching
    sheet: {
        backgroundColor: '#FEFCFE',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        height: SCREEN_H * 0.75, // Fixed at 75% of screen height
        paddingTop: 12,
        borderTopWidth: 1.5,
        borderTopColor: AC.borderFaint,
        borderLeftWidth: 1.5,
        borderLeftColor: AC.borderFaint,
        borderRightWidth: 1.5,
        borderRightColor: AC.borderFaint,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    handle: {
        width: 38,
        height: 4,
        borderRadius: 100,
        backgroundColor: AC.borderSubtle,
        alignSelf: 'center',
        marginBottom: 16,
    },
    sheetHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    sheetTitle: { fontSize: 18, color: AC.text },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 10,
        backgroundColor: AC.surface,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 44,
        borderWidth: 1.5,
        borderColor: AC.borderSubtle,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        color: AC.text,
        fontSize: 14,
    },
    // FIX: Fixed height container for list
    listContainer: {
        flex: 1,
        minHeight: 200, // Ensures minimum height even with few results
    },
    listContent: {
        paddingBottom: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0EEF0',
    },
    rowActive: { backgroundColor: 'rgba(166,217,90,0.08)' },
    flagLg: { fontSize: 22 },
    countryName: { flex: 1, fontSize: 15, color: AC.text },
    countryDial: { fontSize: 13.5, color: AC.textSub, marginRight: 4 },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
});