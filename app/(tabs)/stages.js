import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { stages } from '../../screens/syllabusData';

export default function StagesScreen() {
  const [openStage, setOpenStage] = useState(null);
  const [stageLocks, setStageLocks] = useState(stages.map(s => s.locked));

  // Unlock next stage when all lessons in current stage are completed
  // For demo, unlock stage 2 if stage 1 is complete
  const stage1Lessons = stages[0].lessons.length;
  const stage1Completed = false; // Replace with real completed count

  React.useEffect(() => {
    if (stage1Completed && stageLocks[1]) {
      const updated = [...stageLocks];
      updated[1] = false;
      setStageLocks(updated);
    }
  }, [stage1Completed, stageLocks]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Training Stages</Text>
      {stages.map((s, i) => {
        const item = { ...s, locked: stageLocks[i] };
        return (
          <View key={item.id} style={[styles.stageBox, item.locked && styles.lockedStage]}>
            <TouchableOpacity
              disabled={item.locked}
              onPress={() => setOpenStage(openStage === item.id ? null : item.id)}
              style={styles.stageHeader}
            >
              <Text style={[styles.stageTitle, item.locked && styles.lockedText]}>
                {item.name} {item.locked ? '(Locked)' : ''}
              </Text>
            </TouchableOpacity>
            {openStage === item.id && !item.locked && (
              <View style={styles.dropdown}>
                {item.lessons.map(lesson => (
                  <Text key={lesson} style={styles.lessonItem}>• {lesson}</Text>
                ))}
              </View>
            )}
          </View>
        );
      })}
      <Text style={styles.instructions}>Stages are locked until you complete the previous one. Tap a stage to view its required tasks.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  stageBox: { marginBottom: 16, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fff' },
  lockedStage: { backgroundColor: '#eee' },
  stageHeader: { padding: 12 },
  stageTitle: { fontSize: 18, fontWeight: 'bold' },
  lockedText: { color: '#aaa' },
  dropdown: { padding: 12, backgroundColor: '#f9f9f9', borderTopWidth: 1, borderColor: '#eee' },
  lessonItem: { fontSize: 16, marginBottom: 4 },
  instructions: { marginTop: 16, color: '#555' },
});