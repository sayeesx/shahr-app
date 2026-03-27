import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AF } from '../../lib/authTheme';



import { PackageCard, PackageCardData } from '../../components/ui/PackageCard';

const FILTERS = ['All', 'Duration', 'Budget', 'Type', 'Rating'];

const ALL_PACKAGES: PackageCardData[] = [
  { id: '1', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400', title: 'Alleppey Houseboat Escape', price: '₹12,500', duration: '3 Days', rating: 5 },
  { id: '2', image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=400', title: 'Munnar Tea Garden Trek', price: '₹8,900', duration: '2 Days', rating: 4 },
  { id: '3', image: 'https://images.unsplash.com/photo-1571721795195-a2ca2d3370a9?w=400', title: 'Thekkady Spice Trail', price: '₹7,200', duration: '2 Days', rating: 4 },
  { id: '4', image: 'https://images.unsplash.com/photo-1622308644420-b20142dc993c?w=400', title: 'Kovalam Beach Retreat', price: '₹15,000', duration: '4 Days', rating: 5 },
  { id: '5', image: 'https://images.unsplash.com/photo-1490682143684-14369e18dce8?w=400', title: 'Wayanad Nature Camp', price: '₹9,500', duration: '3 Days', rating: 4.5 },
];

export default function PackagesScreen() {
  const [activeFilter, setActiveFilter] = useState(0);

  const renderItem = useCallback(({ item }: { item: PackageCardData }) => (
    <PackageCard
      {...item}
      variant="vertical"
      onPress={() => {}}
    />
  ), []);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={[s.title, { fontFamily: AF.bold }]}>Tour Packages</Text>
        <TouchableOpacity style={s.searchBtn}>

          <Ionicons name="search" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* ── Filters ── */}
      <View style={s.filtersWrap}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filters}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[s.filterChip, activeFilter === index && s.filterChipActive]}
              onPress={() => setActiveFilter(index)}
              activeOpacity={0.8}
            >
              <Text style={[s.filterText, activeFilter === index && s.filterTextActive, { fontFamily: AF.semibold }]}>{item}</Text>
              {index > 0 && <Ionicons name="chevron-down" size={14} color={'#dabf7e'} style={{ marginLeft: 4 }} />}
            </TouchableOpacity>
          )}

          keyExtractor={(i) => i}
        />
      </View>

      {/* ── List ── */}
      <FlatList
        data={ALL_PACKAGES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ede6df' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    color: '#000000',
    letterSpacing: -0.5,
  },

  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fbf6f4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filtersWrap: {
    marginBottom: 16,
  },
  filters: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: '#fbf6f4',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2d7c2',
  },
  filterChipActive: {
    backgroundColor: '#305c5d',
    borderColor: '#305c5d',
  },
  filterText: {
    fontSize: 13,
    color: '#dabf7e',
  },

  filterTextActive: {
    color: '#dabf7e',
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
});
