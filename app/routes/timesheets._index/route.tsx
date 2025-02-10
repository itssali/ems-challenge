import { useLoaderData, Link } from "react-router";
import { useState } from "react";
import { getDB } from "~/db/getDB";
import { ScheduleXCalendar } from '@schedule-x/react';
import { createCalendar, createViewMonthGrid, createViewWeek, createViewDay } from '@schedule-x/calendar';
import '@schedule-x/theme-default/dist/index.css';

export async function loader() {
  const db = await getDB();
  const timesheetsAndEmployees = await db.all(
    `SELECT 
      timesheets.*, 
      employees.full_name, 
      employees.id AS employee_id,
      employees.department
    FROM timesheets 
    JOIN employees ON timesheets.employee_id = employees.id
    ORDER BY timesheets.start_time DESC`
  );

  return { timesheetsAndEmployees };
}

export default function TimesheetsPage() {
  const { timesheetsAndEmployees } = useLoaderData();
  const [view, setView] = useState('calendar');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const departments = Array.from(new Set(timesheetsAndEmployees.map((t: any) => t.department)));
  const employees = Array.from(new Set(timesheetsAndEmployees.map((t: any) => ({ 
    id: t.employee_id, 
    name: t.full_name 
  }))));

  const filteredTimesheets = timesheetsAndEmployees.filter((timesheet: any) => {
    const matchesDepartment = selectedDepartment === 'all' || timesheet.department === selectedDepartment;
    const matchesEmployee = selectedEmployee === 'all' || timesheet.employee_id.toString() === selectedEmployee;
    const matchesSearch = searchTerm === '' || 
      Object.values(timesheet).some(
        value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesDepartment && matchesEmployee && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTimesheets.length / itemsPerPage);
  const paginatedTimesheets = filteredTimesheets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  function getColorForDepartment(department: string) {
    const colors: { [key: string]: string } = {
      'Engineering': '#4f46e5',
      'Product': '#0891b2',
      'Design': '#7c3aed',
      'Marketing': '#059669',
      'Sales': '#dc2626',
      'HR': '#ea580c',
      'Finance': '#0284c7'
    };
    return colors[department] || '#6b7280';
  }

  // Convert timesheets to Schedule-X events format
  const calendarEvents = filteredTimesheets.map((timesheet: any) => {
    const start = new Date(timesheet.start_time);
    const end = new Date(timesheet.end_time);
    
    // Format dates as YYYY-MM-DD HH:mm
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    return {
      id: timesheet.id.toString(),
      title: `${timesheet.full_name} - ${timesheet.department}`,
      start: formatDate(start),
      end: formatDate(end),
      color: getColorForDepartment(timesheet.department),
      allDay: false,
      description: timesheet.summary || 'No summary provided',
      onClick: () => window.location.href = `/timesheets/${timesheet.id}`
    };
  });

  // Calendar configuration
  const calendarApp = createCalendar({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid()],
    events: calendarEvents,
    defaultView: 'week',
    weekOptions: {
      gridHeight: 800,
      eventWidth: 95
    },
    translations: {
      day: 'Day',
      week: 'Week',
      month: 'Month',
      today: 'Today'
    },
    theme: {
      colorScheme: 'dark',
      primaryColor: '#4f46e5',
      calendar: {
        headerHeight: '2rem',
        dayHeader: {
          height: '1.5rem'
        },
        timeGrid: {
          hourHeight: '1rem'
        }
      },
      dark: {
        backgroundColor: '#1a1b1e',
        primaryColor: '#4f46e5',
        gray100: '#2c2e33',
        gray200: '#3d4046',
        gray300: '#4b5563',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textColor: '#e5e7eb'
      }
    },
    callbacks: {
      onEventClick: (event) => {
        window.location.href = `/timesheets/${event.id}`;
      }
    }
  });

  return (
    <div className="space-y-8 pt-8">
      <div className="card p-8 bg-dark-surface-1">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-dark-text-primary">Timesheets</h1>
            <p className="mt-2 text-sm text-dark-text-secondary">
              Track and manage employee work hours
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              to="/timesheets/new"
              className="btn"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Timesheet
            </Link>
          </div>
        </div>
      </div>

      <div className="card bg-dark-surface-1">
        <div className="p-8 border-b border-white/5">
          <div className="flex flex-col gap-6">
            {/* Search and View Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('table')}
                  className={`btn-secondary ${view === 'table' ? 'active' : ''}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Table View
                </button>
                <button
                  onClick={() => setView('calendar')}
                  className={`btn-secondary ${view === 'calendar' ? 'active' : ''}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Calendar View
                </button>
              </div>

              <div className="w-full sm:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search timesheets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-12 w-full sm:w-80"
                  />
                  <svg 
                    className="w-5 h-5 text-dark-text-secondary absolute left-4 top-1/2 -translate-y-1/2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="department" className="text-sm font-medium text-dark-text-secondary">
                  Department
                </label>
                <select
                  id="department"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="select max-w-xs"
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept: string) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="employee" className="text-sm font-medium text-dark-text-secondary">
                  Employee
                </label>
                <select
                  id="employee"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="select max-w-xs"
                >
                  <option value="all">All Employees</option>
                  {employees.map((emp: any) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {view === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-white/5">
              <thead className="table-header">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-dark-text-secondary uppercase tracking-wider">
                    Employee
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-dark-text-secondary uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-dark-text-secondary uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-dark-text-secondary uppercase tracking-wider">
                    Start Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-dark-text-secondary uppercase tracking-wider">
                    End Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-dark-text-secondary uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {paginatedTimesheets.map((timesheet: any) => {
                  const start = new Date(timesheet.start_time);
                  const end = new Date(timesheet.end_time);
                  const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                  
                  return (
                    <tr key={timesheet.id} className="table-row">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-surface-1 dark:to-dark-surface-2 flex items-center justify-center">
                              <span className="text-gray-600 dark:text-dark-text-primary font-medium text-sm">
                                {timesheet.full_name.split(' ').map((n: string) => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                              {timesheet.full_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className="badge"
                          style={{ 
                            backgroundColor: `${getColorForDepartment(timesheet.department)}20`,
                            color: getColorForDepartment(timesheet.department)
                          }}
                        >
                          {timesheet.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text-primary">
                        {start.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-dark-text-secondary">
                        {start.toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-dark-text-secondary">
                        {end.toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-dark-text-secondary">
                        {duration.toFixed(1)} hours
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/timesheets/${timesheet.id}`}
                          className="text-brand hover:text-brand-light"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-sm text-dark-text-secondary">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredTimesheets.length)} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredTimesheets.length)} of{' '}
                  {filteredTimesheets.length} entries
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`btn-secondary px-4 py-2 ${
                        currentPage === page ? 'active' : ''
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="sx-calendar-wrapper">
            <ScheduleXCalendar calendarApp={calendarApp} />
          </div>
        )}
      </div>
    </div>
  );
}
