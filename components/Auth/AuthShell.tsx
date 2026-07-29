import React from 'react';

interface AuthShellProps {
  children: React.ReactNode;
  centered?: boolean;
}

export default function AuthShell({ children, centered = false }: AuthShellProps) {
  return (
    <div className={`min-h-screen overflow-y-auto bg-slate-100 px-4 py-6 sm:px-6 sm:py-10 ${centered ? 'sm:flex sm:items-center sm:justify-center' : ''}`}>
      <main className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}

export function AuthLogo() {
  return (
    <a href="https://app.snabbb.com/" className="mb-5 block w-fit transition-opacity hover:opacity-80" title="Go to Snabbb Home">
      <img src="/Snabbb (Teal).png" alt="Snabbb" className="h-7 w-auto object-contain" />
    </a>
  );
}

