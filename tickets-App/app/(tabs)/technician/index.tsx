import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { Ticket } from '../../../src/types/ticket';
import { useTickets } from '../../../src/contexts/TicketContext';
import { MOCK_TECHNICIAN } from '../../../src/mocks/technician';
import { TicketCard } from '../../../src/components/technician/TicketCard';

type FilterTab = 'Todos' | 'Pendiente' | 'En Proceso' | 'Resuelto';

const FILTER_TABS: { key: FilterTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'Todos', label: 'Todos', icon: 'list-outline' },
  { key: 'Pendiente', label: 'Pendientes', icon: 'time-outline' },
  { key: 'En Proceso', label: 'En Proceso', icon: 'construct-outline' },
  { key: 'Resuelto', label: 'Resueltos', icon: 'checkmark-circle-outline' },
];

function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={skeletonStyles.card}>
      <Animated.View style={[skeletonStyles.line, { width: '40%', opacity }]} />
      <Animated.View style={[skeletonStyles.line, { width: '80%', marginTop: 12, opacity }]} />
      <Animated.View style={[skeletonStyles.line, { width: '60%', marginTop: 8, opacity }]} />
      <View style={{ flexDirection: 'row', marginTop: 14, gap: 12 }}>
        <Animated.View style={[skeletonStyles.line, { width: 80, height: 22, opacity }]} />
        <Animated.View style={[skeletonStyles.line, { width: 60, height: 22, opacity }]} />
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: Colors.border + '60',
  },
  line: {
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.shimmer,
  },
});

export default function TechnicianInboxScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('Todos');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { tickets: allTickets } = useTickets();

  const tickets = useMemo(
    () => allTickets.filter((t) => t.technician_names.includes('Carlos Técnico')),
    [allTickets]
  );

  const filteredTickets = useMemo(() => {
    let result = tickets;
    if (activeFilter !== 'Todos') {
      result = result.filter((t) => t.status === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.ticket_code.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.office_name.toLowerCase().includes(q) ||
          t.service_name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tickets, activeFilter, searchQuery]);

  const counts = useMemo(() => {
    const c: Record<FilterTab, number> = {
      Todos: tickets.length,
      Pendiente: 0,
      'En Proceso': 0,
      Resuelto: 0,
    };
    tickets.forEach((t: Ticket) => {
      if (t.status in c) c[t.status as FilterTab]++;
    });
    return c;
  }, [tickets]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setRefreshing(false);
  }, []);

  const handleTicketPress = useCallback((ticket: Ticket) => {
    router.push(`/(tabs)/technician/${ticket.id}`);
  }, []);

  const handleProfile = () => {
    router.push('/(tabs)/technician/profile');
  };

  const renderTicket = useCallback(
    ({ item, index }: { item: Ticket; index: number }) => (
      <TicketCard ticket={item} onPress={handleTicketPress} index={index} />
    ),
    [handleTicketPress]
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar} />
              <View>
                <View style={{ width: 60, height: 10, backgroundColor: Colors.shimmer, borderRadius: 5, opacity: 0.5 }} />
                <View style={{ width: 100, height: 16, backgroundColor: Colors.shimmer, borderRadius: 5, marginTop: 4, opacity: 0.5 }} />
              </View>
            </View>
          </View>
        </View>
        <View style={{ padding: 16, gap: 10 }}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={22} color={Colors.coral} />
            </View>
            <View>
              <Text style={styles.greeting}>Bienvenido</Text>
              <Text style={styles.userName}>{MOCK_TECHNICIAN.first_name}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: Colors.statusResuelto }]} />
              <Text style={styles.statusText}>{MOCK_TECHNICIAN.technician_status}</Text>
            </View>
            <TouchableOpacity onPress={handleProfile} style={styles.settingsBtn}>
              <Ionicons name="settings-outline" size={20} color={Colors.textOnPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => setActiveFilter(tab.key)}
            >
              <Ionicons
                name={tab.icon}
                size={13}
                color={isActive ? Colors.textOnPrimary : Colors.textSecondary}
              />
              <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                {tab.label}
              </Text>
              <View style={[styles.filterCount, isActive && styles.filterCountActive]}>
                <Text style={[styles.filterCountText, isActive && styles.filterCountTextActive]}>
                  {counts[tab.key]}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchInput}>
          <Ionicons name="search-outline" size={18} color={Colors.textLight} />
          <TextInput
            style={styles.searchField}
            placeholder="Buscar por código, oficina, servicio..."
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredTickets}
        renderItem={renderTicket}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary, Colors.coral]}
            progressBackgroundColor={Colors.surface}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name={searchQuery ? 'search-outline' : 'document-text-outline'}
                size={36}
                color={Colors.textLight}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'Sin resultados' : 'No hay tickets'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? `No se encontraron tickets para "${searchQuery}"`
                : `No tienes tickets ${activeFilter === 'Todos' ? '' : activeFilter.toLowerCase()} en este momento`}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.coral,
  },
  greeting: {
    fontSize: 12,
    color: Colors.goldLight,
    opacity: 0.85,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textOnPrimary,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryLight + '99',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textOnPrimary,
    opacity: 0.9,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight + '99',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    gap: 5,
    borderWidth: 1,
    borderColor: Colors.border + '60',
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  filterLabelActive: {
    color: Colors.textOnPrimary,
  },
  filterCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    backgroundColor: Colors.background,
  },
  filterCountActive: {
    backgroundColor: Colors.coral,
  },
  filterCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterCountTextActive: {
    color: Colors.textOnPrimary,
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border + '80',
  },
  searchField: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    height: '100%',
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
