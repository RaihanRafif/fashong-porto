// Definisikan tipe data Product agar bisa digunakan di banyak tempat
export type Product = {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  description: string;
  stock: number;
  shopName: string;
  rating: number;
  reviewsCount: number;
  category: {
    name: string;
  };
};

export type OutfitIdea = {
  title: string;
  items: string[];
};

export type StyleSuggestionResponse = {
  outfits: OutfitIdea[];
};

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Fungsi untuk pencarian semantik (teks)
export async function searchSemantic(query: string): Promise<Product[]> {
  if (!query) return [];
  try {
    const res = await fetch(
      `${API_URL}/search/semantic?query=${encodeURIComponent(query)}`
    );
    if (!res.ok) throw new Error("Gagal melakukan pencarian semantik");
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Fungsi untuk pencarian visual (gambar)
export async function searchVisual(file: File): Promise<Product[]> {
  const formData = new FormData();
  formData.append("productImage", file);

  try {
    const res = await fetch(`${API_URL}/search/visual`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Gagal melakukan pencarian visual");
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getStyleSuggestions(
  productId: string
): Promise<StyleSuggestionResponse | null> {
  try {
    const res = await fetch(`${API_URL}/products/${productId}/stylist`);
    if (!res.ok) throw new Error("Failed to get style suggestions");
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
