'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, Layers, Heart, X, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useQuickAddStore } from '@/store/quickAddStore';
import PriceDisplay from '@/components/PriceDisplay';
import { motion, AnimatePresence } from 'framer-motion';
import DualRangeSlider from '@/components/ui/DualRangeSlider';
import { createSearchIndex, search as fuseSearch, getDidYouMean, logSearchAnalytics } from '@/lib/search';
import './catalogue.css';

const CATEGORIES = [
  'ALL',
  'JACKETS',
  'TOPS',
  'TROUSERS',
  'DRESSES',
  'JEWELLERY',
  'BAGS',
  'FOOTWEAR',
  'ACCESSORIES',
  'COLLECTIBLES',
  'PETS'
];

const COLOR_MAP = {
  black: '#000000',
  white: '#ffffff',
  red: '#ff0000',
  blue: '#0000ff',
  green: '#008000',
  yellow: '#ffff00',
  purple: '#800080',
  orange: '#ffa500',
  pink: '#ffc0cb',
  brown: '#a52a2a',
  grey: '#808080',
  gray: '#808080',
  silver: '#c0c0c0',
  gold: '#ffd700',
  navy: '#000080',
  beige: '#f5f5dc',
  maroon: '#800000',
  olive: '#808000',
  teal: '#008080',
  cyan: '#00ffff',
  magenta: '#ff00ff',
  cream: '#fffdd0',
  mustard: '#ffdb58',
  burgundy: '#800020',
  charcoal: '#36454f',
  peach: '#ffdab9',
  lavender: '#e6e6fa',
  mint: '#98ff98',
  coral: '#ff7f50',
  rust: '#b7410e',
};

const getColorHex = (colorName) => {
  if (!colorName) return '#000000';
  if (colorName.startsWith('#')) return colorName.toLowerCase();
  const lower = colorName.toLowerCase();
  return COLOR_MAP[lower] || null;
};

export default function CatalogueClient() {
  const searchParams = useSearchParams();
  const searchParamQuery = searchParams.get('search') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Filter & Sort States
  const [activeSort, setActiveSort] = useState('newest'); // newest, price_asc, price_desc
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]); // [min, max]
  
  // Mobile UI States
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'sort', 'size', 'color', 'price'

  const { user } = useAuthStore();
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { openQuickAdd } = useQuickAddStore();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        const productsList = await res.json();
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Initialize Search Index
  const searchIndex = useMemo(() => {
    if (products.length === 0) return null;
    return createSearchIndex(products);
  }, [products]);

  // If there's a search query, run the fuse search
  const searchResults = useMemo(() => {
    if (!searchParamQuery || !searchIndex) return null;
    return fuseSearch(searchIndex, searchParamQuery, 100);
  }, [searchParamQuery, searchIndex]);

  // Log search analytics once when query changes and results are ready
  useEffect(() => {
    if (searchParamQuery && searchResults !== null) {
      logSearchAnalytics(searchParamQuery, searchResults.length, 'catalogue', user?.uid);
    }
  }, [searchParamQuery, searchResults, user?.uid]);

  // Base products list is either the search results or all products
  const baseProducts = searchResults !== null ? searchResults : products;

  // Filter strictly by the category pill selected
  const categoryFilteredProducts = useMemo(() => {
    return activeCategory === 'ALL' 
      ? baseProducts 
      : baseProducts.filter(p => {
          const term = activeCategory.toLowerCase();
          return (
            p.category?.toLowerCase().includes(term) ||
            p.subcategory?.toLowerCase().includes(term) ||
            p.badge?.toLowerCase().includes(term) ||
            p.section?.toLowerCase().includes(term) ||
            p.name?.toLowerCase().includes(term) ||
            p.description?.toLowerCase().includes(term)
          );
        });
  }, [baseProducts, activeCategory]);

  // Extract available unique sizes and colors dynamically from the category-filtered items
