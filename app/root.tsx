import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
  useLocation,
} from "react-router";
import { DarkModeProvider, useDarkMode } from "./contexts/DarkModeContext";
import { useMousePosition } from "./hooks/useMousePosition";
import { useEffect } from "react";
import '@schedule-x/theme-default/dist/index.css';
import "./app.css";

import type { Route } from "./+types/root";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  },
  {
    rel: "stylesheet",
    href: "/build/assets/app.css"
  },
  {
    rel: "stylesheet",
    href: "/build/assets/schedule-x.css"
  }
];

function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface-1 transition-colors"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  
  return (
    <Link 
      to={to}
      className={`nav-link ${isActive ? 'active' : ''}`}
    >
      {children}
    </Link>
  );
}

function Navigation() {
  return (
    <nav className="sticky top-4 z-50">
      <div className="max-w-3xl mx-auto">
        <div className="card backdrop-blur-md bg-dark-surface-1/70 p-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
              EMS
            </Link>
            <div className="flex items-center gap-2">
              <NavLink to="/employees">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Employees
              </NavLink>
              <NavLink to="/timesheets">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Timesheets
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function MouseGlow() {
  const mousePosition = useMousePosition();

  useEffect(() => {
    document.documentElement.style.setProperty('--mouse-x', `${mousePosition.x}px`);
    document.documentElement.style.setProperty('--mouse-y', `${mousePosition.y}px`);
  }, [mousePosition]);

  return null;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full p-4 md:p-8 dark:bg-dark-surface-0 dark:text-dark-text-primary transition-colors">
        <DarkModeProvider>
          <MouseGlow />
          {children}
        </DarkModeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <div className="min-h-full">
      <Navigation />
      <main>
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className="card p-8 dark:bg-dark-surface-1">
      <h1 className="text-4xl font-bold text-red-600 mb-4">{message}</h1>
      <p className="mb-4 text-gray-600 dark:text-dark-text-secondary">{details}</p>
      {stack && (
        <pre className="bg-gray-50 dark:bg-dark-surface-2 p-4 rounded-xl overflow-x-auto text-sm">
          <code>{stack}</code>
        </pre>
      )}
    </div>
  );
}
