import AIStylist from '@/components/AIStylist';
import Image from 'next/image';
import { notFound } from 'next/navigation';

// Type definition for Product
type Product = {
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

// Correct props type for Next.js 15
interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  // Await the params in Next.js 15
  const { id } = await params;
  
  let product: Product | null = null;
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${id}`;
    const res = await fetch(apiUrl, {
      // Cache data selama 1 jam, atau refresh jika ada perubahan
      next: { revalidate: 3600 }
    });

    if (res.status === 404) {
      // Jika API mengembalikan 404, panggil fungsi notFound() dari Next.js
      notFound();
    }

    if (!res.ok) {
      // Untuk error server lainnya, kita bisa melempar error
      throw new Error('Gagal mengambil detail produk');
    }

    product = await res.json();
  } catch (error) {
    console.error(error);
    // Jika fetch gagal total (misal: backend mati), tampilkan pesan error
    return <div className="text-center p-10">Terjadi kesalahan saat memuat produk.</div>;
  }

  // Jika karena alasan lain produk tetap null
  if (!product) {
    notFound();
  }

  return (
    <>
      <div className="container mx-auto p-8">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="relative w-full aspect-square">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain rounded-lg"
              priority // Prioritaskan pemuatan gambar utama di halaman detail
            />
          </div>
          <div>
            <p className="text-sm font-medium text-teal-600">{product.category.name}</p>
            <h1 className="text-4xl font-bold my-2">{product.name}</h1>
            <p className="text-gray-500 mb-4">Dijual oleh <strong>{product.shopName}</strong></p>

            <div className="flex items-center mb-4 text-sm">
              <span className="flex items-center text-yellow-500">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                {product.rating.toFixed(1)}
              </span>
              <span className="ml-3 text-gray-600">({product.reviewsCount} ulasan)</span>
              <span className="mx-3">|</span>
              <span className="text-gray-600">Stok: {product.stock}</span>
            </div>

            <p className="text-4xl font-light my-6">
              {new Intl.NumberFormat('id-ID', { 
                style: 'currency', 
                currency: 'IDR', 
                minimumFractionDigits: 0 
              }).format(Number(product.price))}
            </p>

            <h3 className="font-semibold mt-8 mb-2">Deskripsi Produk</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>

      <AIStylist productId={product.id} productName={product.name} />
    </>
  );
}