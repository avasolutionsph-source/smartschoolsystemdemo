import type { ScheduleEntry, Student } from '@/types'

const DEMO_STUDENT_ID = 'std-0001'

export function currentStudentId() {
  return DEMO_STUDENT_ID
}

const TEACHERS = [
  'Prof. Domingo', 'Prof. Reyes', 'Prof. Lim', 'Prof. Salazar',
  'Prof. Cruz', 'Prof. Castillo', 'Prof. Aquino', 'Prof. Tan',
]

const ROOMS = ['Room 201', 'Room 305', 'Lab 1', 'Lab 2', 'AVR', 'Room 102']

const PROGRAM_SUBJECTS: Record<string, string[]> = {
  BSIT: ['Programming 1', 'Data Structures', 'Networking', 'Database Systems', 'Web Dev', 'Math 1'],
  BSCS: ['Discrete Math', 'Algorithms', 'Operating Systems', 'AI Fundamentals', 'Compilers', 'Math 2'],
  BSBA: ['Accounting 1', 'Marketing Principles', 'Microeconomics', 'Business Ethics', 'Statistics', 'Management 1'],
  BSED: ['Educational Psychology', 'Curriculum Dev', 'Filipino 1', 'English 1', 'Mathematics Ed', 'Social Studies'],
  BSN: ['Anatomy', 'Microbiology', 'Pharmacology', 'Nursing Foundations', 'Biochem', 'Health Assessment'],
}

const DAYS: ScheduleEntry['day'][] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const SLOTS: Array<{ start: string; end: string }> = [
  { start: '08:00', end: '09:30' },
  { start: '09:45', end: '11:15' },
  { start: '13:00', end: '14:30' },
  { start: '14:45', end: '16:15' },
]

export function buildSchedule(student: Student | undefined): ScheduleEntry[] {
  if (!student) return []
  const subjects = PROGRAM_SUBJECTS[student.program] ?? PROGRAM_SUBJECTS.BSIT
  const out: ScheduleEntry[] = []
  for (let i = 0; i < subjects.length; i++) {
    const day = DAYS[i % DAYS.length]
    const slot = SLOTS[Math.floor(i / DAYS.length) % SLOTS.length]
    out.push({
      day,
      startTime: slot.start,
      endTime: slot.end,
      subject: subjects[i],
      room: ROOMS[i % ROOMS.length],
      teacher: TEACHERS[i % TEACHERS.length],
    })
  }
  return out
}
