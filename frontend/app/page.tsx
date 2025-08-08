import ProductCard from '@/components/ProductCard';
import SearchContainer from '@/components/SearchContainer';

// Definisikan tipe data untuk API response kita
type Product = {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  category: {
    name: string;
  };
};

type ApiResponse = {
  data: Product[];
  // Kita bisa tambahkan info paginasi nanti
};

// Fungsi untuk mengambil data dari API backend
async function getProducts() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/products?limit=12`;
  try {
    const res = await fetch(apiUrl, {
      // Revalidate data setiap 60 detik
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      throw new Error('Gagal mengambil data produk');
    }

    const data: ApiResponse = await res.json();
    return data.data;
  } catch (error) {
    console.error(error);
    return []; // Kembalikan array kosong jika error
  }
}

// Halaman ini adalah Server Component, jadi bisa async
export default async function HomePage() {
  const products = await getProducts();

  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight">FASHONG</h1>
        <p className="mt-2 text-lg text-gray-600">Lets find your style with AI.</p>
      </header>

      {/* Nanti di sini kita letakkan komponen pencarian */}

      <SearchContainer />

      <hr className="my-12" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}