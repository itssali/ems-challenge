import { useLoaderData, Form, redirect, Link, useSearchParams } from "react-router";
import { getDB } from "~/db/getDB";

export async function loader() {
  const db = await getDB();
  const employees = await db.all('SELECT id, full_name FROM employees ORDER BY full_name ASC');
  return { employees };
}

import type { ActionFunction } from "react-router";

type ActionData = {
  errors?: {
    employee_id?: string;
    start_time?: string;
    end_time?: string;
    summary?: string;
  };
};

const validateTimesheet = (formData: FormData) => {
  const errors: ActionData["errors"] = {};
  const start = new Date(formData.get("start_time") as string);
  const end = new Date(formData.get("end_time") as string);

  if (end <= start) {
    errors.end_time = "End time must be after start time";
  }

  const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  if (duration > 24) {
    errors.end_time = "Timesheet duration cannot exceed 24 hours";
  }

  return Object.keys(errors).length ? errors : null;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const errors = validateTimesheet(formData);

  if (errors) {
    return { errors };
  }

  const employee_id = formData.get("employee_id");
  const start_time = formData.get("start_time");
  const end_time = formData.get("end_time");
  const summary = formData.get("summary");

  const db = await getDB();
  await db.run(
    'INSERT INTO timesheets (employee_id, start_time, end_time, summary) VALUES (?, ?, ?, ?)',
    [employee_id, start_time, end_time, summary]
  );

  return redirect("/timesheets");
};

export default function NewTimesheetPage() {
  const { employees } = useLoaderData();
  const [searchParams] = useSearchParams();
  const preselectedEmployeeId = searchParams.get("employee");

  return (
    <div className="space-y-8 pt-8">
      <div className="card p-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-dark-text-primary">New Timesheet</h1>
            <p className="mt-2 text-sm text-dark-text-secondary">
              Record work hours for an employee
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              to="/timesheets"
              className="btn-secondary"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Cancel
            </Link>
          </div>
        </div>
      </div>

      <div className="card p-8">
        <Form method="post" className="space-y-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
            <div className="space-y-2.5">
              <label htmlFor="employee_id" className="block text-sm font-medium text-dark-text-secondary">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                name="employee_id"
                id="employee_id"
                required
                defaultValue={preselectedEmployeeId || ""}
                className="select"
              >
                <option value="">Select an employee</option>
                {employees.map((employee: any) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2.5">
              <label htmlFor="start_time" className="block text-sm font-medium text-dark-text-secondary">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="start_time"
                id="start_time"
                required
                className="input"
              />
            </div>

            <div className="space-y-2.5">
              <label htmlFor="end_time" className="block text-sm font-medium text-dark-text-secondary">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="end_time"
                id="end_time"
                required
                className="input"
              />
            </div>

            <div className="space-y-2.5 sm:col-span-2">
              <label htmlFor="summary" className="block text-sm font-medium text-dark-text-secondary">
                Summary
              </label>
              <textarea
                name="summary"
                id="summary"
                rows={4}
                className="input"
                placeholder="Describe the work done during this period..."
              />
            </div>
          </div>

          <div className="divider"></div>

          <div className="flex justify-end">
            <button type="submit" className="btn">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Create Timesheet
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
