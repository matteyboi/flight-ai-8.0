import React, { useState } from 'react';

const styles = {
  stageName: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#1976d2' },
  progressBar: { height: 8, borderRadius: 4, background: '#e3f2fd', marginBottom: 12, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4, background: '#1976d2', transition: 'width 0.3s' },
  task: { display: 'flex', alignItems: 'center', marginBottom: 10 },
  taskName: { flex: 1, fontSize: 16 },
  rating: { marginLeft: 12 },
  notesBox: { marginTop: 32, padding: 14, backgroundColor: '#e3f2fd', borderRadius: 8 },
  notesHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#1976d2' },
  notesInput: { borderWidth: 1, borderColor: '#1976d2', borderRadius: 8, padding: 10, minHeight: 60, backgroundColor: '#fafafa', fontSize: 16, width: '100%' }
};

function LessonsTab({ currentStage, onTaskRating, studentId, stages }) {
  const [notes, setNotes] = useState('');
  const [unsavedRatings, setUnsavedRatings] = useState({});
  const [prevScores, setPrevScores] = useState({});
  const [justSaved, setJustSaved] = useState(false);

  // Load previous scores from localStorage on mount
  React.useEffect(() => {
    const key = `lessonScores_${studentId}_${currentStage?.id}`;
    const stored = window.localStorage.getItem(key);
    if (stored) {
      setPrevScores(JSON.parse(stored));
    }
    setJustSaved(false);
  }, [studentId, currentStage?.id]);

  // Save scores to localStorage after save
  const handleSave = () => {
    if (Object.keys(unsavedRatings).length > 0) {
      onTaskRating(currentStage.id, { ...unsavedRatings, notes });
      // Merge new ratings into prevScores and save
      const newScores = { ...prevScores, ...unsavedRatings };
      setPrevScores(newScores);
      const key = `lessonScores_${studentId}_${currentStage?.id}`;
      window.localStorage.setItem(key, JSON.stringify(newScores));
      setUnsavedRatings({});
      setNotes('');
      setJustSaved(true);
    }
  };

  // Only show tasks that have not been rated 5 (mastered), but only filter after save
  let displayRatings = currentStage.tasks;
  if (justSaved) {
    // After save, use only prevScores (persisted) to filter out tasks rated 5
    displayRatings = currentStage.tasks.filter(task => {
      const score = prevScores[task.id] !== undefined ? prevScores[task.id] : task.rating;
      return score !== 5;
    });
  }
  return (
    <div>
      <div className="stage-name">{currentStage ? currentStage.name : ''}</div>
      {displayRatings.map(task => {
        const lastScore = unsavedRatings[task.id] !== undefined ? unsavedRatings[task.id] : (prevScores[task.id] !== undefined ? prevScores[task.id] : task.rating);
        return (
          <div key={task.id} className="task-row">
            <span className="task-name">{task.name}</span>
            {task.farsAcs && (
              <a href={task.farsAcs.url} target="_blank" rel="noopener noreferrer" className="task-link">
                {task.farsAcs.text}
              </a>
            )}
            <span className="rating">
              {[1,2,3,4,5].map(r => {
                // Show previous score in grey if it matches lastScore and not just selected
                const isPrev = prevScores[task.id] === r && lastScore === r && unsavedRatings[task.id] === undefined;
                const isSelected = unsavedRatings[task.id] === r;
                return (
                  <button
                    key={r}
                    className={isSelected ? 'selected' : isPrev ? 'prev-score' : ''}
                    style={isPrev ? { background: '#eee', color: '#888', border: '1px solid #bbb' } : {}}
                    onClick={() => {
                      setUnsavedRatings(ratings => {
                        if (ratings[task.id] === r) {
                          const updated = { ...ratings };
                          delete updated[task.id];
                          return updated;
                        }
                        return { ...ratings, [task.id]: r };
                      });
                    }}
                    disabled={false}
                  >{r}</button>
                );
              })}
            </span>
          </div>
        );
      })}
      <button className="button" onClick={handleSave}>Save Ratings</button>
      <div className="card notes-box">
        <div className="notes-header">Notes</div>
        <textarea
          className="notes-input"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Enter notes here..."
        />
      </div>
    </div>
  );
}
export default LessonsTab;
// ...existing code...
