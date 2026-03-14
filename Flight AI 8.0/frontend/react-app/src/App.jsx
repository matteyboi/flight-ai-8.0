import { ErrorBoundary } from './ErrorBoundary';
import AIAssistant from './AIAssistant';
import React, { useState } from 'react';
import LessonsTab from './LessonsTab';
import HistoryPanel from './HistoryPanel';
import StagesPanel from './StagesPanel';
import Admin from './Admin';

// Helper: group history into lesson days
function groupHistoryByDay(history) {
  // Each history event is a day, with tasks array
  return history.map(event => ({
    date: event.date ? new Date(event.date).toLocaleDateString() : 'Unknown',
    _rawDate: event.date || '',
    maneuvers: event.tasks ? event.tasks.map(t => t.name) : [],
    tasks: event.tasks ? event.tasks.map(t => ({ name: t.name, score: t.rating })) : [],
    notes: event.notes ? [event.notes] : []
  }));
}

export default function App() {
    // Regulatory updates modal state
    const [showRegUpdates, setShowRegUpdates] = useState(() => {
      // Only show on first load (could use localStorage for persistence)
      return !window.localStorage.getItem('regUpdatesAgreed');
    });
    // Handler for agreeing to regulatory updates
    const handleAgreeRegUpdates = () => {
      window.localStorage.setItem('regUpdatesAgreed', 'true');
      setShowRegUpdates(false);
    };
    {/* Regulatory Updates Modal */}
    {showRegUpdates && (
      <div className="reg-updates-modal" style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.5)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{background:'#fff',padding:'32px',borderRadius:'12px',boxShadow:'0 2px 24px rgba(0,0,0,0.18)',maxWidth:'480px',width:'90%',textAlign:'center'}}>
          <h2 style={{marginBottom:'16px'}}>Regulatory Updates</h2>
          <div style={{marginBottom:'24px',fontSize:'16px',color:'#333'}}>
            <p>Important FAA, FAR, ACS, and aviation regulation changes have been updated. Please review the latest requirements before continuing your training.</p>
            <ul style={{textAlign:'left',margin:'16px auto',padding:'0 24px',fontSize:'15px',color:'#555'}}>
              <li>New ACS standards effective March 2026</li>
              <li>Recent FAR amendments for student pilots</li>
              <li>Updated FAA guidance on flight training</li>
              <li>See syllabus documentation for full details</li>
            </ul>
          </div>
          <button style={{background:'#1976d2',color:'#fff',border:'none',borderRadius:'8px',padding:'12px 32px',fontSize:'16px',cursor:'pointer',fontWeight:'bold'}} onClick={handleAgreeRegUpdates}>Acknowledge</button>
        </div>
      </div>
    )}
  // Set default tab to 'lessons' for all environments
  const [profilePhoto, setProfilePhoto] = useState(null);
  const fileInputRef = React.useRef();
  const [tab, setTab] = useState('lessons');
  // State for AI modal
  const [showAIModal, setShowAIModal] = useState(false);
  // Shared stage/task state
  const [stages, setStages] = useState([
    {
      id: 1,
      name: 'Stage 1 — Very Early (First ~5–10 Hours)',
      tasks: [
        { id: 1, name: 'Taxiing Using Rudder Pedals', rating: 0, farsAcs: { text: 'FAR 61.107(b)(1)', url: 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61' } },
        { id: 2, name: 'Normal Takeoff Procedure', rating: 0, farsAcs: { text: 'ACS Area of Operation II', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 3, name: 'Rotation & Initial Climb', rating: 0, farsAcs: { text: 'ACS Area of Operation II', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 4, name: 'Straight & Level Flight (Altitude, Heading Hold)', rating: 0, farsAcs: { text: 'ACS Area of Operation III', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 5, name: 'Vy/Vx Climb Performance', rating: 0, farsAcs: { text: 'ACS Area of Operation II', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 6, name: 'Taxi Clearance Request', rating: 0, farsAcs: { text: 'FAR 91.129', url: 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-F/part-91' } },
        { id: 7, name: 'Turns to Headings (Standard Rate)', rating: 0, farsAcs: { text: 'ACS Area of Operation III', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 8, name: 'Climbing & Descending Turns', rating: 0, farsAcs: { text: 'ACS Area of Operation III', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 9, name: 'Traffic Pattern Entry & Position Reports', rating: 0, farsAcs: { text: 'FAR 91.126', url: 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-F/part-91' } },
        { id: 10, name: 'Normal Landing Procedure', rating: 0, farsAcs: { text: 'ACS Area of Operation IV', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 11, name: 'Full Stop Landings', rating: 0, farsAcs: { text: 'ACS Area of Operation IV', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 12, name: 'Go-Around/Missed Approach Procedures', rating: 0, farsAcs: { text: 'ACS Area of Operation IV', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 13, name: 'Touch-and-Go Landings', rating: 0, farsAcs: { text: 'ACS Area of Operation IV', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 14, name: 'Use of Flaps for Landing', rating: 0, farsAcs: { text: 'ACS Area of Operation IV', url: 'https://www.faa.gov/training_testing/testing/acs' } }
      ],
      completed: false
    },
    {
      id: 2,
      name: 'Stage 2 — Early Training (Pre-Solo Skill Building)',
      tasks: [
        { id: 15, name: 'Crosswind Takeoff Technique', rating: 0, farsAcs: { text: 'ACS Area of Operation II', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 16, name: 'Crosswind Landing Technique', rating: 0, farsAcs: { text: 'ACS Area of Operation IV', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 17, name: 'Slow Flight (Configuration, Control)', rating: 0, farsAcs: { text: 'ACS Area of Operation VII', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 18, name: 'Power-Off Stalls (Approach to Landing Stall)', rating: 0, farsAcs: { text: 'ACS Area of Operation VII', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 19, name: 'Power-On Stalls (Takeoff/Departure Stall)', rating: 0, farsAcs: { text: 'ACS Area of Operation VII', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 20, name: 'Rectangular Course', rating: 0, farsAcs: { text: 'ACS Area of Operation VIII', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 21, name: 'Turns Around a Point', rating: 0, farsAcs: { text: 'ACS Area of Operation VIII', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 22, name: 'S-Turns Across a Road', rating: 0, farsAcs: { text: 'ACS Area of Operation VIII', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 23, name: 'Basic Instrument Maneuvers (Straight & Level, Turns, Climbs, Descents)', rating: 0, farsAcs: { text: 'ACS Area of Operation IX', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 24, name: 'Use of Backup Instruments', rating: 0, farsAcs: { text: 'ACS Area of Operation IX', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 25, name: 'Engine Failure During Takeoff Roll', rating: 0, farsAcs: { text: 'ACS Area of Operation X', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 26, name: 'Engine Failure After Takeoff', rating: 0, farsAcs: { text: 'ACS Area of Operation X', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 27, name: 'Engine Failure in Flight (ABC: Airspeed, Best Field, Checklist)', rating: 0, farsAcs: { text: 'ACS Area of Operation X', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 28, name: 'Forced Landing (Field Selection, Approach, Landing)', rating: 0, farsAcs: { text: 'ACS Area of Operation X', url: 'https://www.faa.gov/training_testing/testing/acs' } }
      ],
      completed: false
    },
    {
      id: 3,
      name: 'Stage 3 — Solo Readiness / Early Solo Phase',
      tasks: [
        { id: 29, name: 'Solo Takeoffs & Landings', rating: 0, farsAcs: { text: 'FAR 61.87', url: 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61' } },
        { id: 30, name: 'Solo Traffic Pattern Operations', rating: 0, farsAcs: { text: 'FAR 61.87', url: 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61' } },
        { id: 31, name: 'Short Field Takeoff Technique', rating: 0, farsAcs: { text: 'ACS Area of Operation II', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 32, name: 'Short Field Landing Technique', rating: 0, farsAcs: { text: 'ACS Area of Operation IV', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 33, name: 'Soft Field Takeoff Technique', rating: 0, farsAcs: { text: 'ACS Area of Operation II', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 34, name: 'Soft Field Landing Technique', rating: 0, farsAcs: { text: 'ACS Area of Operation IV', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 35, name: 'Forward Slip to Landing', rating: 0, farsAcs: { text: 'ACS Area of Operation IV', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 36, name: 'Emergency Descent', rating: 0, farsAcs: { text: 'ACS Area of Operation X', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 37, name: 'Recovery from Unusual Attitudes', rating: 0, farsAcs: { text: 'ACS Area of Operation X', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 38, name: 'Electrical Failure (Alternator/Generator Out)', rating: 0, farsAcs: { text: 'ACS Area of Operation X', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 39, name: 'Fire (Engine, Cabin, Electrical)', rating: 0, farsAcs: { text: 'ACS Area of Operation X', url: 'https://www.faa.gov/training_testing/testing/acs' } }
      ],
      completed: false
    },
    {
      id: 4,
      name: 'Stage 4 — Cross Country Phase',
      tasks: [
        { id: 40, name: 'Sectional Chart Reading', rating: 0, farsAcs: { text: 'ACS Area of Operation XI', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 41, name: 'Use of Electronic Flight Bag (ForeFlight, Garmin Pilot)', rating: 0, farsAcs: { text: 'ACS Area of Operation XI', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 42, name: 'Pilotage (Visual Reference Points)', rating: 0, farsAcs: { text: 'ACS Area of Operation XI', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 43, name: 'Dead Reckoning Navigation', rating: 0, farsAcs: { text: 'ACS Area of Operation XI', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 44, name: 'GPS Navigation (Direct-To, Flight Plan, Waypoints)', rating: 0, farsAcs: { text: 'ACS Area of Operation XI', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 45, name: 'VOR Navigation (Tune, Identify, Track Radials)', rating: 0, farsAcs: { text: 'ACS Area of Operation XI', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 46, name: 'Radio Navigation (VOR, ILS, GPS, DME, ADF)', rating: 0, farsAcs: { text: 'ACS Area of Operation XI', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 47, name: 'Diversion to Alternate Airport', rating: 0, farsAcs: { text: 'ACS Area of Operation XI', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 48, name: 'Cross Country Flight Execution', rating: 0, farsAcs: { text: 'ACS Area of Operation XI', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 49, name: 'Solo Cross Country Planning & Execution', rating: 0, farsAcs: { text: 'ACS Area of Operation XI', url: 'https://www.faa.gov/training_testing/testing/acs' } }
      ],
      completed: false
    },
    {
      id: 5,
      name: 'Stage 5 — Advanced / Night / Checkride Prep',
      tasks: [
        { id: 50, name: 'Night Taxi Procedures', rating: 0, farsAcs: { text: 'ACS Area of Operation XII', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 51, name: 'Night Takeoff & Landing', rating: 0, farsAcs: { text: 'ACS Area of Operation XII', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 52, name: 'Night Traffic Pattern Operations', rating: 0, farsAcs: { text: 'ACS Area of Operation XII', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 53, name: 'Night Navigation (Visual, Electronic)', rating: 0, farsAcs: { text: 'ACS Area of Operation XII', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 54, name: 'Solo Night Flight', rating: 0, farsAcs: { text: 'ACS Area of Operation XII', url: 'https://www.faa.gov/training_testing/testing/acs' } },
        { id: 55, name: 'Solo Emergency Procedures', rating: 0, farsAcs: { text: 'ACS Area of Operation XII', url: 'https://www.faa.gov/training_testing/testing/acs' } }
      ],
      completed: false
    }
  ])
  const [history, setHistory] = useState([])

  // Task rating handler
  // Accepts either (stageId, taskId, rating) or (stageId, ratingsObj)
  function handleTaskRating(stageId, taskOrRatings, rating) {
    if (typeof taskOrRatings === 'object' && rating === undefined) {
      // Save button: ratingsObj
      const ratingsObj = taskOrRatings;
      let workedTasks = [];
      setStages(prevStages => prevStages.map((stage, idx, arr) => {
        if (stage.id !== stageId) return stage;
        let tasks = stage.tasks.map(task => {
          const newRating = ratingsObj[task.id];
          if (newRating === undefined) return task;
          workedTasks.push({
            ...task,
            rating: newRating,
            completedAt: new Date().toISOString(),
            notes: ratingsObj.notes || ''
          });
          return { ...task, rating: newRating };
        });
        // Only mark stage complete if all tasks are rated 4 or 5
        const completed = tasks.every(t => t.rating === 4 || t.rating === 5);
        // Move 4-rated tasks to bottom
        tasks = [...tasks.filter(t => t.rating !== 4), ...tasks.filter(t => t.rating === 4)];
        return { ...stage, tasks, completed };
      }));
      if (workedTasks.length) {
        // Create a single history event for all tasks worked on that day
        setHistory(h => [
          ...h,
          {
            date: new Date().toISOString(),
            stageId,
            tasks: workedTasks,
            notes: ratingsObj.notes || ''
          }
        ]);
      }
    } else {
      // Immediate rating (for stages panel)
      setStages(prevStages => prevStages.map(stage => {
        if (stage.id !== stageId) return stage;
        let tasks = stage.tasks.map(task => {
          if (task.id !== taskOrRatings) return task;
          return { ...task, rating };
        });
        // Stage complete if all tasks rated 4 or 5
        const completed = tasks.every(t => t.rating === 4 || t.rating === 5);
        // Move 4-rated tasks to bottom
        tasks = [...tasks.filter(t => t.rating !== 4), ...tasks.filter(t => t.rating === 4)];
        return { ...stage, tasks, completed };
      }));
    }
  }

  // Delete history event handler
  function handleDeleteHistory(idx) {
    setHistory(h => {
      const deleted = h[idx];
      // Restore deleted task to its original stage
      setStages(prevStages => prevStages.map(stage => {
        if (stage.tasks.some(t => t.id === deleted.id)) {
          // Already present, skip
          return stage;
        }
        // Find correct stage by task id
        if (stage.tasks.length > 0 && stage.tasks[0].id <= deleted.id && stage.tasks[stage.tasks.length-1].id >= deleted.id) {
          // Insert back
          return {
            ...stage,
            tasks: [...stage.tasks, { ...deleted, rating: 0 }],
            completed: false
          };
        }
        return stage;
      }));
      return h.filter((_, i) => i !== idx);
    });
  }

  // Current stage: first incomplete
  const currentStage = stages.find(s => !s.completed) || stages[0];

  // Panels
  function ProceduresPanel(){return <div className="card"><h3>Procedures</h3><p>Procedures and checklists coming soon.</p></div>}
  function MasteryAnalyticsPanel({ stages }) {
    // Progress bar removed as requested
    return null;
  }

  const [studentId, setStudentId] = useState('default');
  // Student info mock
  const studentNames = {
    default: 'Alex Smith',
    student1: 'Jordan Lee',
    student2: 'Morgan Patel',
    student3: 'Taylor Kim'
  };
  const licenseTypes = {
    default: 'Private Pilot',
    student1: 'Instrument Rating',
    student2: 'Commercial Pilot',
    student3: 'CFI'
  };
  const currentStageName = currentStage ? currentStage.name : 'No Stage';

  return (
    <div className="app-container" data-testid="main-container">
      <div className="header-box">
        <div className="header-row">
          {/* Clickable avatar circle on right */}
          <div
            className="avatar-circle"
            onClick={()=>fileInputRef.current.click()}
            title={profilePhoto ? 'Change photo' : 'Add photo'}
            aria-label={profilePhoto ? 'Change profile photo' : 'Add profile photo'}
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current.click(); }}
          >
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="avatar-img" />
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="7" width="18" height="13" rx="2" fill="#1976d2"/>
                <circle cx="12" cy="13.5" r="3.5" fill="#bbdefb"/>
                <rect x="8" y="3" width="8" height="4" rx="1" fill="#1976d2"/>
                <rect x="10" y="5" width="4" height="2" rx="1" fill="#bbdefb"/>
              </svg>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{display:'none'}}
              onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = ev => setProfilePhoto(ev.target.result);
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
          <div className="student-name">
            {studentNames[studentId] || 'Unknown'}
          </div>
        </div>
        <div className="license-type">
            {licenseTypes[studentId] || 'Unknown'}
        </div>
      </div>
      {/* Main content area */}
      {tab === 'lessons' && (
        <ErrorBoundary>
          <LessonsTab currentStage={currentStage} onTaskRating={handleTaskRating} studentId={studentId} stages={stages} />
        </ErrorBoundary>
      )}
      {tab === 'stages' && (
        <ErrorBoundary>
          <StagesPanel stageStatus={stages} onTaskRating={handleTaskRating} />
        </ErrorBoundary>
      )}
      {tab === 'history' && (
        <ErrorBoundary>
          <HistoryPanel historyDays={groupHistoryByDay(history)} onDeleteHistory={handleDeleteHistory} />
        </ErrorBoundary>
      )}
      {tab === 'procedures' && (
        <ErrorBoundary>
          <ProceduresPanel />
        </ErrorBoundary>
      )}
      {tab === 'admin' && (
        <ErrorBoundary>
          <Admin />
        </ErrorBoundary>
      )}
      {/* Floating AI chat box */}
      <button
        className="ai-float-btn"
        aria-label="Open AI Assistant"
        onClick={()=>setShowAIModal(v=>!v)}
        style={{position:'fixed',bottom:'32px',right:'32px',zIndex:200,background:'#1976d2',color:'#fff',border:'none',borderRadius:'50%',width:'64px',height:'64px',boxShadow:'0 2px 12px rgba(25,118,210,0.18)',fontSize:'32px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}
      >
        <span style={{
          fontFamily:'cursive',
          fontSize:'18px',
          fontWeight:'bold',
          letterSpacing:'2px'
        }} aria-label="Copilot">CoPilot</span>
      </button>
        <button
          className="ai-float-btn"
          aria-label="Open AI Assistant"
          onClick={()=>setShowAIModal(v=>!v)}
          style={{position:'fixed',bottom:'32px',right:'32px',zIndex:200,background:'#1976d2',color:'#fff',border:'none',borderRadius:'50%',width:'64px',height:'64px',boxShadow:'0 2px 12px rgba(25,118,210,0.18)',fontSize:'32px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}
        >
          <span style={{
            fontFamily:'cursive',
            fontSize:'18px',
            fontWeight:'bold',
            letterSpacing:'2px',
            textAlign:'center'
          }} aria-label="CoPi">CoPi</span>
        </button>
      {showAIModal && (
        <div className="ai-chat-box">
          <ErrorBoundary>
            <AIAssistant />
          </ErrorBoundary>
          <button className="ai-chat-close" aria-label="Close AI Assistant" onClick={()=>setShowAIModal(false)}>&times;</button>
        </div>
      )}
      {/* Bottom tab navigation */}
      <div className="tabs tab-navigation" data-testid="tab-navigation" style={{position:'fixed',bottom:0,left:0,width:'88%',minWidth:'480px',display:'flex',justifyContent:'flex-start',alignItems:'center',padding:'12px 32px 12px 32px',background:'#e3f2fd',boxShadow:'0 -2px 12px rgba(25,118,210,0.08)',zIndex:100}}>
        <button className={`tab${tab==='lessons'?' active':''}`} data-testid="lessons-tab" style={{flex:1,margin:'0 8px',padding:'12px 0',fontSize:18,border:'none',background:'none',color:'#1976d2',fontWeight:'bold',borderBottom:tab==='lessons'?'3px solid #1976d2':'none',borderRadius:0,cursor:'pointer'}} onClick={()=>setTab('lessons')}>Lessons</button>
        <button className={`tab${tab==='stages'?' active':''}`} data-testid="stages-tab" style={{flex:1,margin:'0 8px',padding:'12px 0',fontSize:18,border:'none',background:'none',color:'#1976d2',fontWeight:'bold',borderBottom:tab==='stages'?'3px solid #1976d2':'none',borderRadius:0,cursor:'pointer'}} onClick={()=>setTab('stages')}>Stages</button>
        <button className={`tab${tab==='history'?' active':''}`} data-testid="history-tab" style={{flex:1,margin:'0 8px',padding:'12px 0',fontSize:18,border:'none',background:'none',color:'#1976d2',fontWeight:'bold',borderBottom:tab==='history'?'3px solid #1976d2':'none',borderRadius:0,cursor:'pointer'}} onClick={()=>setTab('history')}>History</button>
        <button className={`tab${tab==='procedures'?' active':''}`} data-testid="procedures-tab" style={{flex:1,margin:'0 8px',padding:'12px 0',fontSize:18,border:'none',background:'none',color:'#1976d2',fontWeight:'bold',borderBottom:tab==='procedures'?'3px solid #1976d2':'none',borderRadius:0,cursor:'pointer'}} onClick={()=>setTab('procedures')}>Procedures</button>
        <button className={`tab${tab==='admin'?' active':''}`} data-testid="admin-tab" style={{flex:1,margin:'0 8px',padding:'12px 0',fontSize:18,border:'none',background:'none',color:'#1976d2',fontWeight:'bold',borderBottom:tab==='admin'?'3px solid #1976d2':'none',borderRadius:0,cursor:'pointer'}} onClick={()=>setTab('admin')}>User</button>
      </div>
    </div>
  );
}
