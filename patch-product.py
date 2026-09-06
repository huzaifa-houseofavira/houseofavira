import os

path = r"src/app/product/[id]/ProductClient.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Import
if "OrderJourneyTimeline" not in content:
    content = content.replace("import PriceDisplay from '@/components/PriceDisplay';", "import PriceDisplay from '@/components/PriceDisplay';\nimport OrderJourneyTimeline from '@/components/OrderJourneyTimeline';")


# 2. Add Animated Badge below ADD TO CART
add_to_cart_btn = """                        <button 
                          onClick={handleAddToCart}
                          className="flex-1 bg-white border border-neutral-200 text-black uppercase tracking-widest font-bold text-xs py-4 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all min-h-[56px] shadow-sm" style={{ fontFamily: '"Mona Sans", sans-serif' }}>
                          ADD TO CART
                        </button>
                        <button 
                          onClick={handleWishlist}"""

animated_badge = """                        <button 
                          onClick={handleAddToCart}
                          className="flex-1 bg-white border border-neutral-200 text-black uppercase tracking-widest font-bold text-xs py-4 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all min-h-[56px] shadow-sm" style={{ fontFamily: '"Mona Sans", sans-serif' }}>
                          ADD TO CART
                        </button>
                        
                        {/* Animated Batch Badge */}
                        <div className="w-full mt-1 flex items-center justify-center gap-3 bg-[#E8F5E9]/50 border border-[#10B981]/20 px-4 py-3 rounded-xl col-span-2 shadow-sm">
                          <div className="relative flex items-center justify-center w-3 h-3">
                            <div className="absolute w-full h-full bg-[#10B981] rounded-full animate-ping opacity-75"></div>
                            <div className="relative w-2 h-2 bg-[#10B981] rounded-full"></div>
                          </div>
                          <span className="text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-[#1B5E20] font-dm-sans">
                            Batch is Live — Order now to be included
                          </span>
                        </div>

                        <button 
                          onClick={handleWishlist}"""

if add_to_cart_btn in content:
    content = content.replace(add_to_cart_btn, animated_badge)
else:
    print("Could not find ADD TO CART button block.")

# 3. Add OrderJourneyTimeline above Product Description
description_block = """                <div className="border-t border-neutral-200 pt-8 mt-6">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-black mb-4" style={{ fontFamily: '"Mona Sans", sans-serif' }}>Product Details</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap font-light">"""

timeline_and_desc = """                <OrderJourneyTimeline />
                
                <div className="border-t border-neutral-200 pt-8 mt-6">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-black mb-4" style={{ fontFamily: '"Mona Sans", sans-serif' }}>Product Details</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap font-light">"""

if description_block in content:
    content = content.replace(description_block, timeline_and_desc)
else:
    print("Could not find Description block.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated ProductClient.js")
