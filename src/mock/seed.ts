import { db, resetDb } from './db'
import type {
  Announcement,
  DocumentRequest,
  DocumentType,
  Employee,
  Grade,
  Payment,
  Student,
  Ticket,
  User,
} from '@/types'

const SEED_KEY = 'abc-sss-seeded-v2'

const FIRST_NAMES = [
  'Ava', 'Liam', 'Sophia', 'Noah', 'Maya', 'Ethan', 'Isla', 'Mateo',
  'Zoe', 'Lucas', 'Mia', 'Aiden', 'Ella', 'Leo', 'Nora', 'Caleb',
  'Riley', 'Owen', 'Layla', 'Jude', 'Aria', 'Theo', 'Hazel', 'Asher',
]
const LAST_NAMES = [
  'Reyes', 'Cruz', 'Santos', 'Garcia', 'Mendoza', 'Lim', 'Tan', 'Aquino',
  'Bautista', 'del Rosario', 'Castillo', 'Ramos', 'Villanueva', 'Domingo',
  'Navarro', 'Pascual', 'Salazar', 'Ocampo', 'Flores', 'Gutierrez',
]

const PROGRAMS = ['BSIT', 'BSCS', 'BSBA', 'BSED', 'BSN']
const SECTIONS = ['A', 'B', 'C']
const SUBJECTS = [
  'Mathematics 1', 'English 1', 'Filipino 1', 'PE 1',
  'Programming 1', 'Data Structures', 'Networking', 'Database Systems',
]
const PROGRAM_TUITION: Record<string, number> = {
  BSIT: 28000,
  BSCS: 30000,
  BSBA: 26000,
  BSED: 24000,
  BSN: 32000,
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function id(prefix: string, n: number) {
  return `${prefix}-${n.toString().padStart(4, '0')}`
}

function isoDaysAgo(d: number) {
  return new Date(Date.now() - d * 86400000).toISOString()
}

function makeUsers(): User[] {
  const roles: User['role'][] = [
    'admin', 'registrar', 'accounting', 'teacher',
    'student', 'maintenance', 'marketing', 'hr',
  ]
  return roles.map((r, i) => ({
    id: `usr-${i + 1}`,
    name: `${r.charAt(0).toUpperCase() + r.slice(1)} Demo`,
    email: `${r}@abc.edu`,
    role: r,
    active: true,
    createdAt: isoDaysAgo(120 - i * 10),
  }))
}

function makeStudents(): Student[] {
  return Array.from({ length: 60 }, (_, i) => {
    const program = pick(PROGRAMS)
    const yearLevel = (i % 4) + 1
    const firstName = i === 0 ? 'Ava' : pick(FIRST_NAMES)
    const lastName = i === 0 ? 'Reyes' : pick(LAST_NAMES)
    return {
      id: id('std', i + 1),
      studentNumber: `2025-${(1000 + i).toString()}`,
      firstName,
      lastName,
      middleName: pick(LAST_NAMES),
      program,
      yearLevel,
      section: `${program}-${yearLevel}${pick(SECTIONS)}`,
      status: i < 55 ? 'enrolled' : i < 57 ? 'on-leave' : 'graduated',
      email: i === 0 ? 'student@abc.edu' : `student${i + 1}@abc.edu`,
      contact: `+63 9${Math.floor(100000000 + Math.random() * 899999999)}`,
      address: pick(['Naga City', 'Manila', 'Quezon City', 'Cebu', 'Davao']) + ', Philippines',
      guardianName: `${pick(FIRST_NAMES)} ${lastName}`,
      guardianContact: `+63 9${Math.floor(100000000 + Math.random() * 899999999)}`,
      enrolledAt: isoDaysAgo(180 - i),
      assessment: PROGRAM_TUITION[program] ?? 25000,
    }
  })
}

function makeEmployees(): Employee[] {
  const positions = [
    'Faculty', 'Registrar Officer', 'Accounting Officer', 'Maintenance Staff',
    'Marketing Officer', 'HR Officer', 'IT Staff', 'Guidance Counselor',
  ]
  const departments = ['Academics', 'Finance', 'Operations', 'Marketing', 'Human Resources']
  return Array.from({ length: 25 }, (_, i) => ({
    id: id('emp', i + 1),
    employeeNumber: `EMP-${(2000 + i).toString()}`,
    firstName: pick(FIRST_NAMES),
    lastName: pick(LAST_NAMES),
    position: pick(positions),
    department: pick(departments),
    email: `employee${i + 1}@abc.edu`,
    hiredAt: isoDaysAgo(365 + i * 30),
  }))
}

function makeAnnouncements(): Announcement[] {
  return [
    {
      id: 'ann-1',
      title: 'Welcome to AY 2026–2027',
      body: 'Classes officially begin Monday. Please check your schedules in the portal.',
      audiences: ['all'],
      createdBy: 'usr-1',
      createdAt: isoDaysAgo(2),
    },
    {
      id: 'ann-2',
      title: 'Faculty Meeting — Friday 3PM',
      body: 'All teaching staff please attend the academic alignment meeting at the AVR.',
      audiences: ['teacher', 'admin'],
      createdBy: 'usr-1',
      createdAt: isoDaysAgo(5),
    },
    {
      id: 'ann-3',
      title: 'Tuition Reminder',
      body: 'Second installment due May 31. Settle at the Cashier or via online channels.',
      audiences: ['student'],
      createdBy: 'usr-3',
      createdAt: isoDaysAgo(7),
    },
  ]
}

function makePayments(students: Student[]): Payment[] {
  return students.slice(0, 30).map((s, i) => ({
    id: id('pay', i + 1),
    studentId: s.id,
    amount: 5000 + (i % 5) * 1500,
    method: pick(['cash', 'bank', 'online']),
    orNumber: `OR-${(10000 + i).toString()}`,
    postedAt: isoDaysAgo(30 - (i % 30)),
    postedBy: 'usr-3',
  }))
}

function makeGrades(students: Student[]): Grade[] {
  const out: Grade[] = []
  let n = 1
  for (const s of students.slice(0, 20)) {
    for (const subj of SUBJECTS.slice(0, 4)) {
      out.push({
        id: id('grd', n++),
        studentId: s.id,
        subject: subj,
        term: 'Prelim',
        grade: 75 + Math.floor(Math.random() * 25),
        status: Math.random() > 0.3 ? 'locked' : 'pending',
        submittedBy: 'usr-4',
        submittedAt: isoDaysAgo(15),
      })
    }
  }
  return out
}

function makeTickets(): Ticket[] {
  const titles = [
    'Aircon not cooling — Room 301',
    'Leaking faucet — Faculty restroom',
    'Projector flicker — AVR',
    'Light bulb out — Hallway 2F',
    'Door knob loose — Library',
    'Wi-Fi slow — Computer Lab 1',
    'Window screen damaged — Room 205',
    'Repaint needed — Lobby wall',
  ]
  const cats: Ticket['category'][] = [
    'electrical', 'plumbing', 'it', 'electrical', 'carpentry',
    'it', 'carpentry', 'janitorial',
  ]
  const statuses: Ticket['status'][] = [
    'new', 'assigned', 'in-progress', 'done', 'verified',
    'in-progress', 'new', 'assigned',
  ]
  return titles.map((t, i) => ({
    id: id('tkt', i + 1),
    title: t,
    description: 'Reported by faculty / staff during routine inspection.',
    category: cats[i],
    status: statuses[i],
    createdBy: 'usr-6',
    createdAt: isoDaysAgo(10 - i),
  }))
}

function makeDocumentRequests(students: Student[]): DocumentRequest[] {
  const types: DocumentType[] = ['TOR', 'COE', 'Form 137', 'Good Moral']
  const purposes = [
    'For employment',
    'For board exam application',
    'For transfer',
    'For scholarship',
    'For internship',
    'Personal copy',
  ]
  const out: DocumentRequest[] = []
  const sample = students.slice(0, 10)
  sample.forEach((s, i) => {
    out.push({
      id: id('doc', i + 1),
      studentId: s.id,
      documentType: pick(types),
      purpose: pick(purposes),
      status: pick(['pending', 'pending', 'processing', 'ready', 'released']),
      createdAt: isoDaysAgo(7 - (i % 7)),
      updatedAt: isoDaysAgo(7 - (i % 7) - 1),
    })
  })
  return out
}

export async function ensureSeed() {
  if (localStorage.getItem(SEED_KEY) === '1') return
  const users = makeUsers()
  const students = makeStudents()
  const employees = makeEmployees()
  const announcements = makeAnnouncements()
  const payments = makePayments(students)
  const grades = makeGrades(students)
  const tickets = makeTickets()
  const documentRequests = makeDocumentRequests(students)

  await db.transaction(
    'rw',
    [
      db.users, db.students, db.employees, db.announcements,
      db.payments, db.grades, db.tickets, db.documentRequests,
    ],
    async () => {
      await db.users.bulkPut(users)
      await db.students.bulkPut(students)
      await db.employees.bulkPut(employees)
      await db.announcements.bulkPut(announcements)
      await db.payments.bulkPut(payments)
      await db.grades.bulkPut(grades)
      await db.tickets.bulkPut(tickets)
      await db.documentRequests.bulkPut(documentRequests)
    },
  )
  localStorage.setItem(SEED_KEY, '1')
}

export async function reseed() {
  await resetDb()
  localStorage.removeItem(SEED_KEY)
  await ensureSeed()
}
