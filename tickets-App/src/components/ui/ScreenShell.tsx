import React, { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ViewStyle,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';

interface ScreenShellProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  noSafe?: boolean;
}

export function ScreenShell({
  children,
  onRefresh,
  scrollable = true,
  style,
  contentStyle,
  noSafe = false,
}: ScreenShellProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  const inner = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.navyPrimary}
            colors={[Colors.navyPrimary]}
            progressBackgroundColor={Colors.surface}
          />
        ) : undefined
      }
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fixed, contentStyle]}>{children}</View>
  );

  if (noSafe) {
    return <View style={[styles.page, style]}>{inner}</View>;
  }

  return (
    <SafeAreaView style={[styles.page, style]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
      {inner}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
    flexGrow: 1,
  },
  fixed: {
    flex: 1,
  },
});
