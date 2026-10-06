'use client';

import { useState, useEffect } from 'react';
import { useQuickAddStore } from '@/store/quickAddStore';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { X, Ruler, ShoppingCart } from 'lucide-react';
import PriceDisplay from '@/components/PriceDisplay';

export default function ProductOptionsModal() {
  const router = useRouter();
  const { isOpen, product, closeQuickAdd, preselectedColor, preselectedSize, preselectedVariant } = useQuickAddStore();
  const { addToCart } = useCartStore();

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      if (product.swatches && product.swatches.length > 0) {
        if (preselectedColor) {
          const preColor = typeof preselectedColor === 'string' ? product.swatches.find(s => s.color === preselectedColor) : null;
          setSelectedColor(preColor || preselectedColor);
        } else {
          const defaultColor = product.swatches.find(s => s.active) || product.swatches[0];
          setSelectedColor(defaultColor);
        }
      } else {
        setSelectedColor(null);
      }
      setSelectedSize(preselectedSize || null);
      setSelectedVariant(preselectedVariant || null);
      setQuantity(1);
    }
  }, [isOpen, product, preselectedColor, preselectedSize, preselectedVariant]);

  if (!isOpen || !product) return null;

  const hasColors = product.swatches && product.swatches.length > 0;
  const hasSizes = product.sizes && product.sizes.length > 0;
  const hasVariants = product.variants && product.variants.length > 0;

  const canAddToCart = (!hasColors || selectedColor) && (!hasSizes || selectedSize) && (!hasVariants || selectedVariant);

  const handleAddToCart = async () => {
    if (!canAddToCart) return;
    setIsAdding(true);
    
    const selectedImage = selectedColor?.imageUrl || product.imageUrl || (product.images && product.images[0]);
    
    const success = await addToCart({
      id: product.id,
      title: product.name || product.title,
      price: selectedVariant ? selectedVariant.price : product.price,
      image: selectedImage,
      color: selectedColor?.colorName || selectedColor?.color || null,
      size: [selectedSize, selectedVariant?.name].filter(Boolean).join(' / ') || null,
      quantity: quantity,
      availableSizes: product.sizes || []
    });

    setIsAdding(false);
    
    if (success) {
      closeQuickAdd();
    }
  };

  const handleBuyNow = async () => {
    if (!canAddToCart) return;
    setIsAdding(true);
    
    const selectedImage = selectedColor?.imageUrl || product.imageUrl || (product.images && product.images[0]);
    
    const success = await addToCart({
      id: product.id,
      title: product.name || product.title,
      price: selectedVariant ? selectedVariant.price : product.price,
      image: selectedImage,
      color: selectedColor?.colorName || selectedColor?.color || null,
      size: [selectedSize, selectedVariant?.name].filter(Boolean).join(' / ') || null,
      quantity: quantity,
      availableSizes: product.sizes || []
    });

    setIsAdding(false);
    
    if (success) {
      closeQuickAdd();
      router.push('/checkout');
    }
  };

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const currentImage = selectedColor?.imageUrl || product.imageUrl || (product.images && product.images[0]);

  // Brand Red Color
  const brandRed = '#8A001A';

  return (
    <>
      <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-end px-0 bg-black/50 backdrop-blur-[2px] transition-opacity font-[family-name:var(--font-dm-sans)]">
        {/* Background overlay click to close */}
        <div className="absolute inset-0" onClick={closeQuickAdd} />

        {/* Slide-over/Bottom-sheet Modal Content */}
        <div 
          className="relative bg-white w-full sm:max-w-[460px] max-h-[92dvh] sm:h-[100dvh] rounded-t-[28px] sm:rounded-t-none sm:rounded-l-2xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-right duration-300 ease-out"
        >
          {/* Header - Close Button */}
          <button 
            onClick={closeQuickAdd}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 text-neutral-500 hover:text-black transition-colors z-20 bg-white sm:bg-transparent rounded-full p-1.5 shadow-sm sm:shadow-none"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
          </button>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 pt-8 sm:pt-10 pb-40">
            {/* Product Info */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-[100px] h-[130px] sm:w-[120px] sm:h-[160px] rounded-xl overflow-hidden bg-neutral-100 shrink-0 shadow-sm border border-neutral-100">
                {currentImage ? (
                  <img src={currentImage} alt={product.name || product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300">No Image</div>
                )}
              </div>
              <div className="flex flex-col pt-1">
                <h2 className="text-[16px] sm:text-[18px] font-bold text-[#111111] leading-tight mb-2">
                  {product.name || product.title}
                </h2>
                <div className="text-[15px] sm:text-[17px] font-semibold text-neutral-900 mb-2">
                  <PriceDisplay basePrice={selectedVariant ? selectedVariant.price : product.price} />
                </div>
              </div>
            </div>

            <div className="w-full h-[1px] bg-neutral-100 mb-6" />

            {/* 1. Select Color */}
            {hasColors && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-[14px] font-bold text-[#111111]">Color:</h3>
                  <span className="text-[14px] text-neutral-500">{selectedColor?.colorName || selectedColor?.color || 'Select a color'}</span>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {product.swatches.map((swatch, idx) => {
                    const isSelected = selectedColor?.color === swatch.color;
                    const hasSwatchImage = !!swatch.imageUrl;
                    
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        <div 
                          onClick={() => setSelectedColor(swatch)}
                          className={`w-full aspect-square rounded-xl cursor-pointer relative overflow-hidden transition-all ${
                            isSelected 
                              ? 'ring-2 ring-offset-2 scale-95 shadow-md' 
                              : 'ring-1 ring-neutral-200 hover:ring-neutral-300 hover:shadow-sm'
                          }`}
                          style={{ 
                            backgroundColor: hasSwatchImage ? 'transparent' : swatch.color,
                            '--tw-ring-color': isSelected ? brandRed : ''
                          }}
                        >
                          {hasSwatchImage && (
                            <img 
                              src={swatch.imageUrl} 
                              alt={swatch.colorName}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {!hasSwatchImage && (
                            <div 
                              className="w-full h-full"
                              style={{ backgroundColor: swatch.color }}
                            />
                          )}
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-[18px] h-[18px] bg-white rounded-full flex items-center justify-center shadow-sm">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brandRed }} />
                            </div>
                          )}
                        </div>
                        
                        <span className="text-[11px] font-medium text-center text-[#111111] truncate w-full px-1">
                          {swatch.colorName || swatch.color}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {hasColors && hasSizes && <div className="w-full h-[1px] bg-neutral-100 mb-6" />}

            {/* 2. Select Size */}
            {hasSizes && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-bold text-[#111111]">Size:</h3>
                    <span className="text-[14px] text-neutral-500">{selectedSize || 'Select your size'}</span>
                  </div>
                  {product.sizeChartUrl && (
                    <button 
                      onClick={() => setShowSizeGuide(true)}
                      className="flex items-center gap-1.5 text-[12px] text-neutral-500 hover:text-black font-medium transition-colors"
                    >
                      Size Guide <Ruler className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                          isSelected 
                            ? 'bg-transparent border-[1.5px] text-[#111111]' 
                            : 'bg-transparent border border-neutral-200 text-[#111111] hover:border-black/40'
                        }`}
                        style={{ borderColor: isSelected ? brandRed : '', color: isSelected ? brandRed : '' }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            

            {hasSizes && hasVariants && <div className="w-full h-[1px] bg-neutral-100 mb-6" />}

            {/* 3. Select Variant */}
            {hasVariants && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-bold text-[#111111]">Option:</h3>
                    <span className="text-[14px] text-neutral-500">{selectedVariant?.name || 'Select an option'}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const outOfStock = v.stock <= 0;
                    return (
                      <button
                        key={v.id}
                        disabled={outOfStock}
                        onClick={() => setSelectedVariant(v)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border-[1.5px] transition-all ${
                          outOfStock ? 'opacity-40 cursor-not-allowed bg-neutral-50 border-neutral-200' :
                          isSelected 
                            ? 'bg-transparent border-[#111111] text-[#111111]' 
                            : 'bg-transparent border-neutral-200 text-[#111111] hover:border-black/40'
                        }`}
                        style={{ borderColor: isSelected ? brandRed : '' }}
                      >
                        <span className="font-medium text-[14px] truncate text-left flex-1" style={{ color: isSelected ? brandRed : '' }}>
                          {v.name} {outOfStock && '- Out of Stock'}
                        </span>
                        <span className="font-bold text-[14px] flex-shrink-0" style={{ color: isSelected ? brandRed : '' }}>
                          ₹{v.price.toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-2">
               <h3 className="text-[14px] font-bold text-[#111111] mb-3">Quantity</h3>
               <div className="flex items-center justify-between">
                  <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden w-[120px] h-[44px]">
                    <button 
                      onClick={() => handleQuantityChange(-1)} 
                      className="w-10 h-full flex items-center justify-center text-neutral-500 hover:bg-neutral-50 hover:text-black transition-colors"
                    >
                      -
                    </button>
                    <div className="flex-1 h-full flex items-center justify-center text-[14px] font-bold border-x border-neutral-200">
                      {quantity}
                    </div>
                    <button 
                      onClick={() => handleQuantityChange(1)} 
                      className="w-10 h-full flex items-center justify-center text-neutral-500 hover:bg-neutral-50 hover:text-black transition-colors"
                    >
                      +
                    </button>
                  </div>

               </div>
            </div>

          </div>

          {/* Sticky Footer */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 sm:px-6 py-4 sm:py-5 z-20 flex flex-col gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart || isAdding}
              className="w-full text-white font-bold text-[15px] py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: brandRed }}
            >
              {isAdding ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  {!canAddToCart ? 'Select Options' : 'Add to Cart'}
                </>
              )}
            </button>
            
            <button
              onClick={handleBuyNow}
              disabled={!canAddToCart || isAdding}
              className="w-full bg-white font-bold text-[15px] py-3.5 rounded-xl border-[1.5px] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: brandRed, color: brandRed }}
            >
              Buy It Now
            </button>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowSizeGuide(false)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden relative shadow-2xl" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-neutral-100">
              <h3 className="text-sm font-bold uppercase tracking-widest text-black">Size Guide</h3>
              <button onClick={() => setShowSizeGuide(false)} className="p-2 bg-neutral-100 rounded-full text-black hover:bg-neutral-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 flex items-center justify-center min-h-[300px]">
              {product.sizeChartUrl ? (
                <img 
                  src={product.sizeChartUrl} 
                  alt={`${product.name || product.title} Size Guide`} 
                  className="max-w-full max-h-[70vh] object-contain"
                />
              ) : (
                <p className="text-sm tracking-widest uppercase font-bold text-neutral-400">
                  NO SIZE GUIDE FOR THIS PRODUCT
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

