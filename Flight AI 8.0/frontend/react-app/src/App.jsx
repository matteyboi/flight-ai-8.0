import React, { useState } from 'react'
import Admin from './Admin'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5051'

function LessonPanel(){
  const [topic, setTopic] = useState('navigation')
  const [lesson, setLesson] = useState('')
  const [loading, setLoading] = useState(false)

  async function generate(){
    setLoading(true)
    setLesson('')
    try{
      const res = await fetch(`${API_BASE}/lesson`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({topic})
      })
      const j = await res.json()
      setLesson(typeof j.lesson === 'string' ? j.lesson : JSON.stringify(j, null, 2))
    }catch(e){
      setLesson('Error: '+e.message)
    }finally{setLoading(false)}
  }

  return (
    <div>
      <div className="card">
        <label>Topic</label>
        <input value={topic} onChange={e=>setTopic(e.target.value)} />
        <button onClick={generate} disabled={loading}>{loading? 'Generating...':'Generate Lesson'}</button>
      </div>
      <div className="card">
        <h3>Lesson</h3>
        <pre className="lesson">{lesson}</pre>
      </div>
    </div>
  )
}

export default function App(){
  const [tab, setTab] = useState('lesson')

  return (
    <div className="container">
      <h1>Flight AI — React Demo</h1>
      <div style={{marginBottom:12}}>
        <button onClick={()=>setTab('lesson')} style={{marginRight:8}}>Lesson</button>
        <button onClick={()=>setTab('admin')}>Admin</button>
      </div>

      {tab === 'lesson' ? <LessonPanel /> : <Admin />}
    </div>
  )
}
