import React from 'react';

export default function InterviewPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col justify-between p-6 sm:p-12 selection:bg-zinc-800 selection:text-zinc-100">
      
      {/* Top Section: Brand/Logo */}
      <header className="w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-widest uppercase text-zinc-400">
            Career Guide AI
          </span>
        </div>
      </header>

      {/* Middle Section: Main Content */}
      <main className="w-full max-w-md mx-auto flex flex-col justify-center space-y-6 my-auto">
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-b from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
            Coming Soon...
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-light">
            An intelligent mentor designed to help you navigate the job market, optimize your resume, and bridge your skill gaps. 
          </p>
        </div>

      </main>

      {/* Bottom Section: Footer */}
      <footer className="w-full max-w-4xl mx-auto text-center sm:text-left text-[11px] tracking-wider uppercase text-zinc-600">
        &copy; {new Date().getFullYear()} Career Guide AI. Built for the future.
      </footer>
      
    </div>
  );
}