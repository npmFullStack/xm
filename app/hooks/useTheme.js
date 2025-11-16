import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  
  // Default theme in case colorScheme is undefined
  const isDark = colorScheme === 'dark';
  
  const theme = {
    isDark,
    colors: {
      background: isDark ? '#0f172a' : '#f8fafc',
      surface: isDark ? '#1e293b' : '#ffffff',
      border: isDark ? '#334155' : '#e2e8f0',
      content: isDark ? '#e2e8f0' : '#334155',
      heading: isDark ? '#2563eb' : '#2563eb',
      muted: isDark ? '#94a3b8' : '#64748b',
      primary: '#2563eb',
    }
  };

  return theme;
};