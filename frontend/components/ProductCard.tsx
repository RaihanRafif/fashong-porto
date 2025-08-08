import Image from 'next/image';
import Link from 'next/link';

// Definisikan tipe data untuk sebuah produk agar TypeScript senang
type Product = {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  category: {
    name: string;
  };
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="group block border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div className="relative w-full h-64">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          style={{ objectFit: 'cover' }}
          className="group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-500">{product.category.name}</p>
        <h3 className="mt-1 font-semibold text-lg truncate">{product.name}</h3>
        <p className="mt-2 text-md font-bold text-gray-800">
          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(product.price))}
        </p>
      </div>
    </Link>
  );
}