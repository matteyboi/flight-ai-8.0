import React from 'react';

const styles = {
  lessonName: { fontSize: 18, marginBottom: 6, color: '#333' },
  masteryButtons: { display: 'flex', flexDirection: 'row', gap: 8, marginBottom: 8 },
  instructions: { marginTop: 20, color: '#555', fontSize: 16 },
  notesBox: { marginTop: 32, padding: 14, backgroundColor: '#e3f2fd', borderRadius: 8 },
  notesHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#1976d2' },
  notesInput: { border: '1px solid #1976d2', borderRadius: 8, padding: 10, minHeight: 60, backgroundColor: '#fafafa', fontSize: 16 }
};

function LessonsScreen() {
  return (
    <div>
      <div style={styles.lessonName}>Lesson Name</div>
      <div style={styles.masteryButtons}>Mastery Buttons</div>
      <div style={styles.instructions}>Instructions go here.</div>
      <div style={styles.notesBox}>
        <div style={styles.notesHeader}>Notes</div>
        <textarea style={styles.notesInput} placeholder="Enter your notes here..." />
      </div>
    </div>
  );
}

export default LessonsScreen;
