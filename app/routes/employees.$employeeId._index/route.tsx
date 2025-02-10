import { useLoaderData, Link, Form, redirect, useActionData } from "react-router";
import { getDB } from "~/db/getDB";
import { useState, useEffect } from "react";
import path from "path";
import { mkdir, writeFile } from "fs/promises";

export async function loader({ params }: { params: { employeeId: string } }) {
  const db = await getDB();
  const employee = await db.get("SELECT * FROM employees WHERE id = ?", params.employeeId);
  const timesheets = await db.all("SELECT * FROM timesheets WHERE employee_id = ? ORDER BY start_time DESC LIMIT 5", params.employeeId);
  
  if (!employee) {
    throw new Response("Not Found", { status: 404 });
  }
  
  return { employee, timesheets };
}

export async function action({ request, params }: { request: Request; params: { employeeId: string } }) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  const db = await getDB();

  if (intent === "delete") {
    await db.run("DELETE FROM employees WHERE id = ?", params.employeeId);
    return redirect("/employees");
  }

  if (intent === "update") {
    let age = 0;
    const updates = {
      full_name: formData.get("full_name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      date_of_birth: formData.get("date_of_birth"),
      job_title: formData.get("job_title"),
      department: formData.get("department"),
      salary: formData.get("salary"),
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date") || null
    };

    // Validate age (must be 18 or older)
    const birthDate = new Date(updates.date_of_birth as string);
    const today = new Date();
    age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      return { error: "Employee must be at least 18 years old" };
    }

    // Validate salary (minimum wage $30,000)
    const salary = Number(updates.salary);
    if (salary < 30000) {
      return { error: "Salary must be at least $30,000" };
    }

    await db.run(
      `UPDATE employees 
       SET full_name = ?, email = ?, phone = ?, date_of_birth = ?,
           job_title = ?, department = ?, salary = ?, start_date = ?, end_date = ?
       WHERE id = ?`,
      [...Object.values(updates), params.employeeId]
    );

    return { success: true };
  }

  if (intent === "upload") {
    const type = formData.get("type") as string;
    const file = formData.get("file") as File;
    
    if (!file || file.size === 0) {
      return { error: "No file uploaded" };
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", params.employeeId);
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const ext = file.name.split(".").pop();
    const uniqueFilename = `${type}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Generate public URL
    const publicPath = `/uploads/${params.employeeId}/${uniqueFilename}`;

    // Update database
    const field = type === "photo" ? "photo_path" : 
                  type === "cv" ? "cv_path" : 
                  "id_document_path";

    await db.run(
      `UPDATE employees SET ${field} = ? WHERE id = ?`,
      [publicPath, params.employeeId]
    );

    return redirect(`/employees/${params.employeeId}`);
  }

  if (intent === "remove_document") {
    const type = formData.get("type") as string;
    const field = type === "photo" ? "photo_path" : 
                  type === "cv" ? "cv_path" : 
                  "id_document_path";

    await db.run(
      `UPDATE employees SET ${field} = NULL WHERE id = ?`,
      [params.employeeId]
    );

    return redirect(`/employees/${params.employeeId}`);
  }

  return null;
}

function FileUploadForm({ type, children }: { type: string; children: React.ReactNode }) {
  const { employee } = useLoaderData();
  return (
    <Form 
      method="post" 
      encType="multipart/form-data"
      className="contents"
    >
      <input type="hidden" name="intent" value="upload" />
      <input type="hidden" name="type" value={type} />
      <label className="btn-secondary cursor-pointer flex items-center gap-2">
        {children}
        <input
          type="file"
          name="file"
          className="hidden"
          accept={type === 'photo' ? 'image/*' : type === 'cv' ? '.pdf,.doc,.docx' : '.pdf,.jpg,.jpeg,.png'}
          onChange={(e) => {
            if (e.target.files?.[0]) {
              e.target.form?.requestSubmit();
            }
          }}
        />
      </label>
    </Form>
  );
}

export default function EmployeePage() {
  const { employee, timesheets } = useLoaderData();
  const [isEditing, setIsEditing] = useState(false);
  const actionData = useActionData();

  useEffect(() => {
    if (actionData?.success) {
      setIsEditing(false);
      window.location.reload();
    }
  }, [actionData]);

  return (
    <div className="space-y-8 pt-8">
      <div className="card">
        <div className="sm:flex sm:items-center sm:justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16">
              {employee.photo_path ? (
                <img
                  src={employee.photo_path}
                  alt={employee.full_name}
                  className="h-16 w-16 rounded-full object-cover ring-4 ring-dark-surface-0"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-dark-surface-1 to-dark-surface-2 flex items-center justify-center ring-4 ring-dark-surface-0">
                  <span className="text-dark-text-primary font-medium text-xl">
                    {employee.full_name.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
              )}
            </div>
    <div>
              <h1 className="text-2xl font-semibold text-dark-text-primary">{employee.full_name}</h1>
              <p className="mt-1 text-sm text-dark-text-secondary">
                {employee.job_title} • {employee.department}
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            <Link to="/employees" className="btn-secondary">
              Back
            </Link>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="btn-secondary"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            <Form method="post" className="inline">
              <button
                type="submit"
                name="intent"
                value="delete"
                className="btn-danger"
                onClick={(e) => {
                  if (!confirm("Are you sure you want to delete this employee?")) {
                    e.preventDefault();
                  }
                }}
              >
                Delete
              </button>
            </Form>
          </div>
        </div>
      </div>

      {isEditing ? (
        <Form method="post" className="space-y-8">
          <input type="hidden" name="intent" value="update" />
          <div className="card p-8">
            <h2 className="text-lg font-medium text-dark-text-primary mb-6">Edit Employee Information</h2>
            {actionData?.error && (
              <div className="mb-6 p-4 bg-red-900/20 text-red-400 rounded-lg">
                {actionData.error}
              </div>
            )}
            {actionData?.success && (
              <div className="mb-6 p-4 bg-green-900/20 text-green-400 rounded-lg">
                Changes saved successfully!
              </div>
            )}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2.5">
                <label htmlFor="full_name" className="block text-sm font-medium text-dark-text-secondary">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  id="full_name"
                  required
                  defaultValue={employee.full_name}
                  className="input"
                />
              </div>

              <div className="space-y-2.5">
                <label htmlFor="email" className="block text-sm font-medium text-dark-text-secondary">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  defaultValue={employee.email}
                  className="input"
                />
              </div>

              <div className="space-y-2.5">
                <label htmlFor="phone" className="block text-sm font-medium text-dark-text-secondary">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  defaultValue={employee.phone}
                  className="input"
                />
              </div>

              <div className="space-y-2.5">
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-dark-text-secondary">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  id="date_of_birth"
                  defaultValue={employee.date_of_birth}
                  className="input"
                />
              </div>

              <div className="space-y-2.5">
                <label htmlFor="job_title" className="block text-sm font-medium text-dark-text-secondary">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="job_title"
                  id="job_title"
                  required
                  defaultValue={employee.job_title}
                  className="input"
                />
              </div>

              <div className="space-y-2.5">
                <label htmlFor="department" className="block text-sm font-medium text-dark-text-secondary">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  id="department"
                  required
                  defaultValue={employee.department}
                  className="select"
                >
                  <option value="">Select a department</option>
                  {["Engineering", "Product", "Design", "Marketing", "Sales", "HR", "Finance"].map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2.5">
                <label htmlFor="salary" className="block text-sm font-medium text-dark-text-secondary">
                  Salary (USD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="salary"
                  id="salary"
                  required
                  min="30000"
                  step="1000"
                  defaultValue={employee.salary}
                  className="input"
                />
              </div>

              <div className="space-y-2.5">
                <label htmlFor="start_date" className="block text-sm font-medium text-dark-text-secondary">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="start_date"
                  id="start_date"
                  required
                  defaultValue={employee.start_date}
                  className="input"
                />
              </div>

              <div className="space-y-2.5">
                <label htmlFor="end_date" className="block text-sm font-medium text-dark-text-secondary">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  id="end_date"
                  defaultValue={employee.end_date}
                  className="input"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn">
                Save Changes
              </button>
            </div>
          </div>
        </Form>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="card p-8">
            <h2 className="text-lg font-medium text-dark-text-primary mb-6">Personal Information</h2>
            <dl className="grid grid-cols-1 gap-4">
              <div className="rounded-lg bg-dark-surface-2/30 p-4">
                <dt className="text-sm font-medium text-dark-text-secondary">Email</dt>
                <dd className="mt-1 text-sm text-dark-text-primary">
                  <a href={`mailto:${employee.email}`} className="text-brand hover:text-brand-light">
                    {employee.email}
                  </a>
                </dd>
              </div>
              <div className="rounded-lg bg-dark-surface-2/30 p-4">
                <dt className="text-sm font-medium text-dark-text-secondary">Phone</dt>
                <dd className="mt-1 text-sm text-dark-text-primary">
                  {employee.phone ? (
                    <a href={`tel:${employee.phone}`} className="text-brand hover:text-brand-light">
                      {employee.phone}
                    </a>
                  ) : (
                    <span className="text-dark-text-secondary">Not provided</span>
                  )}
                </dd>
              </div>
              <div className="rounded-lg bg-dark-surface-2/30 p-4">
                <dt className="text-sm font-medium text-dark-text-secondary">Date of Birth</dt>
                <dd className="mt-1 text-sm text-dark-text-primary">
                  {employee.date_of_birth ? (
                    new Date(employee.date_of_birth).toLocaleDateString()
                  ) : (
                    <span className="text-dark-text-secondary">Not provided</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <div className="card p-8">
            <h2 className="text-lg font-medium text-dark-text-primary mb-6">Professional Information</h2>
            <dl className="grid grid-cols-1 gap-4">
              <div className="rounded-lg bg-dark-surface-2/30 p-4">
                <dt className="text-sm font-medium text-dark-text-secondary">Job Title</dt>
                <dd className="mt-1 text-sm text-dark-text-primary">{employee.job_title}</dd>
              </div>
              <div className="rounded-lg bg-dark-surface-2/30 p-4">
                <dt className="text-sm font-medium text-dark-text-secondary">Department</dt>
                <dd className="mt-1">
                  <span className="badge bg-brand/20 text-brand">
                    {employee.department}
                  </span>
                </dd>
              </div>
              <div className="rounded-lg bg-dark-surface-2/30 p-4">
                <dt className="text-sm font-medium text-dark-text-secondary">Salary</dt>
                <dd className="mt-1 text-sm text-dark-text-primary">
                  ${employee.salary.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </dd>
              </div>
              <div className="rounded-lg bg-dark-surface-2/30 p-4">
                <dt className="text-sm font-medium text-dark-text-secondary">Employment Period</dt>
                <dd className="mt-1 text-sm text-dark-text-primary">
                  {new Date(employee.start_date).toLocaleDateString()} - 
                  {employee.end_date ? (
                    new Date(employee.end_date).toLocaleDateString()
                  ) : (
                    <span className="badge badge-success ml-2">Active</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <div className="card p-8 lg:col-span-2">
            <div className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-dark-text-primary">Documents</h3>
                  <p className="mt-1 text-sm text-dark-text-secondary">
                    Manage employee documents and files
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {/* Photo Card */}
                <div className="rounded-xl border border-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-dark-text-primary">Photo</h4>
                    {employee.photo_path && (
                      <Form method="post" className="flex">
                        <input type="hidden" name="intent" value="remove_document" />
                        <input type="hidden" name="type" value="photo" />
                        <button
                          type="submit"
                          className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Remove photo"
                          onClick={(e) => {
                            if (!confirm('Are you sure you want to remove this photo?')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </Form>
                    )}
                  </div>
                  <div className="text-sm text-dark-text-secondary">
                    {employee.photo_path ? (
                      <span className="text-green-400">Photo uploaded</span>
                    ) : (
                      <span>No photo uploaded</span>
                    )}
                  </div>
                  <div className="pt-2">
                    <FileUploadForm type="photo">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Choose Photo
                    </FileUploadForm>
                  </div>
                </div>

                {/* CV Card */}
                <div className="rounded-xl border border-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-dark-text-primary">CV</h4>
                    {employee.cv_path && (
                      <Form method="post" className="flex">
                        <input type="hidden" name="intent" value="remove_document" />
                        <input type="hidden" name="type" value="cv" />
                        <button
                          type="submit"
                          className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Remove CV"
                          onClick={(e) => {
                            if (!confirm('Are you sure you want to remove this CV?')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </Form>
                    )}
                  </div>
                  <div className="text-sm text-dark-text-secondary">
                    {employee.cv_path ? (
                      <span className="text-green-400">CV uploaded</span>
                    ) : (
                      <span>No CV uploaded</span>
                    )}
                  </div>
                  <div className="pt-2">
                    <FileUploadForm type="cv">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Choose CV
                    </FileUploadForm>
                  </div>
                </div>

                {/* ID Document Card */}
                <div className="rounded-xl border border-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-dark-text-primary">ID Document</h4>
                    {employee.id_document_path && (
                      <Form method="post" className="flex">
                        <input type="hidden" name="intent" value="remove_document" />
                        <input type="hidden" name="type" value="id_doc" />
                        <button
                          type="submit"
                          className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Remove ID document"
                          onClick={(e) => {
                            if (!confirm('Are you sure you want to remove this ID document?')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </Form>
                    )}
                  </div>
                  <div className="text-sm text-dark-text-secondary">
                    {employee.id_document_path ? (
                      <span className="text-green-400">ID document uploaded</span>
                    ) : (
                      <span>No ID document uploaded</span>
                    )}
                  </div>
                  <div className="pt-2">
                    <FileUploadForm type="id_doc">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      Choose ID
                    </FileUploadForm>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-8 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-dark-text-primary">Recent Timesheets</h2>
              <Link to={`/timesheets/new?employee=${employee.id}`} className="btn">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Timesheet
              </Link>
            </div>
            
            {timesheets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/5">
                  <thead>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                        Start Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                        End Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                        Duration
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {timesheets.map((timesheet: any) => {
                      const start = new Date(timesheet.start_time);
                      const end = new Date(timesheet.end_time);
                      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                      
                      return (
                        <tr key={timesheet.id} className="hover:bg-dark-surface-2/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-primary">
                            {start.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">
                            {start.toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">
                            {end.toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">
                            {duration.toFixed(1)} hours
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link 
                              to={`/timesheets/${timesheet.id}`}
                              className="text-brand hover:text-brand-light"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-dark-text-primary">No timesheets</h3>
                <p className="mt-1 text-sm text-dark-text-secondary">Get started by creating a new timesheet.</p>
                <div className="mt-6">
                  <Link
                    to={`/timesheets/new?employee=${employee.id}`}
                    className="btn"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Timesheet
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
