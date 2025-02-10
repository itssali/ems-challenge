import { useLoaderData, Link } from "react-router"
import { useState, useEffect } from "react"
import { getDB } from "~/db/getDB"

export async function loader() {
  const db = await getDB()
  const employees = await db.all("SELECT * FROM employees ORDER BY id DESC;")
  return { employees }
}

export default function EmployeesPage() {
  const { employees } = useLoaderData()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<string>("id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredEmployees = employees.filter((employee: any) =>
    Object.values(employee).some(
      value => 
        value && 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const sortedEmployees = [...filteredEmployees].sort((a: any, b: any) => {
    if (a[sortField] === null) return 1;
    if (b[sortField] === null) return -1;
    
    if (sortField === 'id') {
      return sortDirection === "asc" 
        ? Number(a[sortField]) - Number(b[sortField])
        : Number(b[sortField]) - Number(a[sortField]);
    }
    
    const comparison = a[sortField].toString().localeCompare(b[sortField].toString());
    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(sortedEmployees.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = sortedEmployees.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  }

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const SortHeader = ({ field, children }: { field: string, children: React.ReactNode }) => (
    <th
      scope="col"
      className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer hover:text-brand transition-colors group"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        <span className={`transition-opacity ${sortField === field ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
          {sortDirection === "asc" ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </span>
      </div>
    </th>
  )

  return (
    <div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-dark-text-primary">Employees</h1>
            <p className="mt-1 text-sm text-dark-text-secondary">
              Manage your organization's workforce
            </p>
          </div>
          <Link to="/employees/new" className="btn">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </Link>
        </div>
        
        <div className="card">
          <div className="p-3 border-b border-white/5">
            <div className="relative">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-12"
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
          
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <SortHeader field="id">ID</SortHeader>
                <SortHeader field="full_name">Full Name</SortHeader>
                <SortHeader field="email">Email</SortHeader>
                <SortHeader field="job_title">Job Title</SortHeader>
                <SortHeader field="department">Department</SortHeader>
                <SortHeader field="start_date">Start Date</SortHeader>
                <th scope="col" className="px-4 py-3 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedEmployees.map((employee: any) => (
                <tr key={employee.id}>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center h-8 w-8 text-sm font-medium text-dark-text-primary">
                      {employee.id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex-shrink-0">
                        {employee.photo_path ? (
                          <img
                            className="h-8 w-8 rounded-full object-cover"
                            src={employee.photo_path}
                            alt=""
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full flex items-center justify-center">
                            <span className="text-dark-text-primary font-medium text-sm">
                              {employee.full_name.split(' ').map((n: string) => n[0]).join('')}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-dark-text-primary">{employee.full_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-dark-text-secondary">
                    {employee.email}
                  </td>
                  <td className="px-4 py-3 text-dark-text-secondary">
                    {employee.job_title}
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge bg-brand/20 text-brand">
                      {employee.department}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-dark-text-secondary">
                    {new Date(employee.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link 
                      to={`/employees/${employee.id}`} 
                      className="text-brand hover:text-brand-light font-medium transition-colors"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-dark-text-secondary">
              Showing <span className="font-medium text-dark-text-primary">{startIndex + 1}</span> to{" "}
              <span className="font-medium text-dark-text-primary">
                {Math.min(startIndex + itemsPerPage, sortedEmployees.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-dark-text-primary">{sortedEmployees.length}</span> employees
            </div>
            <nav className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    className={`min-w-[2.5rem] h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-brand text-white"
                        : "text-dark-text-primary hover:bg-dark-surface-2"
                    }`}
                    title={`Page ${page}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}
