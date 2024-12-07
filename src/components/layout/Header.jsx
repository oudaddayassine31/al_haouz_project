import React from 'react';

export const Header = () => {
  return (
    <header className="bg-white border-b z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-20 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg">
              <img src="/morocco.svg" alt="Logo" className="h-8 w-8" />
            </div>
            <div className="ml-3">
              <h1 className="text-2xl font-bold text-blue-600">Observatoire sismique Al Haouz</h1>
              <p className="text-sm text-gray-500">
                Plateforme de surveillance du séisme du 8 septembre 2023
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/oudaddayassine31/al_haouz_project" 
               target="_blank"
               rel="noopener noreferrer" 
               className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span>Code source</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};