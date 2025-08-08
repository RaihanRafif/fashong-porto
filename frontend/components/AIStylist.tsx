"use client"; // Ini adalah Client Component

import { useState } from 'react';
import { getStyleSuggestions, OutfitIdea } from '@/lib/api';

type AIStylistProps = {
    productId: string;
    productName: string;
};

export default function AIStylist({ productId, productName }: AIStylistProps) {
    const [ideas, setIdeas] = useState<OutfitIdea[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGetIdeas = async () => {
        setIsLoading(true);
        setError(null);
        setIdeas(null);

        const result = await getStyleSuggestions(productId);

        console.log("hhh ", productId);


        if (result) {
            setIdeas(result.outfits);
        } else {
            setError("Sorry, the AI stylist couldn't come up with ideas right now. Please try again later.");
        }
        setIsLoading(false);
    };

    return (
        <div className="mt-10 p-6 border-t">
            <div className="text-center">
                <h2 className="text-2xl font-semibold">Need some style inspiration?</h2>
                <p className="mt-1 text-gray-600">Let our AI Stylist create outfits for you!</p>
                <button
                    onClick={handleGetIdeas}
                    disabled={isLoading}
                    className="mt-4 inline-flex items-center justify-center rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Thinking...
                        </>
                    ) : (
                        'Get Outfit Ideas'
                    )}
                </button>
            </div>

            {error && <div className="mt-6 text-center text-red-600 bg-red-100 p-4 rounded-md">{error}</div>}

            {ideas && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-center">AI Stylist Suggestions:</h3>
                    <div className="mt-4 grid gap-6 md:grid-cols-2">
                        {ideas.map((outfit, index) => (
                            <div key={index} className="rounded-lg border bg-white p-4 shadow-sm">
                                <h4 className="font-semibold text-indigo-700">{outfit.title}</h4>
                                <ul className="mt-2 list-disc list-inside space-y-1 text-gray-700">
                                    <li className="font-bold">{productName} (This Item)</li>
                                    {outfit.items.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
