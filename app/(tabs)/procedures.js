import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, FlatList, TextInput, Alert } from 'react-native';
import { procedures } from '../../screens/proceduresData';
import { db } from '../../firebaseConfig';
import { getDoc, setDoc, doc } from 'firebase/firestore';

// Storage abstraction
let storage = null;
if (typeof window !== 'undefined') {
  storage = {
    getItem: key => Promise.resolve(window.localStorage.getItem(key)),
    setItem: (key, value) => Promise.resolve(window.localStorage.setItem(key, value)),
  };
} else {
  try {
    storage = require('@react-native-async-storage/async-storage');
  } catch (e) {
    storage = {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
    };
  }
}

export default function ProceduresScreen() {
  const [checked, setChecked] = useState({});
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(true);

  // Load progress and feedback from Firestore, fallback to storage
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const docRef = doc(db, 'users', 'defaultUser');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.proceduresProgress) setChecked(data.proceduresProgress);
          if (data.proceduresFeedback) setFeedback(data.proceduresFeedback);
        } else {
          // fallback to local storage
          if (storage) {
            storage.getItem('proceduresProgress').then(data => {
              if (data) setChecked(JSON.parse(data));
            });
            storage.getItem('proceduresFeedback').then(data => {
              if (data) setFeedback(JSON.parse(data));
            });
          }
        }
      } catch (e) {
        // fallback to local storage
        if (storage) {
          storage.getItem('proceduresProgress').then(data => {
            if (data) setChecked(JSON.parse(data));
          });
          storage.getItem('proceduresFeedback').then(data => {
            if (data) setFeedback(JSON.parse(data));
          });
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Save progress and feedback to storage and Firestore
  useEffect(() => {
    if (storage) {
      storage.setItem('proceduresProgress', JSON.stringify(checked));
      storage.setItem('proceduresFeedback', JSON.stringify(feedback));
    }
    // Save to Firestore
    async function saveToCloud() {
      try {
        const docRef = doc(db, 'users', 'defaultUser');
        await setDoc(docRef, {
          proceduresProgress: checked,
          proceduresFeedback: feedback
        }, { merge: true });
      } catch (e) {
        // Optionally show error
      }
    }
    if (!loading) saveToCloud();
  }, [checked, feedback]);

  const handleToggle = (category, item) => {
    setChecked(prev => ({ ...prev, [category + item]: !prev[category + item] }));
  };

  const handleFeedback = (category, item, text) => {
    setFeedback(prev => ({ ...prev, [category + item]: text }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Procedures Checklist</Text>
      <FlatList
        data={procedures}
        keyExtractor={cat => cat.category}
        renderItem={({ item: cat }) => (
          <View style={styles.categoryBox}>
            <Text style={styles.categoryTitle}>{cat.category}</Text>
            {cat.items.map(proc => (
              <View key={proc} style={styles.procRow}>
                <Text style={styles.procText}>{proc}</Text>
                <Switch
                  value={!!checked[cat.category + proc]}
                  onValueChange={() => handleToggle(cat.category, proc)}
                />
                <TextInput
                  style={styles.feedbackInput}
                  placeholder="Add feedback..."
                  value={feedback[cat.category + proc] || ''}
                  onChangeText={text => handleFeedback(cat.category, proc, text)}
                  multiline
                  accessibilityLabel={`Feedback for ${proc}`}
                  accessibilityRole="textbox"
                />
              </View>
            ))}
          </View>
        )}
      />
      <Text style={styles.instructions}>Toggle each procedure as you understand and can perform it.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  categoryBox: { marginBottom: 20, padding: 12, backgroundColor: '#f9f9f9', borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
  categoryTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  procRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  procText: { fontSize: 16, flex: 1, marginRight: 8 },
  instructions: { marginTop: 16, color: '#555' },
  feedbackInput: { borderWidth: 1, borderColor: '#388e3c', borderRadius: 8, padding: 8, minHeight: 36, backgroundColor: '#e8f5e9', fontSize: 15, flex: 1, marginLeft: 8 },
});