// Student info and progress tracking model
export const studentInfo = {
  name: 'Mathew Bryant',
  license: 'Private Pilot',
  currentStage: 1, // 1-5, matches stages
  totalHours: 0, // To be updated as training progresses
};

export const progressMilestones = [
  { label: 'Zero Hours', value: 0 },
  { label: 'First Solo', value: 1 },
  { label: 'Solo Cross Country', value: 2 },
  { label: 'Checkride Ready', value: 3 },
];

// Checkride checklist items
export const checkrideChecklist = [
  'All lessons completed with mastery (score 5)',
  'Required solo flights logged',
  'Cross country flights completed',
  'Night flight requirements met',
  'Written test passed',
  'Endorsements received',
  'Required documents prepared',
];