const SIZE_ORDER = {
  "XXS": 1, "XS": 2, "S": 3, "SMALL": 3,
  "M": 4, "MEDIUM": 4, "L": 5, "LARGE": 5,
  "XL": 6, "1X": 6, "2XL": 7, "XXL": 7, "3XL": 8, "XXXL": 8, "4XL": 9, "5XL": 10
};

const sortSizes = (a, b) => {
  const aVal = SIZE_ORDER[a.toUpperCase()] || 99;
  const bVal = SIZE_ORDER[b.toUpperCase()] || 99;
  if (aVal !== bVal) return aVal - bVal;
  return a.localeCompare(b);
};

  const availableSizes = useMemo(() => {
    const sizes = new Set();
    categoryFilteredProducts.forEach(p => {
      if (p.sizes) p.sizes.forEach(s => sizes.add(s));
    });
    return Array.from(sizes).sort(sortSizes);
  }, [categoryFilteredProducts]);

  
  const groupedSizes = useMemo(() => {
    const groups = {
      'Apparel': [],
      'Phone Models': [],
      'Couples': [],
      'Tech / Cables': [],
      'Other': []
    };
    
    availableSizes.forEach(size => {
      const s = size.toLowerCase();
      if (s.includes('iphone') || s.includes('samsung') || s.includes('pixel')) {
        groups['Phone Models'].push(size);
      } else if (s.includes('female') || s.includes('male')) {
        groups['Couples'].push(size);
      } else if (s.includes('cable') || s.includes('c-type') || s.includes('type c') || s.includes('usb')) {
        groups['Tech / Cables'].push(size);
      } else if (SIZE_ORDER[size.toUpperCase()] !== undefined || s.endsWith('xl') || s === 'one size' || s === 'free size') {
        groups['Apparel'].push(size);
      } else {
        groups['Other'].push(size);
      }
    });
    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [availableSizes]);

  const availableColors = useMemo(() => {
    const colorMap = new Map();
    categoryFilteredProducts.forEach(p => {
      if (p.swatches) {
        p.swatches.forEach(s => {
          let name = (s.colorName || s.name || '').trim();
          let hex = (s.color || '').trim();
          
          if (!name && hex) name = hex;
          if (!name) return;
          
          const formatted = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
          
          let computedHex = getColorHex(formatted);
          if (!computedHex && hex.startsWith('#')) computedHex = hex.toLowerCase();
          if (!computedHex) computedHex = formatted.toLowerCase(); // fallback
          
          let finalBgHex = hex.startsWith('#') ? hex : (getColorHex(formatted) || '#FAFAFA');

          // Only overwrite if we don't have a good name yet
          if (!colorMap.has(computedHex) || colorMap.get(computedHex).name.startsWith('#')) {
             colorMap.set(computedHex, { name: formatted, bgHex: finalBgHex });
          }
        });
      }
    });
    return Array.from(colorMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [categoryFilteredProducts]);

  // Apply user filters and sort
  const displayProducts = useMemo(() => {
    let result = [...categoryFilteredProducts];

    // Filter Price
    result = result.filter(p => (p.price || 0) >= priceRange[0] && (p.price || 0) <= priceRange[1]);

    // Filter Size
    if (selectedSizes.length > 0) {
      result = result.filter(p => p.sizes && p.sizes.some(s => selectedSizes.includes(s)));
    }

    // Filter Color (Match by mapping to the same deduplicated computed hex/name as availableColors)
    if (selectedColors.length > 0) {
      result = result.filter(p => p.swatches && p.swatches.some(s => {
        let name = (s.colorName || s.name || '').trim();
        let hex = (s.color || '').trim();
        if (!name && hex) name = hex;
        if (!name) return false;
        
        const formatted = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        let computedHex = getColorHex(formatted);
        if (!computedHex && hex.startsWith('#')) computedHex = hex.toLowerCase();
        if (!computedHex) computedHex = formatted.toLowerCase();

        // Check if ANY of the selected colors map to the same computedHex
        return selectedColors.some(selectedColor => {
          let selHex = getColorHex(selectedColor);
          if (!selHex && selectedColor.startsWith('#')) selHex = selectedColor.toLowerCase();
          if (!selHex) selHex = selectedColor.toLowerCase();
          return computedHex === selHex;
        });
      }));
    }

    // Sort
    if (activeSort === 'price_asc') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (activeSort === 'price_desc') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      // Newest
      result.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
    }

    return result;
  }, [categoryFilteredProducts, selectedSizes, selectedColors, priceRange, activeSort]);

  const toggleSize = (size) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const toggleColor = (color) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const toggleDropdown = (dropdown) => {
    if (activeDropdown === dropdown) setActiveDropdown(null);
    else setActiveDropdown(dropdown);
  };

  const handleHeartClick = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      setShowLoginModal(true);
    } else {
      toggleWishlist(product);
    }
  };

  return (
    <div className="avira-catalogue-container relative pb-32 md:pb-0" style={{ fontFamily: 'var(--font-dm-sans, "DM Sans", sans-serif)' }}>
      {/* Header */}
      <header className="avira-catalogue-header">
        <h1 className="avira-catalogue-title tracking-tight uppercase">
          {searchParamQuery ? `SEARCH: ${searchParamQuery}` : 'GET THE LOOK'}
        </h1>
        {searchParamQuery && searchResults?.length === 0 && (
          <p className="text-sm mt-4 text-neutral-500">
            {getDidYouMean(products, searchParamQuery) ? (
              <span>Did you mean <Link href={`/catalogue?search=${encodeURIComponent(getDidYouMean(products, searchParamQuery))}`} className="text-black font-bold underline">{getDidYouMean(products, searchParamQuery)}</Link>?</span>
            ) : (
              'No results found. Try adjusting your search.'
            )}
          </p>
        )}
      </header>

      {/* Categories Scroll */}
      <nav className="avira-cat-scroller-container">
        <div className="avira-cat-scroller">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`avira-cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(cat);
                setSelectedSizes([]); // reset filters when category changes
                setSelectedColors([]);
                setPriceRange([0, 10000]);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* DESKTOP FILTER BAR */}
      <div className="hidden md:block sticky top-[72px] z-40 w-full backdrop-blur-3xl bg-white/70 border-y border-black/5 shadow-[0_4px_30px_rgba(0,0,0,0.02)] transition-all duration-300 mb-8">
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          
          <div className="flex items-center gap-8">
            {/* Sort Dropdown */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('desktop_sort')}
                className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-black hover:opacity-70 transition-opacity"
              >
                Sort By <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'desktop_sort' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {activeDropdown === 'desktop_sort' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-4 w-48 bg-white/95 backdrop-blur-xl border border-black/5 shadow-2xl rounded-2xl overflow-hidden py-2"
                  >
                    <button onClick={() => { setActiveSort('newest'); setActiveDropdown(null); }} className="w-full text-left px-5 py-3 text-xs font-semibold hover:bg-black/5 flex items-center justify-between">
                      Newest {activeSort === 'newest' && <Check className="w-3 h-3" />}
                    </button>
                    <button onClick={() => { setActiveSort('price_asc'); setActiveDropdown(null); }} className="w-full text-left px-5 py-3 text-xs font-semibold hover:bg-black/5 flex items-center justify-between">
                      Price: Low to High {activeSort === 'price_asc' && <Check className="w-3 h-3" />}
                    </button>
                    <button onClick={() => { setActiveSort('price_desc'); setActiveDropdown(null); }} className="w-full text-left px-5 py-3 text-xs font-semibold hover:bg-black/5 flex items-center justify-between">
                      Price: High to Low {activeSort === 'price_desc' && <Check className="w-3 h-3" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Price Dropdown */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('desktop_price')}
                className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-black hover:opacity-70 transition-opacity"
              >
                Price {(priceRange[0] > 0 || priceRange[1] < 10000) && <span className="bg-black text-white rounded-full w-2 h-2"></span>} <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'desktop_price' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {activeDropdown === 'desktop_price' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-4 w-72 bg-white/95 backdrop-blur-xl border border-black/5 shadow-2xl rounded-2xl overflow-hidden p-6"
                  >
                    <div className="flex justify-between items-center mb-6 text-sm font-semibold text-black">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                    <DualRangeSlider 
                      min={0} 
                      max={10000} 
                      step={100} 
                      value={priceRange} 
                      onChange={setPriceRange} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Size Dropdown */}
            {availableSizes.length > 0 && (
              <div className="relative">
                <button 
                  onClick={() => toggleDropdown('desktop_size')}
                  className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-black hover:opacity-70 transition-opacity"
                >
                  Size {selectedSizes.length > 0 && <span className="bg-black text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]">{selectedSizes.length}</span>} <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'desktop_size' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === 'desktop_size' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-4 w-64 bg-white/95 backdrop-blur-xl border border-black/5 shadow-2xl rounded-2xl overflow-hidden p-4"
                    >
                      <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto hide-scrollbar pr-1">
                          {groupedSizes.map(([groupName, sizes]) => (
                            <div key={groupName}>
                              <h4 className="text-[9px] font-bold tracking-widest uppercase text-neutral-400 mb-2">{groupName}</h4>
                              <div className="grid grid-cols-3 gap-2">
                                {sizes.map(size => (
                                  <button 
                                    key={size}
                                    onClick={() => toggleSize(size)}
                                    className={`py-2 text-[10px] font-bold rounded-lg border transition-all active:scale-95 ${selectedSizes.includes(size) ? 'bg-black text-white border-black shadow-md' : 'bg-transparent text-black border-black/10 hover:border-black/30'}`}
                                  >
                                    {size}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Active Filters Clear Button */}
          {(selectedSizes.length > 0 || selectedColors.length > 0 || activeSort !== 'newest' || priceRange[0] > 0 || priceRange[1] < 10000) && (
            <button 
              onClick={() => { setSelectedSizes([]); setSelectedColors([]); setPriceRange([0, 10000]); setActiveSort('newest'); }}
              className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 hover:text-black transition-colors"
            >
              Clear All
            </button>
          )}

        </div>
      </div>

      {/* MOBILE FLUID PILL FILTER BAR (Fixed at bottom) */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-40 flex justify-center pointer-events-none">
        <div className="bg-white/80 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/40 rounded-full px-6 py-3.5 flex justify-between items-center gap-8 pointer-events-auto relative">
          
          {/* Sort Trigger */}
          <button 
            onClick={() => toggleDropdown('mobile_sort')}
            className="flex flex-col items-center gap-0.5 text-black hover:opacity-70 transition-opacity"
          >
            <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-500">Sort By</span>
            <span className="text-[11px] font-bold">{activeSort === 'newest' ? 'Newest' : activeSort === 'price_asc' ? 'Lowest' : 'Highest'}</span>
          </button>

          {/* Divider */}
          <div className="w-[1px] h-6 bg-black/10"></div>

          {/* Filters Trigger */}
          <button 
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 text-black hover:opacity-70 transition-opacity"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Filters {(selectedSizes.length + selectedColors.length + (priceRange[0]>0||priceRange[1]<10000?1:0)) > 0 && `(${selectedSizes.length + selectedColors.length + (priceRange[0]>0||priceRange[1]<10000?1:0)})`}</span>
          </button>

          {/* Mobile Sort Dropdown Popover */}
          <AnimatePresence>
            {activeDropdown === 'mobile_sort' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-[calc(100%+16px)] left-0 w-48 bg-white/95 backdrop-blur-3xl border border-white/40 shadow-2xl rounded-3xl overflow-hidden py-2"
              >
                <button onClick={() => { setActiveSort('newest'); setActiveDropdown(null); }} className={`w-full text-left px-5 py-3 text-xs font-bold ${activeSort === 'newest' ? 'text-black' : 'text-neutral-500'}`}>
                  Newest Arrivals
                </button>
                <button onClick={() => { setActiveSort('price_asc'); setActiveDropdown(null); }} className={`w-full text-left px-5 py-3 text-xs font-bold ${activeSort === 'price_asc' ? 'text-black' : 'text-neutral-500'}`}>
                  Price: Low to High
                </button>
                <button onClick={() => { setActiveSort('price_desc'); setActiveDropdown(null); }} className={`w-full text-left px-5 py-3 text-xs font-bold ${activeSort === 'price_desc' ? 'text-black' : 'text-neutral-500'}`}>
                  Price: High to Low
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MOBILE PREMIUM FILTERS BOTTOM SHEET */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="md:hidden fixed inset-0 z-[100] bg-black cursor-pointer"
            />
            
            {/* Sheet */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed inset-x-0 bottom-0 z-[100] bg-white/95 backdrop-blur-3xl rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col max-h-[85vh] border border-white/50"
              style={{ fontFamily: 'var(--font-dm-sans, "DM Sans", sans-serif)' }}
            >
              {/* Grab Handle */}
              <div className="w-full flex justify-center pt-4 pb-2">
                <div className="w-12 h-1.5 bg-neutral-300 rounded-full" />
              </div>

              <div className="px-8 pb-4 flex justify-between items-center sticky top-0 z-10">
                <h2 className="text-xl font-bold tracking-tight text-black">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)} className="w-8 h-8 flex items-center justify-center bg-neutral-100 rounded-full text-black hover:bg-neutral-200 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-10 pb-10">
                
                {/* Price Range */}
                <div>
                  <div className="flex justify-between items-end mb-6">
                    <h3 className="text-[13px] font-bold tracking-widest uppercase text-neutral-500">Price Range</h3>
                    <span className="text-sm font-semibold text-black">₹{priceRange[0]} - ₹{priceRange[1]}</span>
                  </div>
                  <div className="px-2">
                    <DualRangeSlider 
                      min={0} 
                      max={10000} 
                      step={100} 
                      value={priceRange} 
                      onChange={setPriceRange} 
                    />
                  </div>
                </div>

                {/* Sizes */}
                {availableSizes.length > 0 && (
                  <div>
                    <h3 className="text-[13px] font-bold tracking-widest uppercase text-neutral-500 mb-4">Size</h3>
                    <div className="flex flex-col gap-6">
                      {groupedSizes.map(([groupName, sizes]) => (
                        <div key={groupName}>
                          <h4 className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-3">{groupName}</h4>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {sizes.map(size => (
                              <button 
                                key={size}
                                onClick={() => toggleSize(size)}
                                className={`py-3 px-1 text-[10px] font-bold rounded-2xl border transition-all active:scale-95 ${selectedSizes.includes(size) ? 'bg-black text-white border-black shadow-md' : 'bg-[#FAFAFA] text-black border-transparent'}`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="p-6 bg-white/80 backdrop-blur-xl border-t border-black/5 mt-auto flex gap-4 rounded-b-[2.5rem]">
                <button 
                  onClick={() => { setSelectedSizes([]); setSelectedColors([]); setPriceRange([0, 10000]); setActiveSort('newest'); }}
                  className="w-1/3 py-4 text-xs font-bold tracking-widest uppercase text-black bg-neutral-100 rounded-2xl active:scale-95 transition-transform"
                >
                  Clear
                </button>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="w-2/3 py-4 text-xs font-bold tracking-widest uppercase text-white bg-black rounded-2xl active:scale-95 transition-transform shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
                >
                  Show {displayProducts.length} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Masonry Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-8 sm:gap-x-4 sm:gap-y-12 px-2 sm:px-8 mt-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="w-full aspect-[3/4] bg-neutral-200 animate-pulse rounded-md" />
              <div className="w-2/3 h-3 bg-neutral-200 animate-pulse rounded-full mt-2" />
              <div className="w-1/3 h-3 bg-neutral-200 animate-pulse rounded-full" />
            </div>
          ))}
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="avira-empty">
          <h3>No looks available yet</h3>
          <p>Check back soon for curated styles.</p>
          {(selectedSizes.length > 0 || selectedColors.length > 0 || priceRange[0] > 0 || priceRange[1] < 10000) && (
            <button 
              onClick={() => { setSelectedSizes([]); setSelectedColors([]); setPriceRange([0, 10000]); }}
              className="mt-6 px-8 py-3 bg-black text-white text-xs font-bold tracking-widest uppercase hover:bg-[#8A001A] transition-colors rounded-full"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="avira-masonry-grid">
          {displayProducts.map((product) => {
            const isWishlisted = wishlist.some(item => item.id === product.id);
            return (
              <Link 
                key={product.id} 
                href={`/product/${product.slug || product.id}`}
                className="avira-masonry-item group"
              >
                <div className="avira-item-img-wrapper">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="avira-item-img"
                    loading="lazy"
                  />
                  
                  <div className="avira-item-overlay">
                    {/* Top Right Layers Icon */}
                    <div 
                      className="avira-icon-top-right cursor-pointer hover:scale-105 transition-transform"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openQuickAdd(product);
                      }}
                    >
                      <Layers className="w-4 h-4 text-black" />
                    </div>
                    
                    {/* Bottom Right Heart Icon */}
                    <div 
                      className="avira-icon-bottom-right cursor-pointer hover:scale-105 transition-transform"
                      onClick={(e) => handleHeartClick(e, product)}
                    >
                      <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-[#8A001A] text-[#8A001A]' : 'text-black hover:text-[#8A001A]'}`} />
                    </div>
                  </div>
                </div>
                {/* Product Info below image */}
                <div className="mt-2.5 flex flex-col items-start w-full font-sans pb-2">
                  <span className="text-[11px] md:text-xs font-normal text-black uppercase truncate w-full">{product.name}</span>
                  <span className="text-xs md:text-[13px] text-black font-semibold mt-0.5"><PriceDisplay basePrice={product.price || 0} /></span>
                  
                  {/* Swatches */}
                  {product.swatches && product.swatches.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5 pl-0.5 pb-1">
                      {product.swatches.slice(0, 3).map((swatch, idx) => (
                        <div 
                          key={idx} 
                          className="w-3 h-3 rounded-full border border-black/20 flex items-center justify-center p-[1px]"
                          style={swatch.active ? { borderColor: '#000000', borderWidth: '1.5px' } : {}}
                        >
                          <div 
                            className="w-full h-full rounded-full" 
                            style={{ backgroundColor: swatch.color || '#cccccc' }}
                          />
                        </div>
                      ))}
                      {product.extraColors > 0 && (
                        <span className="text-[9px] text-neutral-500 font-bold ml-0.5">+{product.extraColors}</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white p-8 max-w-[400px] w-full flex flex-col items-center text-center relative shadow-2xl">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-black hover:opacity-70 transition-opacity p-1"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-[15px] font-bold tracking-widest uppercase text-black mb-3 mt-4">
              Log in to save this look
            </h2>
            <p className="text-[13px] text-black/80 mb-8 leading-relaxed px-2">
              Log in or create an account to save your favourite looks and view them at any time.
            </p>
            
            <Link 
              href="/auth/login"
              className="w-full bg-black text-white text-xs font-bold uppercase tracking-[0.15em] py-4 mb-4 hover:bg-[#8A001A] transition-colors"
            >
              Log in or create account
            </Link>
            
            <button 
              onClick={() => setShowLoginModal(false)}
              className="w-full bg-transparent text-black text-[11px] font-bold uppercase tracking-widest py-2 hover:opacity-70 transition-opacity"
            >
              Go back without saving
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
