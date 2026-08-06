// Adaptateur Expo SecureStore utilisé par Supabase Auth pour persister la session mobile.
import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};
