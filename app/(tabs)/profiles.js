import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList } from 'react-native';

export default function UserProfilesScreen() {
  const [profiles, setProfiles] = useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem('userProfiles') : null;
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [name, setName] = useState('');
  const [license, setLicense] = useState('');

  const addProfile = () => {
    if (!name.trim()) return;
    const updated = [...profiles, { name, license }];
    setProfiles(updated);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('userProfiles', JSON.stringify(updated));
    }
    setName('');
    setLicense('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Profiles</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="License"
        value={license}
        onChangeText={setLicense}
      />
      <Button title="Add Profile" onPress={addProfile} />
      <FlatList
        data={profiles}
        keyExtractor={item => item.name + item.license}
        renderItem={({ item }) => (
          <View style={styles.profileRow}>
            <Text style={styles.profileName}>{item.name}</Text>
            <Text style={styles.profileLicense}>License: {item.license}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 8 },
  profileRow: { marginBottom: 12, padding: 8, backgroundColor: '#f9f9f9', borderRadius: 8 },
  profileName: { fontSize: 16, fontWeight: 'bold' },
  profileLicense: { fontSize: 15, color: '#555' },
});
