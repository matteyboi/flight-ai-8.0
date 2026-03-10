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
  if (!stages || stages.length === 0) return <div style={{color:'#d32f2f',fontSize:18,padding:'32px'}}>No course data available.</div>;
  if (!currentStage || !currentStage.tasks || currentStage.tasks.length === 0) return <div style={{color:'#d32f2f',fontSize:18,padding:'32px'}}>No tasks available for this stage.</div>;
  const displayRatings = currentStage.tasks;
  return (
    <div>
      <div className="stage-name">{currentStage ? currentStage.name : ''}</div>
      {displayRatings.map(task => (
        <div key={task.id} className="task-row">
          <span className="task-name">{task.name}</span>
          {task.farsAcs && (
            <a href={task.farsAcs.url} target="_blank" rel="noopener noreferrer" className="task-link">
              {task.farsAcs.text}
            </a>
          )}
          <span className="rating">
            {[1,2,3,4,5].map(r => (
              <button
                key={r}
                className={((unsavedRatings[task.id] === r || (!unsavedRatings[task.id] && task.rating === r)) ? 'selected' : '')}
                onClick={() => {
                  setUnsavedRatings(ratings => {
                    if (ratings[task.id] === r) {
                      const updated = { ...ratings };
                      delete updated[task.id];
                      return updated;
                    }
                    if (!ratings[task.id] && task.rating === r) {
                      return { ...ratings, [task.id]: 0 };
                    }
                    return { ...ratings, [task.id]: r };
                  });
                }}
                disabled={false}
              >{r}</button>
            ))}
          </span>
        </div>
      ))}
      <button className="button" onClick={() => {
        // Only call onTaskRating if at least one rating is set
          if (Object.keys(unsavedRatings).length > 0) {
            onTaskRating(currentStage.id, { ...unsavedRatings, notes });
            setUnsavedRatings({});
            setNotes(''); // Clear notes box
          }
        }}>Save Ratings</button>
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
