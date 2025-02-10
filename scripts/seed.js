import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfigPath = path.join(__dirname, '../database.yaml');
const dbConfig = yaml.load(fs.readFileSync(dbConfigPath, 'utf8'));

const {
  'sqlite_path': sqlitePath,
} = dbConfig;

const db = new sqlite3.Database(sqlitePath);

const employees = [
  {
    full_name: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    date_of_birth: '1990-01-15',
    job_title: 'Senior Developer',
    department: 'Engineering',
    salary: 95000.00,
    start_date: '2020-03-01',
    end_date: null,
    photo_path: null,
    cv_path: null,
    id_document_path: null
  },
  {
    full_name: 'Jane Smith',
    email: 'jane.smith@company.com',
    phone: '+1 (555) 234-5678',
    date_of_birth: '1988-07-22',
    job_title: 'Product Manager',
    department: 'Product',
    salary: 105000.00,
    start_date: '2019-06-15',
    end_date: null,
    photo_path: null,
    cv_path: null,
    id_document_path: null
  },
  {
    full_name: 'Alice Johnson',
    email: 'alice.johnson@company.com',
    phone: '+1 (555) 345-6789',
    date_of_birth: '1992-11-30',
    job_title: 'UX Designer',
    department: 'Design',
    salary: 85000.00,
    start_date: '2021-01-10',
    end_date: null,
    photo_path: null,
    cv_path: null,
    id_document_path: null
  },
  {
    full_name: 'Michael Chen',
    email: 'michael.chen@company.com',
    phone: '+1 (555) 456-7890',
    date_of_birth: '1991-03-25',
    job_title: 'Software Engineer',
    department: 'Engineering',
    salary: 90000.00,
    start_date: '2021-05-15',
    end_date: null,
    photo_path: null,
    cv_path: null,
    id_document_path: null
  },
  {
    full_name: 'Sarah Wilson',
    email: 'sarah.wilson@company.com',
    phone: '+1 (555) 567-8901',
    date_of_birth: '1993-08-12',
    job_title: 'Marketing Manager',
    department: 'Marketing',
    salary: 88000.00,
    start_date: '2020-09-01',
    end_date: null,
    photo_path: null,
    cv_path: null,
    id_document_path: null
  },
  {
    full_name: 'David Brown',
    email: 'david.brown@company.com',
    phone: '+1 (555) 678-9012',
    date_of_birth: '1987-12-05',
    job_title: 'Sales Director',
    department: 'Sales',
    salary: 110000.00,
    start_date: '2019-03-20',
    end_date: null,
    photo_path: null,
    cv_path: null,
    id_document_path: null
  },
  {
    full_name: 'Emily Davis',
    email: 'emily.davis@company.com',
    phone: '+1 (555) 789-0123',
    date_of_birth: '1994-05-18',
    job_title: 'HR Specialist',
    department: 'HR',
    salary: 75000.00,
    start_date: '2022-01-15',
    end_date: null,
    photo_path: null,
    cv_path: null,
    id_document_path: null
  },
  {
    full_name: 'Robert Taylor',
    email: 'robert.taylor@company.com',
    phone: '+1 (555) 890-1234',
    date_of_birth: '1989-09-30',
    job_title: 'Financial Analyst',
    department: 'Finance',
    salary: 92000.00,
    start_date: '2020-11-01',
    end_date: null,
    photo_path: null,
    cv_path: null,
    id_document_path: null
  },
  {
    full_name: 'Lisa Martinez',
    email: 'lisa.martinez@company.com',
    phone: '+1 (555) 901-2345',
    date_of_birth: '1990-06-14',
    job_title: 'Frontend Developer',
    department: 'Engineering',
    salary: 88000.00,
    start_date: '2021-08-15',
    end_date: null,
    photo_path: null,
    cv_path: null,
    id_document_path: null
  },
  {
    full_name: 'Kevin Patel',
    email: 'kevin.patel@company.com',
    phone: '+1 (555) 012-3456',
    date_of_birth: '1993-02-28',
    job_title: 'Product Designer',
    department: 'Design',
    salary: 82000.00,
    start_date: '2022-03-01',
    end_date: null,
    photo_path: null,
    cv_path: null,
    id_document_path: null
  },
  {
    full_name: 'Rachel Kim',
    email: 'rachel.kim@company.com',
    phone: '+1 (555) 123-4567',
    date_of_birth: '1991-11-08',
    job_title: 'Backend Developer',
    department: 'Engineering',
    salary: 92000.00,
    start_date: '2021-02-15',
    end_date: null,
    photo_path: null,
    cv_path: null,
    id_document_path: null
  },
  {
    full_name: 'Thomas Anderson',
    email: 'thomas.anderson@company.com',
    phone: '+1 (555) 234-5678',
    date_of_birth: '1988-04-19',
    job_title: 'Sales Manager',
    department: 'Sales',
    salary: 98000.00,
    start_date: '2020-07-01',
    end_date: null,
    photo_path: null,
    cv_path: null,
    id_document_path: null
  },
  {
    full_name: 'Maria Garcia',
    email: 'maria.garcia@company.com',
    phone: '+1 (555) 345-6789',
    date_of_birth: '1992-09-23',
    job_title: 'Marketing Specialist',
    department: 'Marketing',
    salary: 78000.00,
    start_date: '2022-05-15',
    end_date: null,
    photo_path: null,
    cv_path: null,
    id_document_path: null
  },
  {
    full_name: 'James Wilson',
    email: 'james.wilson@company.com',
    phone: '+1 (555) 456-7890',
    date_of_birth: '1989-12-11',
    job_title: 'DevOps Engineer',
    department: 'Engineering',
    salary: 96000.00,
    start_date: '2020-10-01',
    end_date: null,
    photo_path: null,
    cv_path: null,
    id_document_path: null
  },
  {
    full_name: 'Sophie Lee',
    email: 'sophie.lee@company.com',
    phone: '+1 (555) 567-8901',
    date_of_birth: '1994-03-07',
    job_title: 'UI Designer',
    department: 'Design',
    salary: 80000.00,
    start_date: '2022-02-15',
    end_date: null,
    photo_path: null,
    cv_path: null,
    id_document_path: null
  }
];

