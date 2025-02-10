import { useLoaderData, Link, Form, redirect } from "react-router";
import { getDB } from "~/db/getDB";

export async function loader({ params }: { params: { timesheetId: string } }) {
  const db = await getDB();
  const timesheet = await db.get(
    `SELECT timesheets.*, employees.full_name, employees.id AS employee_id 
     FROM timesheets 
     JOIN employees ON timesheets.employee_id = employees.id 
     WHERE timesheets.id = ?`,
    params.timesheetId
  );
  
  if (!timesheet) {
    throw new Response("Not Found", { status: 404 });
  }
  
  return { timesheet };
}

export async function action({ request, params }: { request: Request; params: { timesheetId: string } }) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const db = await getDB();
    await db.run("DELETE FROM timesheets WHERE id = ?", params.timesheetId);
    return redirect("/timesheets");
  }

  return null;
}

export default function TimesheetPage() {
  const { timesheet } = useLoaderData();
  const start = new Date(timesheet.start_time);
  const end = new Date(timesheet.end_time);
  const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

  return (
    <div className="space-y-8 pt-8">
      <div className="card p-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-surface-1 dark:to-dark-surface-2 flex items-center justify-center ring-4 ring-white dark:ring-dark-surface-0">
                  <span className="text-gray-600 dark:text-dark-text-primary font-medium text-xl">
                    {timesheet.full_name.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-text-primary">Timesheet Details</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-dark-text-secondary">
                  {timesheet.full_name} • {start.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-4">
            <Link to="/timesheets" className="btn-secondary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to List
            </Link>
            <Form method="post" className="inline">
              <button
                type="submit"
                name="intent"
                value="delete"
                className="btn-danger"
                onClick={(e) => {
                  if (!confirm("Are you sure you want to delete this timesheet?")) {
                    e.preventDefault();
                  }
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Timesheet
              </button>
            </Form>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="card p-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-6">Time Information</h2>
          <dl className="grid grid-cols-1 gap-4">
            <div className="rounded-xl bg-gray-50/50 p-4">
              <dt className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Start Time</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-dark-text-primary">
                {start.toLocaleString()}
              </dd>
            </div>
            <div className="rounded-xl bg-gray-50/50 p-4">
              <dt className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">End Time</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-dark-text-primary">
                {end.toLocaleString()}
              </dd>
            </div>
            <div className="rounded-xl bg-gray-50/50 p-4">
              <dt className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Duration</dt>
              <dd className="mt-1">
                <span className="badge bg-brand/10 text-brand dark:bg-brand/20">
                  {duration.toFixed(1)} hours
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="card p-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-6">Employee Information</h2>
          <dl className="grid grid-cols-1 gap-4">
            <div className="rounded-xl bg-gray-50/50 p-4">
              <dt className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Employee Name</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-dark-text-primary">
                <Link 
                  to={`/employees/${timesheet.employee_id}`}
                  className="text-brand hover:text-brand-light"
                >
                  {timesheet.full_name}
                </Link>
              </dd>
            </div>
            {timesheet.summary && (
              <div className="rounded-xl bg-gray-50/50 p-4">
                <dt className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Work Summary</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-dark-text-primary whitespace-pre-wrap">
                  {timesheet.summary}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
