import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { studentInfo, checkrideChecklist } from '../../screens/studentModel';

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
import { db } from '../../firebaseConfig';
import { getDoc, doc } from 'firebase/firestore';

export default function HistoryScreen() {
  const [completedLessons, setCompletedLessons] = useState([]);
  const [completedProcedures, setCompletedProcedures] = useState([]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const docRef = doc(db, 'users', 'defaultUser');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.completedLessons) setCompletedLessons(data.completedLessons);
          if (data.proceduresProgress) {
            const progress = data.proceduresProgress;
            const completed = Object.entries(progress)
              .filter(([_, v]) => v)
              .map(([k]) => k);
            setCompletedProcedures(completed);
          }
        } else {
          // fallback to local storage
          if (storage) {
            storage.getItem('completedLessons').then(data => {
              if (data) setCompletedLessons(JSON.parse(data));
            });
            storage.getItem('proceduresProgress').then(data => {
              if (data) {
                const progress = JSON.parse(data);
                const completed = Object.entries(progress)
                  .filter(([_, v]) => v)
                  .map(([k]) => k);
                setCompletedProcedures(completed);
              }
            });
          }
        }
      } catch (e) {
        // fallback to local storage
        if (storage) {
          storage.getItem('completedLessons').then(data => {
            if (data) setCompletedLessons(JSON.parse(data));
          });
          storage.getItem('proceduresProgress').then(data => {
            if (data) {
              const progress = JSON.parse(data);
              const completed = Object.entries(progress)
                .filter(([_, v]) => v)
                .map(([k]) => k);
              setCompletedProcedures(completed);
            }
          });
        }
      }
    }
    loadHistory();
  }, []);

  // Delete lesson and send back to lessons
  const deleteLesson = lessonName => {
    setCompletedLessons(prev => {
      const updated = prev.filter(l => l !== lessonName);
      if (storage) storage.setItem('completedLessons', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>History</Text>
      <Text style={styles.subheader}>Completed Lessons:</Text>
      {completedLessons.length === 0 ? (
        <Text style={styles.subheader}>No lessons completed yet.</Text>
      ) : (
        completedLessons.map(lesson => (
          <View key={lesson} style={styles.completedRow}>
            <Text style={styles.completedItem}>• {lesson}</Text>
            <Button title="Restore" onPress={() => deleteLesson(lesson)} />
          </View>
        ))
      )}
      <Text style={styles.subheader}>Completed Procedures:</Text>
      {completedProcedures.length === 0 ? (
        <Text style={styles.subheader}>No procedures completed yet.</Text>
      ) : (
        completedProcedures.map(proc => (
          <Text key={proc} style={styles.completedItem}>• {proc}</Text>
        ))
      )}
      <Text style={styles.analytics}>Lessons: {completedLessons.length} | Procedures: {completedProcedures.length}</Text>
      {completedLessons.length >= 14 && (
        <View style={styles.checkrideBox}>
          <Text style={styles.checkrideHeader}>Checkride Checklist</Text>
          {checkrideChecklist.map(item => (
            <Text key={item} style={styles.checkrideItem}>• {item}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  subheader: { fontSize: 16, fontWeight: 'bold', marginTop: 12 },
  completedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  completedItem: { fontSize: 15, marginLeft: 8 },
  analytics: { marginTop: 16, color: '#555' },
  checkrideBox: { marginTop: 20, padding: 12, backgroundColor: '#f9f9f9', borderRadius: 8 },
  checkrideHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  checkrideItem: { fontSize: 15, marginLeft: 8, marginTop: 4 },
});