const timesheets = [
  {
    employee_id: 1,
    start_time: '2025-02-10 08:00:00',
    end_time: '2025-02-10 17:00:00',
    summary: 'Implemented new feature for user authentication'
  },
  {
    employee_id: 1,
    start_time: '2025-02-11 09:00:00',
    end_time: '2025-02-11 18:00:00',
    summary: 'Code review and bug fixes'
  },
  {
    employee_id: 2,
    start_time: '2025-02-11 12:00:00',
    end_time: '2025-02-11 17:00:00',
    summary: 'Product roadmap planning and stakeholder meetings'
  },
  {
    employee_id: 2,
    start_time: '2025-02-12 09:00:00',
    end_time: '2025-02-12 18:00:00',
    summary: 'Sprint planning and team sync'
  },
  {
    employee_id: 3,
    start_time: '2025-02-12 07:00:00',
    end_time: '2025-02-12 16:00:00',
    summary: 'Redesigned main dashboard UI components'
  },
  {
    employee_id: 3,
    start_time: '2025-02-13 08:00:00',
    end_time: '2025-02-13 17:00:00',
    summary: 'User testing and design iterations'
  },
  {
    employee_id: 4,
    start_time: '2025-02-12 09:00:00',
    end_time: '2025-02-12 18:00:00',
    summary: 'Backend API development and testing'
  },
  {
    employee_id: 4,
    start_time: '2025-02-13 08:30:00',
    end_time: '2025-02-13 17:30:00',
    summary: 'Database optimization and performance tuning'
  },
  {
    employee_id: 5,
    start_time: '2025-02-12 10:00:00',
    end_time: '2025-02-12 19:00:00',
    summary: 'Marketing campaign strategy development'
  },
  {
    employee_id: 5,
    start_time: '2025-02-13 09:00:00',
    end_time: '2025-02-13 18:00:00',
    summary: 'Content creation and social media planning'
  },
  {
    employee_id: 6,
    start_time: '2025-02-13 08:30:00',
    end_time: '2025-02-13 17:30:00',
    summary: 'Sales team training and client meetings'
  },
  {
    employee_id: 6,
    start_time: '2025-02-14 09:00:00',
    end_time: '2025-02-14 18:00:00',
    summary: 'Lead generation and pipeline review'
  },
  {
    employee_id: 7,
    start_time: '2025-02-13 09:00:00',
    end_time: '2025-02-13 18:00:00',
    summary: 'Employee onboarding documentation update'
  },
  {
    employee_id: 7,
    start_time: '2025-02-14 08:30:00',
    end_time: '2025-02-14 17:30:00',
    summary: 'HR policy review and updates'
  },
  {
    employee_id: 8,
    start_time: '2025-02-13 08:00:00',
    end_time: '2025-02-13 16:00:00',
    summary: 'Financial report analysis and preparation'
  },
  {
    employee_id: 8,
    start_time: '2025-02-14 09:00:00',
    end_time: '2025-02-14 18:00:00',
    summary: 'Budget planning for Q2'
  },
  {
    employee_id: 9,
    start_time: '2025-02-14 09:30:00',
    end_time: '2025-02-14 18:30:00',
    summary: 'Frontend component development'
  },
  {
    employee_id: 9,
    start_time: '2025-02-15 08:00:00',
    end_time: '2025-02-15 17:00:00',
    summary: 'UI component library maintenance'
  },
  {
    employee_id: 10,
    start_time: '2025-02-14 10:00:00',
    end_time: '2025-02-14 19:00:00',
    summary: 'UI/UX research and wireframing'
  },
  {
    employee_id: 10,
    start_time: '2025-02-15 09:00:00',
    end_time: '2025-02-15 18:00:00',
    summary: 'Design system documentation'
  },
  {
    employee_id: 11,
    start_time: '2025-02-14 08:00:00',
    end_time: '2025-02-14 17:00:00',
    summary: 'Code review and pair programming'
  },
  {
    employee_id: 11,
    start_time: '2025-02-15 09:00:00',
    end_time: '2025-02-15 18:00:00',
    summary: 'API integration and testing'
  },
  {
    employee_id: 12,
    start_time: '2025-02-15 09:00:00',
    end_time: '2025-02-15 18:00:00',
    summary: 'Sales pipeline review and client outreach'
  },
  {
    employee_id: 12,
    start_time: '2025-02-16 08:30:00',
    end_time: '2025-02-16 17:30:00',
    summary: 'Client presentations and demos'
  },
  {
    employee_id: 13,
    start_time: '2025-02-15 08:30:00',
    end_time: '2025-02-15 17:30:00',
    summary: 'Marketing content creation and social media management'
  },
  {
    employee_id: 13,
    start_time: '2025-02-16 09:00:00',
    end_time: '2025-02-16 18:00:00',
    summary: 'Email campaign setup and analytics review'
  },
  {
    employee_id: 14,
    start_time: '2025-02-15 09:00:00',
    end_time: '2025-02-15 18:00:00',
    summary: 'Infrastructure optimization and deployment'
  },
  {
    employee_id: 14,
    start_time: '2025-02-16 08:00:00',
    end_time: '2025-02-16 17:00:00',
    summary: 'Security audit and updates'
  },
  {
    employee_id: 15,
    start_time: '2025-02-15 10:00:00',
    end_time: '2025-02-15 19:00:00',
    summary: 'Design system updates and documentation'
  },
  {
    employee_id: 15,
    start_time: '2025-02-16 09:30:00',
    end_time: '2025-02-16 18:30:00',
    summary: 'User interface prototyping'
  }
];

const insertData = (table, data) => {
  const columns = Object.keys(data[0]).join(', ');
  const placeholders = Object.keys(data[0]).map(() => '?').join(', ');

  const insertStmt = db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`);

  data.forEach(row => {
    insertStmt.run(Object.values(row));
  });

  insertStmt.finalize();
};

db.serialize(() => {
  insertData('employees', employees);
  insertData('timesheets', timesheets);
});

db.close(err => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Database seeded successfully.');
  }
});

