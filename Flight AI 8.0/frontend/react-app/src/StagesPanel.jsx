import React, { useState } from 'react';

const styles = {
  stage: { marginBottom: 24, padding: 16, borderRadius: 8, background: '#f5f5f5' },
  stageName: { fontWeight: 'bold', fontSize: 18, marginBottom: 8 },
  progressBar: { height: 8, borderRadius: 4, background: '#e3f2fd', marginBottom: 12, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4, background: '#1976d2', transition: 'width 0.3s' },
  task: { display: 'flex', alignItems: 'center', marginBottom: 8 },
  taskName: { flex: 1 },
  rating: { marginLeft: 12 },
  disabled: { opacity: 0.5, pointerEvents: 'none' }
};

function StagesPanel({ stageStatus, onTaskRating }) {
  const [openStage, setOpenStage] = useState(null);
  const stages = stageStatus;
  if (!stages || stages.length === 0) return <div style={{color:'#d32f2f',fontSize:18,padding:'32px'}}>No stages available.</div>;
  return (
    <div>
      {stages.map((stage, idx) => {
        const prevCompleted = idx === 0 || stageStatus[idx - 1]?.completed;
        const totalTasks = stage.tasks.length;
        const masteredTasks = stage.tasks.filter(t => t.rating === 5).length;
        const progress = totalTasks ? Math.round((masteredTasks / totalTasks) * 100) : 0;
        const isLocked = !prevCompleted;
        if (!stage.tasks || stage.tasks.length === 0) {
          return <div key={stage.id} style={{...styles.stage, color:'#d32f2f'}}>No tasks available for this stage.</div>;
        }
        return (
          <div key={stage.id} style={isLocked ? { ...styles.stage, opacity: 0.6 } : styles.stage}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  ...styles.stageName,
                  cursor: 'pointer',
                  color: isLocked ? '#b0b0b0' : '#222',
                  textShadow: isLocked ? '0 1px 2px #fff' : '0 1px 2px #000',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onClick={() => setOpenStage(openStage === stage.id ? null : stage.id)}
              >
                {stage.name}
              </div>
              <div style={{ width: 120 }}>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                </div>
                <span style={{ fontSize: 12 }}>{masteredTasks}/{totalTasks} mastered</span>
              </div>
            </div>
            {openStage === stage.id && (
              <div>
                {stage.tasks.map(task => (
                  <div key={task.id} style={styles.task}>
                    <span style={styles.taskName}>{task.name}</span>
                    {task.farsAcs && (
                      <span style={{ marginLeft: 8 }}>
                        <a href={task.farsAcs.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0077cc', textDecoration: 'underline' }}>
                          {task.farsAcs.text}
                        </a>
                      </span>
                    )}
                    <span style={styles.rating}>
                      {[1,2,3,4,5].map(r => (
                        <button
                          key={r}
                          disabled={task.rating !== 0}
                          style={{
                            background: task.rating === r ? '#1976d2' : '#e3f2fd',
                            color: task.rating === r ? '#fff' : '#1976d2',
                            border: 'none',
                            borderRadius: '50%',
                            width: 28,
                            height: 28,
                            marginLeft: 2,
                            cursor: task.rating !== 0 ? 'not-allowed' : 'pointer'
                          }}
                          onClick={() => {
                            if (task.rating !== 0) return;
                            onTaskRating(stage.id, task.id, r);
                          }}
                        >{r}</button>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StagesPanel;
