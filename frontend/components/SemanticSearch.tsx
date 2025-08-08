"use client";

import { useState } from 'react';
import { searchSemantic, Product } from '@/lib/api';

type SemanticSearchProps = {
  onResults: (results: Product[]) => void;
  onLoading: (isLoading: boolean) => void;
};

export default function SemanticSearch({ onResults, onLoading }: SemanticSearchProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onLoading(true);
    const results = await searchSemantic(query);
    onResults(results);
    onLoading(false);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <label htmlFor="search-input" className="text-sm font-medium text-gray-700">
          Search by Text
        </label>
        <div className="relative mt-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {/* Search Icon SVG */}
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            id="search-input"
            className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            type="text"
            placeholder="e.g., 'warm jacket for rainy season'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="mt-4 w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Search
        </button>
      </form>
    </div>
  );
}