import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Platform, TextInput, View, Text, Button, Alert } from 'react-native';
import { FlatList } from 'react-native';
import { StageContext } from '../app/_layout';
import { db } from '../firebaseConfig';
import { getDoc, setDoc, doc } from 'firebase/firestore';
let storage = null;
if (Platform.OS === 'web') {
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
import { stages } from '../screens/syllabusData';
function getInitialLessons(stageId, completedLessons) {
  const stage = stages.find(s => s.id === stageId);
  return stage.lessons
    .filter(lesson => !completedLessons.includes(lesson))
    .map(lesson => ({ name: lesson, mastery: 0, notes: '', feedback: '' }));
}

export default function LessonsScreen() {
    console.log('LessonsScreen:', { currentStage, lessons, loading });
  const stageContext = useContext(StageContext);
  const [currentStage, setCurrentStage, completedLessonsCount, setCompletedLessons] = stageContext;
  const [completed, setCompleted] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [pendingComplete, setPendingComplete] = useState([]);
  const [lessonNotes, setLessonNotes] = useState("");
  const [loading, setLoading] = useState(true);

  // Load completed lessons and notes from Firestore, fallback to storage

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading lessons...</Text>
      </View>
    );
  }

  if (!lessons || lessons.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No lessons found.</Text>
      </View>
    );
  }
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const docRef = doc(db, 'users', 'defaultUser');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.completedLessons) {
            setCompleted(data.completedLessons);
            setLessons(getInitialLessons(currentStage, data.completedLessons));
          } else {
            setLessons(getInitialLessons(currentStage, []));
          }
          if (data.lessonNotes) setLessonNotes(data.lessonNotes);
        } else {
          // fallback to local storage
          if (storage) {
            storage.getItem('completedLessons').then(data => {
              if (data) {
                const parsed = JSON.parse(data);
                setCompleted(parsed);
                setLessons(getInitialLessons(currentStage, parsed));
              } else {
                setLessons(getInitialLessons(currentStage, []));
              }
            });
            storage.getItem('lessonNotes').then(data => {
              if (data) setLessonNotes(data);
            });
          } else {
            setLessons(getInitialLessons(currentStage, []));
          }
        }
      } catch (e) {
        // fallback to local storage
        if (storage) {
          storage.getItem('completedLessons').then(data => {
            if (data) {
              const parsed = JSON.parse(data);
              setCompleted(parsed);
              setLessons(getInitialLessons(currentStage, parsed));
            } else {
              setLessons(getInitialLessons(currentStage, []));
            }
          });
          storage.getItem('lessonNotes').then(data => {
            if (data) setLessonNotes(data);
          });
        } else {
          setLessons(getInitialLessons(currentStage, []));
        }
      }
      setLoading(false);
    }
    loadData();
  }, [currentStage]);

  // Save completed lessons to storage and Firestore
  useEffect(() => {
    if (storage) {
      storage.setItem('completedLessons', JSON.stringify(completed));
    }
    setCompletedLessons(completed.length);
    // Save to Firestore
    async function saveCompletedToCloud() {
      try {
        const docRef = doc(db, 'users', 'defaultUser');
        await setDoc(docRef, { completedLessons: completed }, { merge: true });
      } catch (e) {
        // Optionally show error
      }
    }
    if (!loading) saveCompletedToCloud();
  }, [completed]);

  // Save notes to storage and Firestore
  useEffect(() => {
    if (storage) {
      storage.setItem('lessonNotes', lessonNotes);
    }
    // Save to Firestore
    async function saveNotesToCloud() {
      try {
        const docRef = doc(db, 'users', 'defaultUser');
        await setDoc(docRef, { lessonNotes }, { merge: true });
      } catch (e) {
        // Optionally show error
      }
    }
    if (!loading) saveNotesToCloud();
  }, [lessonNotes]);

  const handleMastery = (index, value) => {
    const updated = [...lessons];
    updated[index].mastery = value;
    if (value === 4) {
      const [item] = updated.splice(index, 1);
      updated.push(item);
    }
    if (value === 5) {
      const [item] = updated.splice(index, 1);
      updated.push(item);
    }
    setLessons(updated);
  };

  // Save button handler
  const saveCompleted = async () => {
    const completedNames = lessons.filter(l => l.mastery === 5).map(l => l.name);
    setCompleted(prev => [...prev, ...completedNames]);
    setLessons(prev => prev.filter(l => l.mastery !== 5));
    // Save to Firestore immediately
    try {
      const docRef = doc(db, 'users', 'defaultUser');
      await setDoc(docRef, {
        completedLessons: [...completed, ...completedNames],
        lessonNotes
      }, { merge: true });
      Alert.alert('Saved to cloud!');
    } catch (e) {
      Alert.alert('Cloud save failed', e.message);
    }
  };

  // Restore lesson from history
  const restoreLesson = lessonName => {
    setCompleted(prev => prev.filter(l => l !== lessonName));
    setLessons(prev => [...prev, { name: lessonName, mastery: 0, notes: '', feedback: '' }]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header} accessibilityRole="header" accessibilityLabel={`Lessons for Stage ${currentStage}`}>Lessons (Stage {currentStage})</Text>
      <FlatList
        data={lessons}
        keyExtractor={item => item.name}
        renderItem={({ item, index }) => (
          <View style={styles.lessonRow}>
            <Text style={styles.lessonName} accessibilityRole="text" accessibilityLabel={`Lesson name: ${item.name}`}>{item.name}</Text>
            <View style={styles.masteryButtons}>
              {[1,2,3,4,5].map(val => (
                <Button
                  key={val}
                  title={val.toString()}
                  color={item.mastery === val ? '#1976d2' : '#bbb'}
                  onPress={() => handleMastery(index, val)}
                  accessibilityLabel={`Set mastery to ${val} for ${item.name}`}
                  accessibilityRole="button"
                />
              ))}
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.notesBox}>
            <Text style={styles.notesHeader}>Lesson Notes</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add overall notes for this lesson..."
              value={lessonNotes}
              onChangeText={setLessonNotes}
              multiline
              accessibilityLabel="Overall lesson notes"
              accessibilityRole="textbox"
            />
            <Button title="Save Completed" onPress={saveCompleted} accessibilityLabel="Save completed lessons" accessibilityRole="button" />
          </View>
        }
      />
      <Text style={styles.instructions} accessibilityRole="text">Tap a number to set your mastery (1-5). Lessons scored 5 will be saved at the end of the day.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 16, color: '#222' },
  lessonRow: { marginBottom: 20, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 },
  lessonName: { fontSize: 18, marginBottom: 6, color: '#333' },
  masteryButtons: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  instructions: { marginTop: 20, color: '#555', fontSize: 16 },
  notesBox: { marginTop: 32, padding: 14, backgroundColor: '#e3f2fd', borderRadius: 8 },
  notesHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#1976d2' },
  notesInput: { borderWidth: 1, borderColor: '#1976d2', borderRadius: 8, padding: 10, minHeight: 60, backgroundColor: '#fafafa', fontSize: 16 },
  pendingBox: { marginTop: 28, padding: 14, backgroundColor: '#e3f2fd', borderRadius: 8 },
  pendingHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#1976d2' },
  pendingItem: { fontSize: 16, marginLeft: 10, marginTop: 6, color: '#333' },
});
