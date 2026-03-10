import React, {useState} from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5051'

function authHeaders(user, pass, token){
  const headers = {}
  if (token) headers['Authorization'] = 'Bearer ' + token
  else if (user || pass) headers['Authorization'] = 'Basic ' + btoa(`${user}:${pass}`)
  return headers
}

export default function Admin(){
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [token, setToken] = useState('')
  const [limit, setLimit] = useState(20)
  const [student, setStudent] = useState('')
  const [offset, setOffset] = useState(0)
  const [entries, setEntries] = useState([])
  const [total, setTotal] = useState(0)
  const [audit, setAudit] = useState([])
  const [deleteId, setDeleteId] = useState('')
  const [outDelete, setOutDelete] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function isValidLimit(val){
    return Number.isInteger(val) && val > 0
  }

  function isValidDeleteId(val){
    return String(val).trim() !== '' && /^\d+$/.test(String(val))
  }

  async function fetchProgress(){
    if (!isValidLimit(limit)) { alert('Limit must be a positive integer'); return }
    const qs = `?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}${student?`&student_id=${encodeURIComponent(student)}`:''}`
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/admin/progress${qs}`, { headers: authHeaders(user, pass, token) });
      if (!r.ok) throw new Error('Unauthorized or error: '+r.status);
      const j = await r.json();
      setEntries(j.entries||[]);
      setTotal(j.total||0);
    } catch (e) {
      setEntries([]);
      setTotal(0);
      setError('Error: '+e.message);
    } finally {
      setLoading(false);
    }
  }

  async function exportProgress(){
    const qs = `?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}${student?`&student_id=${encodeURIComponent(student)}`:''}`;
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/admin/progress.csv${qs}`, { headers: authHeaders(user, pass, token) });
      if (!r.ok) throw new Error('Export failed: '+r.status);
      // handle CSV download
    } catch (e) {
      alert('Export failed: '+e.message);
    } finally {
      setLoading(false);
    }
    const blob = await r.blob(); const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'progress.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  }

  function exportProgressClient(){
    if (!entries || entries.length===0) { alert('No entries to export'); return }
    const rows = entries.map(e=>({ id: e.id, student_id: e.student_id, timestamp: e.timestamp, data: e.data||{} }))
    const header = ['id','student_id','timestamp','data']
    const lines = [header.join(',')]
    for(const r of rows){
      const cells = [r.id, r.student_id, r.timestamp, JSON.stringify(r.data).replace(/"/g,'""')]
      const quoted = cells.map(c => '"'+String(c===undefined||c===null?'':c).replace(/"/g,'""')+'"')
      lines.push(quoted.join(','))
    }
    const csv = lines.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'progress-local.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  }

  async function doDelete(){
    if (!isValidDeleteId(deleteId)) { setOutDelete('Enter a numeric id'); return }
    if (!window.confirm(`Delete progress entry ${deleteId}? This cannot be undone.`)) { setOutDelete('Cancelled'); return }
    setOutDelete('Deleting...')
    try{
      const r = await fetch(`${API_BASE}/admin/progress/${encodeURIComponent(deleteId)}`, { method: 'DELETE', headers: authHeaders(user, pass, token) })
      const j = await r.json()
      setOutDelete(JSON.stringify(j, null, 2))
      await fetchProgress()
    }catch(e){ setOutDelete('Error: '+e.message) }
  }

  async function fetchAudit(){
    const qs = `?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/admin/audit${qs}`, { headers: authHeaders(user, pass, token) });
      if (!r.ok) throw new Error('Audit fetch failed: '+r.status);
      const j = await r.json();
      setAudit(j.entries||[]);
    } catch (e) {
      setAudit([]);
      setError('Error: '+e.message);
    } finally {
      setLoading(false);
    }
  }

  async function exportAudit(){
    const qs = `?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/admin/audit.csv${qs}`, { headers: authHeaders(user, pass, token) });
      if (!r.ok) throw new Error('Export failed: '+r.status);
      // handle CSV download
    } catch (e) {
      alert('Export failed: '+e.message);
    } finally {
      setLoading(false);
    }
    const blob = await r.blob(); const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'audit.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="card">
        <h3>Admin Credentials</h3>
        <label>Admin user</label>
        <input value={user} onChange={e=>setUser(e.target.value)} />
        <label>Admin pass</label>
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} />
        <label>Bearer token (optional)</label>
        <input value={token} onChange={e=>setToken(e.target.value)} />
      </div>

      <div className="card">
        <h3>View Progress</h3>
        <label>Limit</label>
        <input value={limit} onChange={e=>setLimit(Number(e.target.value||0))} style={{width:120}} />
        <label style={{marginLeft:12}}>Student</label>
        <input value={student} onChange={e=>setStudent(e.target.value)} />
        <div style={{marginTop:8}}>
          <button onClick={()=>{ setOffset(Math.max(0, offset - limit)); fetchProgress() }} disabled={!isValidLimit(limit)}>Prev</button>
          <button onClick={()=>{ setOffset(offset + limit); fetchProgress() }} disabled={!isValidLimit(limit)}>Next</button>
          <button onClick={fetchProgress} style={{marginLeft:8}} disabled={!isValidLimit(limit)}>Fetch</button>
          <button onClick={exportProgress} style={{marginLeft:8}}>Export CSV (server)</button>
          <button onClick={exportProgressClient} style={{marginLeft:8}}>Export CSV (client)</button>
        </div>
        <div style={{marginTop:8}}>Total: {total} — Offset: {offset}</div>
        {entries && entries.length>0 ? (
          <table className="data-table" style={{width:'100%',marginTop:8}}>
            <thead>
              <tr><th>ID</th><th>Student</th><th>Timestamp</th><th>Summary</th></tr>
            </thead>
            <tbody>
              {entries.map(e=>{
                const summary = e.data && typeof e.data === 'object' ? JSON.stringify(e.data).slice(0,120) : String(e.data).slice(0,120)
                return (
                  <tr key={e.id}>
                    <td>{e.id}</td>
                    <td>{e.student_id}</td>
                    <td>{e.timestamp}</td>
                    <td style={{fontSize:12,whiteSpace:'pre-wrap'}}>{summary}</td>
                    <td style={{width:120}}>
                      <button onClick={()=>{ navigator.clipboard?.writeText(JSON.stringify(e.data||{})).then(()=>alert('Copied'), ()=>alert('Copy failed')) }}>Copy JSON</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div style={{marginTop:8,color:'#666'}}>No entries</div>
        )}
      </div>

      <div className="card">
        <h3>Audit</h3>
        <div>
          <button onClick={fetchAudit}>Fetch Audit</button>
          <button onClick={exportAudit} style={{marginLeft:8}}>Export Audit CSV</button>
        </div>
        {audit && audit.length>0 ? (
          <table className="data-table" style={{width:'100%',marginTop:8}}>
            <thead>
              <tr><th>ID</th><th>Action</th><th>Entry ID</th><th>Admin</th><th>Timestamp</th><th>Details</th></tr>
            </thead>
            <tbody>
              {audit.map(a=> (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.action}</td>
                  <td>{a.entry_id}</td>
                  <td>{a.admin_user}</td>
                  <td>{a.timestamp}</td>
                  <td style={{fontSize:12,whiteSpace:'pre-wrap'}}>{JSON.stringify(a.details || '').slice(0,140)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{marginTop:8,color:'#666'}}>No audit entries</div>
        )}
      </div>

      <div className="card">
        <h3>Delete Progress Entry</h3>
        <input placeholder="entry id" value={deleteId} onChange={e=>setDeleteId(e.target.value)} />
        <button onClick={doDelete} style={{marginLeft:8}} disabled={!isValidDeleteId(deleteId)}>Delete</button>
        <pre style={{background:'#fff3f3',padding:8,marginTop:8}}>{outDelete}</pre>
      </div>
    </div>
  )
}
