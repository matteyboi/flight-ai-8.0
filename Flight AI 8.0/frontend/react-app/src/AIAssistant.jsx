import React, { useState } from 'react';

export default function AIAssistant() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    setLoading(true);
    setAnswer('');
    try {
      const r = await fetch(`${API_BASE}/lesson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: question })
      });
      const j = await r.json();
      if (j && typeof j.lesson === 'string') {
        setAnswer(j.lesson);
      } else {
        setAnswer(JSON.stringify(j, null, 2));
      }
    } catch (e) {
      setAnswer('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{maxWidth:400,margin:'0 auto',padding:'16px',background:'#fff',borderRadius:'16px',boxShadow:'0 2px 12px rgba(25,118,210,0.12)',display:'flex',flexDirection:'column',gap:'12px'}}>
      <div style={{alignSelf:'flex-start',background:'#e3f2fd',color:'#1976d2',borderRadius:'12px',padding:'10px 18px',fontSize:'16px',marginBottom:'8px',boxShadow:'0 1px 4px rgba(25,118,210,0.06)'}}>
        Ask your aviation questions
      </div>
      <div style={{display:'flex',gap:'8px',position:'relative'}}>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Type your question..."
          style={{flex:1,padding:'12px',borderRadius:'12px',border:'1px solid #1976d2',fontSize:'16px'}}
          aria-label="Aviation question input"
        />
        {/* ...existing code... */}
      </div>
      <div style={{fontFamily:'cursive',fontSize:'12px',color:'#d35400',fontWeight:'bold',letterSpacing:'1px',background:'#1976d2',borderRadius:'12px',padding:'2px 12px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
        Co-Pi
      </div>
      {/* Show answer if present */}
      {answer && (
        <div style={{marginTop:'12px',background:'#f5f5f5',borderRadius:'12px',padding:'12px',color:'#333',fontSize:'15px'}}>
          {answer}
        </div>
      )}
    </div>
  );
}
