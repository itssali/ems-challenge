import { Form, redirect, type ActionFunction, Link, useActionData } from "react-router";
import { getDB } from "~/db/getDB";
import path from "path";
import fs from "fs/promises";

type ActionData = {
  errors?: {
    full_name?: string;
    email?: string;
    phone?: string;
    date_of_birth?: string;
    job_title?: string;
    department?: string;
    salary?: string;
    start_date?: string;
  };
};

const validateEmployee = (formData: FormData) => {
  const errors: ActionData["errors"] = {};
  const email = formData.get("email")?.toString();
  const date_of_birth = formData.get("date_of_birth")?.toString();
  const salary = formData.get("salary")?.toString();
  const phone = formData.get("phone")?.toString();

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Invalid email address";
  }

  if (date_of_birth) {
    const birthDate = new Date(date_of_birth);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 18) {
      errors.date_of_birth = "Employee must be at least 18 years old";
    }
  }

  if (salary && parseFloat(salary) < 30000) {
    errors.salary = "Salary must be at least $30,000";
  }

  if (phone && !/^\+?[\d\s-()]+$/.test(phone)) {
    errors.phone = "Invalid phone number format";
  }

  return Object.keys(errors).length ? errors : null;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const errors = validateEmployee(formData);

  if (errors) {
    return { errors };
  }

  const db = await getDB();
  const employeeData = Object.fromEntries(formData);

  // Handle file uploads
  const photo = formData.get('photo') as File;
  const cv = formData.get('cv') as File;
  const id_doc = formData.get('id_doc') as File;

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });

  // Process and store files
  const fileUploads: any = {};

  async function handleFileUpload(file: File, prefix: string) {
    if (file.size > 0) {
      const uniqueFilename = `${prefix}-${Date.now()}-${file.name}`;
      const filePath = path.join(uploadsDir, uniqueFilename);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      return `/uploads/${uniqueFilename}`;
    }
    return null;
  }

  if (photo.size > 0) {
    fileUploads.photo_path = await handleFileUpload(photo, 'photo');
  }

  if (cv.size > 0) {
    fileUploads.cv_path = await handleFileUpload(cv, 'cv');
  }

  if (id_doc.size > 0) {
    fileUploads.id_document_path = await handleFileUpload(id_doc, 'id');
  }

  // Add file paths to employee data
  const employee = {
    ...employeeData,
    ...fileUploads
  };

  // Validate employee age
  const birthDate = new Date(employee.date_of_birth);
  const age = calculateAge(birthDate);
  if (age < 18) {
    return { error: "Employee must be at least 18 years old" };
  }

  // Insert into database
  await db.run(
    `INSERT INTO employees (
      full_name, email, phone, date_of_birth, 
      department, job_title, salary, start_date,
      photo_path, cv_path, id_document_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      employee.full_name,
      employee.email,
      employee.phone,
      employee.date_of_birth,
      employee.department,
      employee.job_title,
      employee.salary,
      employee.start_date,
      employee.photo_path || null,
      employee.cv_path || null,
      employee.id_document_path || null
    ]
  );

  return redirect("/employees");
};

// Helper function to calculate age
function calculateAge(birthDate: Date) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

const departments = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "HR",
  "Finance",
];

export default function NewEmployeePage() {
  const actionData = useActionData() as ActionData;

  return (
    <div className="space-y-8 pt-8">
      <div className="card p-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-text-primary">New Employee</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-dark-text-secondary">
              Add a new employee to the system
            </p>
          </div>
        </div>
      </div>

      <div className="card p-8">
        <Form method="post" encType="multipart/form-data" className="space-y-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
            <div className="space-y-2.5">
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                id="full_name"
                required
                className="input"
                placeholder="John Doe"
              />
              {actionData?.errors?.full_name && (
                <p className="text-sm text-red-600">{actionData.errors.full_name}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="input"
                placeholder="john.doe@company.com"
              />
              {actionData?.errors?.email && (
                <p className="text-sm text-red-600">{actionData.errors.email}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                className="input"
                placeholder="+1 (555) 123-4567"
              />
              {actionData?.errors?.phone && (
                <p className="text-sm text-red-600">{actionData.errors.phone}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                type="date"
                name="date_of_birth"
                id="date_of_birth"
                className="input"
              />
              {actionData?.errors?.date_of_birth && (
                <p className="text-sm text-red-600">{actionData.errors.date_of_birth}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <label htmlFor="job_title" className="block text-sm font-medium text-gray-700">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="job_title"
                id="job_title"
                required
                className="input"
                placeholder="Senior Developer"
              />
              {actionData?.errors?.job_title && (
                <p className="text-sm text-red-600">{actionData.errors.job_title}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                id="department"
                required
                className="select"
              >
                <option value="">Select a department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {actionData?.errors?.department && (
                <p className="text-sm text-red-600">{actionData.errors.department}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
                Annual Salary (USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  name="salary"
                  id="salary"
                  required
                  min="30000"
                  step="1000"
                  className="input pl-8"
                  placeholder="75000"
                />
              </div>
              {actionData?.errors?.salary && (
                <p className="text-sm text-red-600">{actionData.errors.salary}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                id="start_date"
                required
                className="input"
              />
              {actionData?.errors?.start_date && (
                <p className="text-sm text-red-600">{actionData.errors.start_date}</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
              Documents
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="photo" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                  Photo
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <label className="btn-secondary cursor-pointer">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Choose Photo
                    <input
                      type="file"
                      name="photo"
                      id="photo"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const fileName = e.target.files?.[0]?.name;
                        if (fileName) {
                          const span = e.target.parentElement?.nextElementSibling;
                          if (span) {
                            span.textContent = fileName;
                            span.classList.add('text-green-400');
                          }
                        }
                      }}
                    />
                  </label>
                  <span className="text-sm text-dark-text-secondary file-name"></span>
                </div>
              </div>

              <div>
                <label htmlFor="cv" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                  CV
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <label className="btn-secondary cursor-pointer">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Choose CV
                    <input
                      type="file"
                      name="cv"
                      id="cv"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const fileName = e.target.files?.[0]?.name;
                        if (fileName) {
                          const span = e.target.parentElement?.nextElementSibling;
                          if (span) {
                            span.textContent = fileName;
                            span.classList.add('text-green-400');
                          }
                        }
                      }}
                    />
                  </label>
                  <span className="text-sm text-dark-text-secondary file-name"></span>
                </div>
              </div>

              <div>
                <label htmlFor="id_doc" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                  ID Document
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <label className="btn-secondary cursor-pointer">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    Choose ID
                    <input
                      type="file"
                      name="id_doc"
                      id="id_doc"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const fileName = e.target.files?.[0]?.name;
                        if (fileName) {
                          const span = e.target.parentElement?.nextElementSibling;
                          if (span) {
                            span.textContent = fileName;
                            span.classList.add('text-green-400');
                          }
                        }
                      }}
                    />
                  </label>
                  <span className="text-sm text-dark-text-secondary file-name flex items-center gap-2"></span>
                </div>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          <div className="flex justify-end gap-4">
            <Link to="/employees" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn">
              Create Employee
            </button>
          </div>
      </Form>
      </div>
    </div>
  );
}
