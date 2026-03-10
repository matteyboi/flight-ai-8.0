import React from 'react';
import HistoryDay from './HistoryDay';

// Accept history as a prop
export default function HistoryPanel({ historyDays, onDeleteHistory }) {
  return (
    <div>
      <h2 style={{margin:'32px 0 16px',fontSize:28,color:'#1976d2',textAlign:'center'}}>History</h2>
      {historyDays && historyDays.length > 0 ? (
        historyDays.map((day, idx) => (
          <HistoryDay key={idx} day={day} onDelete={() => onDeleteHistory(idx)} />
        ))
      ) : (
        <div style={{textAlign:'center',color:'#888'}}>No completed lessons yet.</div>
      )}
    </div>
  );
}
