import Link from 'next/link';
import Image from 'next/image';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useQuickAddStore } from '@/store/quickAddStore';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag, Layers } from 'lucide-react';
import PriceDisplay from '@/components/PriceDisplay';
import { optimizeCloudinaryUrl } from '@/lib/image-optimizer';

export default function ProductCard({ product }) {
  const { id, slug, name, price, imageUrl, badge, swatches, sizes = [] } = product;
  
  const { user } = useAuthStore();
  const router = useRouter();
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const { openQuickAdd } = useQuickAddStore();
  
  const isWishlisted = wishlist.some(item => item.id === id);

  const handleWishlistClick = async (e) => {
    e.preventDefault(); // Prevent Link wrapper if this card gets wrapped
    e.stopPropagation();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    await toggleWishlist(product);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    const hasColors = product.swatches && product.swatches.length > 0;
    const hasSizes = product.sizes && product.sizes.length > 0;
    
    if (hasColors || hasSizes) {
      openQuickAdd(product);
    } else {
      await addToCart({ 
        id: product.id, 
        title: product.name || product.title, 
        price: product.price, 
        image: product.imageUrl || (product.images && product.images[0]),
        availableSizes: product.sizes || []
      });
    }
  };

  return (
    <div className="group flex flex-col gap-2 relative cursor-pointer w-full">
      {/* Image Container */}
      <div className={`relative aspect-[3/4] w-full overflow-hidden rounded-md bg-[#E5E0DA] ${product.inStock === false ? 'opacity-70' : ''}`}>
        
        {/* Mobile Swipe Container (also serves as the main link) */}
        <Link prefetch={false} 
          href={`/product/${product.slug || product.id}`} 
          className="absolute inset-0 z-10 flex overflow-x-auto snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {product.images && product.images.length > 0 ? (
            product.images.map((img, idx) => (
              <div key={idx} className="relative w-full h-full flex-shrink-0 snap-center">
                <Image
                  src={optimizeCloudinaryUrl(img, 600)}
                  alt={`${name} ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover object-center pointer-events-none"
                />
              </div>
            ))
          ) : (
            <Image
              src={optimizeCloudinaryUrl(imageUrl || (product.images && product.images[0]), 600)}
              alt={name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover object-center pointer-events-none"
            />
          )}
        </Link>

        {/* Desktop Hover Effect (only applies if multiple images exist) */}
        {product.images && product.images.length > 1 && (
          <Image
            src={optimizeCloudinaryUrl(product.images[1], 600)}
            alt={`${name} secondary`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="hidden md:block object-cover object-center opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-[15] pointer-events-none"
          />
        )}
        
        {/* Out of Stock Overlay */}
        {product.inStock === false && (
          <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10 backdrop-blur-[1px]">
            <span className="bg-white/90 text-black px-4 py-2 text-[10px] font-bold tracking-[0.2em] shadow-sm uppercase">
              Out of Stock
            </span>
          </div>
        )}
        
        {/* Badge (MOST LOVED, NEW, etc.) */}
        {badge && (
          <div className="absolute top-2 left-2 z-20 bg-white px-2 py-1 text-[9px] font-bold tracking-widest uppercase text-black shadow-sm rounded-sm">
            {badge}
          </div>
        )}

        {/* Add to Cart Button (Top Right) */}
        <button 
          onClick={handleAddToCart}
          disabled={product.inStock === false}
          className={`absolute top-2 right-2 z-20 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-sm flex items-center justify-center hover:bg-white transition-all duration-300 hover:scale-105 shadow-sm ${product.inStock === false ? 'cursor-not-allowed hidden' : ''}`}
          aria-label="Add to cart"
        >
          <Layers className="w-3.5 h-3.5 text-black" />
        </button>

        {/* Hover Sizes Panel */}
        {sizes && sizes.length > 0 && (
          <div className="absolute bottom-2 left-2 right-12 z-20 bg-white/95 backdrop-blur-sm py-2 px-2 flex justify-center items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[2px] shadow-sm">
            {sizes.slice(0, 5).map(size => (
              <span key={size} className="text-[10px] font-medium text-neutral-600 hover:text-black transition-colors">{size}</span>
            ))}
            {sizes.length > 5 && <span className="text-[10px] font-medium text-neutral-600">...</span>}
          </div>
        )}

        {/* Wishlist Heart Button (Bottom Right) */}
        <button 
          onClick={handleWishlistClick}
          className="absolute bottom-2 right-2 z-20 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-sm flex items-center justify-center hover:bg-white transition-colors group/heart shadow-sm hover:scale-105"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart 
            className={`w-3.5 h-3.5 transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
              isWishlisted 
                ? 'fill-[#8A001A] stroke-[#8A001A] scale-110' 
                : 'fill-none stroke-black group-hover/heart:scale-110 group-hover/heart:stroke-[#8A001A]'
            }`} 
          />
        </button>
      </div>

      {/* Details Section */}
      <div className="flex flex-col gap-0.5 pt-1.5 w-full min-w-0 overflow-hidden">
        {/* Title */}
        <h3 className="text-[11px] font-semibold tracking-wide text-black uppercase leading-tight truncate w-full">
          {name}
        </h3>
        
        {/* Price & Swatches Row */}
        <div className="flex items-center justify-between gap-1 w-full min-w-0 mt-0.5">
          <div className="text-[11px] text-neutral-600 font-medium truncate min-w-0">
            <PriceDisplay basePrice={price} />
          </div>
          
          {/* Swatches (Clean, max 3) */}
          {swatches && swatches.length > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              {swatches.slice(0, 3).map((swatch, idx) => (
                <div 
                  key={idx} 
                  className="w-3 h-3 rounded-full border border-black/20 flex items-center justify-center p-[1px] shrink-0"
                  style={swatch.active ? { borderColor: '#000000', borderWidth: '1.5px' } : {}}
                >
                  <div 
                    className="w-full h-full rounded-full" 
                    style={{ backgroundColor: swatch.color || '#cccccc' }}
                  />
                </div>
              ))}
              {swatches.length > 3 && (
                <span className="text-[9px] text-neutral-500 font-bold tracking-tight shrink-0 ml-0.5">
                  +{swatches.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
