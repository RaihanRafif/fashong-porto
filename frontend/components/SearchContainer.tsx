"use client";

import { useState } from "react";
import SemanticSearch from "./SemanticSearch";
import VisualSearch from "./VisualSearch";
import ProductCard from "./ProductCard";
import { Product } from "@/lib/api";

export default function SearchContainer() {
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleResults = (results: Product[]) => {
    setSearchResults(results);
    setSearchPerformed(true);
  };
  
  const handleLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  return (
    <>
      <section className="my-12 p-6 md:p-8 border rounded-xl bg-slate-50 shadow-sm">
        {/*
          SOLUSI DIMULAI DI SINI:
          Struktur grid utama sekarang memiliki DUA anak langsung.
          Masing-masing anak akan menempati satu kolom di layar besar (lg).
        */}
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Kolom 1: Pencarian Teks */}
          <div className="w-full">
            <SemanticSearch onResults={handleResults} onLoading={handleLoading} />
          </div>

          {/* Kolom 2: Pencarian Gambar */}
          <div className="w-full">
            <VisualSearch onResults={handleResults} onLoading={handleLoading} />
          </div>
        </div>
      </section>

      <section className="my-12">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg text-gray-600">Searching...</span>
          </div>
        ) : searchPerformed ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">Search Results:</h2>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {searchResults.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-4 rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900">No Products Found</h3>
                <p className="mt-1 text-sm text-gray-500">Try using a different keyword or uploading another image.</p>
              </div>
            )}
          </div>
        ) : null}
      </section>
    </>
  );
}