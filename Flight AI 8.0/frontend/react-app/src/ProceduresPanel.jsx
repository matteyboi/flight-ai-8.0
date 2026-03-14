import React from 'react';

function ProceduresPanel() {
  const items = [
    'Weather Briefing (METAR, TAF, NOTAMs)',
    'Oil Level Inspection',
    'Use of Checklists (Preflight, Before Start, After Start)',
    'Engine Start Procedure (Priming, Mixture, Throttle, Starter)',
    'Oil Pressure & Temperature Monitoring',
    'Engine Warm-Up & RPM Check',
    'Run-Up (Magneto, Carb Heat, Propeller, Instruments)',
    'Avionics Setup & Use (COM, NAV, Transponder, Audio Panel)',
    'Use of Flight Instruments (Altimeter, Airspeed, Attitude, Heading, VSI)',
    'Use of Aircraft Lighting Systems (Nav, Beacon, Strobe, Landing, Taxi)',
    'Departure Briefing',
    'Use of Trim for Flight Control',
    'Use of Flaps for Takeoff',
    'ATIS/AWOS/ASOS Information Gathering',
    'Taxi Back Procedures',
    'Plotting Course & Checkpoints',
    'Use of Flight Log & Time Calculations',
    'DME Use (Distance Measuring Equipment)',
    'Lost Procedures (Circle, Climb, Communicate, Confess, Comply)',
    'Approach Briefing',
    'Emergency Communications (121.5 MHz, Mayday, Pan-Pan)',
    'Smoke in Cockpit',
    'ELT Activation (Emergency Locator Transmitter)',
    'Identifying Airports & Runways at Night',
    'Autopilot Operation (if equipped)'
  ];
  const credentials = [
    'FAA Medical Certificate',
    'TSA Endorsement',
    'IACRA Registration'
  ];
  const [checked, setChecked] = React.useState(Array(items.length).fill(false));
  const [credChecked, setCredChecked] = React.useState(Array(credentials.length + 3).fill(false));
  return (
    <div>
      <div className="card" style={{background:'#e3f2fd',borderRadius:'16px',padding:'32px',boxShadow:'0 2px 12px rgba(25,118,210,0.12)',marginBottom:'32px',display:'flex',gap:'32px',flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:'220px'}}>
          <h3 style={{color:'#1976d2',marginBottom:'24px'}}>Student Credentials Checklist</h3>
          <ul style={{listStyle:'none',padding:0}}>
            {credentials.map((item, idx) => (
              <li key={item} style={{marginBottom:'16px',display:'flex',alignItems:'center'}}>
                <input
                  type="checkbox"
                  checked={credChecked[idx]}
                  onChange={() => setCredChecked(c => c.map((v, i) => i === idx ? !v : v))}
                  style={{width:'24px',height:'24px',accentColor:'#1976d2',marginRight:'16px'}}
                />
                <span style={{flex:1,color:'#1976d2',fontSize:'17px'}}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div style={{flex:1,minWidth:'220px'}}>
          <h3 style={{color:'#1976d2',marginBottom:'24px'}}>Milestones Checklist</h3>
          <ul style={{listStyle:'none',padding:0}}>
            {['Solo', 'Solo Cross Country', 'Mock Checkride'].map((item, idx) => (
              <li key={item} style={{marginBottom:'16px',display:'flex',alignItems:'center'}}>
                <input
                  type="checkbox"
                  checked={credChecked[credentials.length + idx] || false}
                  onChange={() => setCredChecked(c => {
                    const arr = [...c];
                    arr[credentials.length + idx] = !arr[credentials.length + idx];
                    return arr;
                  })}
                  style={{width:'24px',height:'24px',accentColor:'#1976d2',marginRight:'16px'}}
                />
                <span style={{flex:1,color:'#1976d2',fontSize:'17px'}}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="card" style={{background:'#e3f2fd',borderRadius:'16px',padding:'32px',boxShadow:'0 2px 12px rgba(25,118,210,0.12)', marginBottom:'80px'}}>
        <h3 style={{color:'#1976d2',marginBottom:'24px'}}>Procedures Checklist</h3>
        <ul style={{listStyle:'none',padding:0}}>
          {items.map((item, idx) => (
            <li key={item} style={{marginBottom:'16px',display:'flex',alignItems:'center'}}>
              <input
                type="checkbox"
                checked={checked[idx]}
                onChange={() => setChecked(c => c.map((v, i) => i === idx ? !v : v))}
                style={{width:'24px',height:'24px',accentColor:'#1976d2',marginRight:'16px'}}
              />
              <span style={{flex:1,color:'#1976d2',fontSize:'17px'}}>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ProceduresPanel;
