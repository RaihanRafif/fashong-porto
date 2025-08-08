"use client";

import { useState, useRef, useCallback } from 'react';
import { searchVisual, Product } from '@/lib/api';
import Image from 'next/image';

type VisualSearchProps = {
  onResults: (results: Product[]) => void;
  onLoading: (isLoading: boolean) => void;
};

export default function VisualSearch({ onResults, onLoading }: VisualSearchProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const selectedFile = e.dataTransfer.files?.[0];
    if (selectedFile) {
      handleFileChange(selectedFile);
    }
  }, []);

  const handleSearch = async () => {
    if (!file) return;
    onLoading(true);
    const results = await searchVisual(file);
    onResults(results);
    onLoading(false);
  };

  const clearPreview = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="w-full">
      <label className="text-sm font-medium text-gray-700">
        Search by Image
      </label>
      <div
        className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 relative bg-white"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="text-center">
            <Image src={preview} alt="Image preview" width={150} height={150} className="mx-auto h-24 w-24 object-contain rounded-md" />
            <div className="mt-4 flex items-center justify-center gap-x-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Change Image
              </button>
              <button type="button" onClick={clearPreview} className="text-sm font-semibold leading-6 text-red-600">Remove</button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            {/* Upload Icon SVG */}
            <svg className="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
            </svg>
            <div className="mt-4 flex text-sm leading-6 text-gray-600">
              <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                <span>Upload a file</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={handleSearch}
        disabled={!file}
        className="mt-4 w-full rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Find Similar Items
      </button>
    </div>
  );
}