import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AF } from '../../lib/authTheme';



const CHIPS = ['All', 'Beach', 'Hill', 'Ayurveda', 'Luxury', 'Budget'];

const DESTINATIONS = [
  { id: '1', name: 'Munnar', region: 'Idukki District', image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=400' },
  { id: '2', name: 'Alleppey', region: 'Alappuzha', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400' },
  { id: '3', name: 'Wayanad', region: 'Wayanad District', image: 'https://images.unsplash.com/photo-1490682143684-14369e18dce8?w=400' },
  { id: '4', name: 'Kovalam', region: 'Thiruvananthapuram', image: 'https://images.unsplash.com/photo-1622308644420-b20142dc993c?w=400' },
  { id: '5', name: 'Thekkady', region: 'Idukki District', image: 'https://images.unsplash.com/photo-1571721795195-a2ca2d3370a9?w=400' },
  { id: '6', name: 'Varkala', region: 'Thiruvananthapuram', image: 'https://images.unsplash.com/photo-1621272036047-bf0ebfd69ce4?w=400' },
];

export default function ExploreScreen() {
  const [activeChip, setActiveChip] = useState(0);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* ── Search Bar ── */}
      <View style={s.header}>
        <View style={s.searchBar}>
          <Ionicons name="search" size={20} color="#dabf7e" />
          <TextInput
            placeholder="Search destinations..."
            placeholderTextColor="#dabf7e"
            style={[s.searchInput, { fontFamily: AF.medium }]}
          />
        </View>

      </View>

      {/* ── Filter Chips ── */}
      <View style={s.chipsWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CHIPS}
          contentContainerStyle={s.chips}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[s.chip, activeChip === index && s.chipActive]}
              onPress={() => setActiveChip(index)}
              activeOpacity={0.8}
            >
              <Text style={[s.chipLabel, activeChip === index && s.chipLabelActive, { fontFamily: AF.semibold }]}>{item}</Text>
            </TouchableOpacity>
          )}

          keyExtractor={(i) => i}
        />
      </View>

      <Text style={[s.sectionTitle, { fontFamily: AF.bold }]}>Kerala Destinations</Text>


      {/* ── Destinations Grid ── */}
      <FlatList
        data={DESTINATIONS}
        numColumns={2}
        contentContainerStyle={s.grid}
        columnWrapperStyle={s.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} activeOpacity={0.9}>
            <Image source={{ uri: item.image }} style={s.cardImage} resizeMode="cover" />
            <TouchableOpacity style={s.bookmarkBtn} activeOpacity={0.8}>
              <Ionicons name="bookmark-outline" size={16} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={s.cardInfo}>
              <Text style={[s.cardName, { fontFamily: AF.bold }]} numberOfLines={1}>{item.name}</Text>
              <Text style={[s.cardRegion, { fontFamily: AF.regular }]} numberOfLines={1}>{item.region}</Text>
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
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbf6f4',
    height: 50,
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
  },


  chipsWrap: {
    marginBottom: 24,
  },
  chips: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: '#fbf6f4',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#305c5d',
  },
  chipLabel: {
    fontSize: 13,
    color: '#dabf7e',
  },

  chipLabelActive: {
    color: '#dabf7e',
  },

  sectionTitle: {
    fontSize: 20,
    color: '#000000',
    paddingHorizontal: 20,
    marginBottom: 16,
    letterSpacing: -0.3,
  },


  grid: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  row: {
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#fbf6f4',
    borderRadius: 18,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  bookmarkBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    padding: 12,
  },
  cardName: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 2,
  },

  cardRegion: {
    fontSize: 11,
    color: '#dabf7e',
  },
});
