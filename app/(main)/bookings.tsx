import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AF } from '../../lib/authTheme';



const TABS = ['Tours', 'Medical', 'Concierge'];

const MOCK_BOOKINGS = [
  { id: 'B-1029', title: 'Alleppey Houseboat', date: 'Oct 12, 2026', status: 'Confirmed', type: 'Tours' },
  { id: 'M-3041', title: 'Doctor Consultation', date: 'Oct 15, 2026', status: 'Pending', type: 'Medical' },
  { id: 'B-0982', title: 'Munnar Trekking', date: 'Sep 05, 2026', status: 'Completed', type: 'Tours' },
];

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState('Tours');

  const filtered = MOCK_BOOKINGS.filter(b => b.type === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return '#305c5d';
      case 'Pending': return '#FFC107';
      case 'Completed': return '#dabf7e';
      default: return '#000000';
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={[s.title, { fontFamily: AF.bold }]}>My Bookings</Text>
      </View>


      {/* ── Segmented Tabs ── */}
      <View style={s.tabWrap}>
        <View style={s.tabBg}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[s.tabBtn, isActive && s.tabBtnActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[s.tabText, isActive && s.tabTextActive, { fontFamily: AF.semibold }]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}

        </View>
      </View>

      {/* ── List ── */}
      <FlatList
        data={filtered}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="receipt-outline" size={48} color="#e2d7c2" />
            <Text style={[s.emptyText, { fontFamily: AF.medium }]}>No bookings found in {activeTab}</Text>
          </View>
        }

        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} activeOpacity={0.9}>
            <View style={s.cardHeader}>
              <Text style={[s.cardId, { fontFamily: AF.semibold }]}>{item.id}</Text>
              <View style={[s.badge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                <Text style={[s.badgeText, { color: getStatusColor(item.status), fontFamily: AF.bold }]}>{item.status}</Text>
              </View>
            </View>
            
            <Text style={[s.cardTitle, { fontFamily: AF.bold }]}>{item.title}</Text>
            
            <View style={s.cardFooter}>
              <View style={s.cardDateWrap}>
                <Ionicons name="calendar-outline" size={14} color="#dabf7e" />
                <Text style={[s.cardDate, { fontFamily: AF.medium }]}>{item.date}</Text>
              </View>
              <Text style={[s.viewDetails, { fontFamily: AF.semibold }]}>View Details</Text>
            </View>
          </TouchableOpacity>

        )}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ede6df' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    color: '#000000',
    letterSpacing: -0.5,
  },


  tabWrap: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabBg: {
    flexDirection: 'row',
    backgroundColor: '#fbf6f4',
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#fbf6f4',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  tabText: {
    fontSize: 13,
    color: '#dabf7e',
  },

  tabTextActive: {
    color: '#000000',
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  empty: {
    paddingVertical: 64,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: '#dabf7e',
  },


  card: {
    backgroundColor: '#fbf6f4',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2d7c2',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardId: {
    fontSize: 12,
    color: '#dabf7e',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
  },
  cardTitle: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 16,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ede6df',
    paddingTop: 12,
  },
  cardDateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardDate: {
    fontSize: 13,
    color: '#dabf7e',
  },
  viewDetails: {
    fontSize: 13,
    color: '#305c5d',
  },

});
