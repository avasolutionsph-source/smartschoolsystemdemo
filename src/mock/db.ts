import Dexie, { type Table } from 'dexie'
import type {
  Announcement,
  Employee,
  Grade,
  Payment,
  Student,
  Ticket,
  User,
} from '@/types'

export class AbcDB extends Dexie {
  users!: Table<User, string>
  students!: Table<Student, string>
  employees!: Table<Employee, string>
  announcements!: Table<Announcement, string>
  payments!: Table<Payment, string>
  grades!: Table<Grade, string>
  tickets!: Table<Ticket, string>

  constructor() {
    super('abc-sss')
    this.version(1).stores({
      users: 'id, role, email, active',
      students: 'id, studentNumber, status, program, yearLevel, section',
      employees: 'id, employeeNumber, department',
      announcements: 'id, createdAt',
      payments: 'id, studentId, postedAt',
      grades: 'id, studentId, term, status',
      tickets: 'id, status, category, createdAt',
    })
  }
}

export const db = new AbcDB()

export async function resetDb() {
  await Promise.all([
    db.users.clear(),
    db.students.clear(),
    db.employees.clear(),
    db.announcements.clear(),
    db.payments.clear(),
    db.grades.clear(),
    db.tickets.clear(),
  ])
  localStorage.removeItem('abc-sss-seeded')
}
