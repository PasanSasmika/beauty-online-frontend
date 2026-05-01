import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import AllProductsPage from './AllProductsPage';
 
export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#000000]" size={40} />
      </div>
    }>
      <AllProductsPage />
    </Suspense>
  );
}
 