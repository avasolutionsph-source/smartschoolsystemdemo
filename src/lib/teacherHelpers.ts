export interface TeacherClass {
  id: string
  subject: string
  section: string
  days: string
  time: string
  room: string
}

// Demo teacher's class load. Roster is derived from students whose
// section field matches `section` here (best-effort across the random seed).
export const TEACHER_CLASSES: TeacherClass[] = [
  {
    id: 'cls-bsit-prog1',
    subject: 'Programming 1',
    section: 'BSIT-1A',
    days: 'Mon · Wed · Fri',
    time: '08:00 – 09:30',
    room: 'Lab 1',
  },
  {
    id: 'cls-bsit-data',
    subject: 'Data Structures',
    section: 'BSIT-2A',
    days: 'Tue · Thu',
    time: '10:00 – 11:30',
    room: 'Lab 2',
  },
  {
    id: 'cls-bsit-web',
    subject: 'Web Development',
    section: 'BSIT-3A',
    days: 'Mon · Wed',
    time: '13:00 – 14:30',
    room: 'Lab 1',
  },
  {
    id: 'cls-bscs-algo',
    subject: 'Algorithms',
    section: 'BSCS-2A',
    days: 'Tue · Thu',
    time: '14:30 – 16:00',
    room: 'Room 305',
  },
]

export const TERMS = ['Prelim', 'Midterm', 'Pre-Final', 'Final']

export function gradeRemark(g: number): { label: string; tone: 'good' | 'pass' | 'fail' } {
  if (g >= 90) return { label: 'Excellent', tone: 'good' }
  if (g >= 75) return { label: 'Passing', tone: 'pass' }
  return { label: 'Failed', tone: 'fail' }
}

export function todayStr() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}
