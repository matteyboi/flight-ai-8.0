import React, { useState } from 'react';

export default function HistoryDay({ day, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  // Helper: get timestamp from day.date
  let timestamp = '';
  if (day.date && day.date !== 'Unknown') {
    // Use original ISO string if available
    if (day._rawDate) {
      timestamp = new Date(day._rawDate).toLocaleTimeString();
    } else {
      timestamp = new Date(day.date).toLocaleTimeString();
    }
  }
  return (
    <div
      className="history-day-box"
      style={{margin:'24px 0',borderRadius:16,boxShadow:'0 2px 12px rgba(25,118,210,0.08)',background:'#fff',padding:'20px',transition:'box-shadow 0.2s',border:'1px solid #e3f2fd',cursor:'pointer'}}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontWeight:'bold',fontSize:20}}>{day.date}</div>
          {expanded && (
            <div style={{fontSize:14,color:'#888',marginTop:2}}>{timestamp}</div>
          )}
        </div>
        <button style={{marginRight:8,background:'none',border:'none',color:'#d32f2f',fontSize:18,cursor:'pointer'}} onClick={e => {e.stopPropagation(); onDelete();}} title="Delete">🗑️</button>
      </div>
      {expanded && (
        <div style={{marginTop:16}}>
          <div style={{marginBottom:8}}>
            <strong>Maneuvers:</strong> {day.maneuvers.join(', ')}
          </div>
          <div style={{marginBottom:8}}>
            <strong>Tasks:</strong>
            <ul style={{margin:'8px 0 0 16px'}}>
              {day.tasks.map((task, idx) => (
                <li key={idx} style={{marginBottom:4}}>
                  {task.name} <span style={{color:'#888'}}>Score: {task.score}</span>
                </li>
              ))}
            </ul>
          </div>
          <div style={{marginBottom:8}}>
            <strong>Notes:</strong>
            <ul style={{margin:'8px 0 0 16px'}}>
              {day.notes.map((note, idx) => (
                <li key={idx} style={{marginBottom:4}}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
