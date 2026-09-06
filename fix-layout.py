import re

path = r"src/app/product/[id]/ProductClient.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix 1: Move the animated batch badge outside the flex row
# Find the exact string currently there
bad_badge_block = """                        </button>
                          
                          {/* Animated Batch Badge */}
                          <div className="w-full mt-2 flex items-center justify-center gap-3 bg-[#E8F5E9]/50 border border-[#10B981]/20 px-4 py-3 rounded-xl col-span-full shadow-sm relative overflow-hidden">
                            <div className="relative flex items-center justify-center w-3 h-3 shrink-0">
                              <div className="absolute w-full h-full bg-[#10B981] rounded-full animate-ping opacity-75"></div>
                              <div className="relative w-2 h-2 bg-[#10B981] rounded-full"></div>
                            </div>
                            <span className="text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-[#1B5E20] font-dm-sans text-center">
                              Batch is Live — Order now to be included
                            </span>
                          </div>
                        <button"""

clean_button = """                        </button>
                        <button"""

if bad_badge_block in content:
    # First, remove it from the bad location
    content = content.replace(bad_badge_block, clean_button)
    
    # Second, inject it exactly after the closing div of the flex row containing the buttons
    # Let's target the exact structure:
    target_wishlist = r"""                        <button 
                          onClick={handleWishlist}
                          className="w-\[56px\] shrink-0 border border-neutral-200 bg-white rounded-xl flex items-center justify-center hover:border-black transition-all group shadow-sm hover:shadow-md"
                          aria-label="Wishlist"
                        >
                          <Heart 
                            className={`w-5 h-5 transition-all duration-300 \$\{isWishlisted \? 'fill-red-500 stroke-red-500' : 'fill-none stroke-black group-hover:scale-110'\}`} 
                          />
                        </button>
                      </div>"""
    
    good_badge_block = """                        <button 
                          onClick={handleWishlist}
                          className="w-[56px] shrink-0 border border-neutral-200 bg-white rounded-xl flex items-center justify-center hover:border-black transition-all group shadow-sm hover:shadow-md"
                          aria-label="Wishlist"
                        >
                          <Heart 
                            className={`w-5 h-5 transition-all duration-300 ${isWishlisted ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-black group-hover:scale-110'}`} 
                          />
                        </button>
                      </div>
                      
                      {/* Animated Batch Badge */}
                      <div className="w-full mt-3 flex items-center justify-center gap-3 bg-[#E8F5E9]/50 border border-[#10B981]/20 px-4 py-3 rounded-xl shadow-sm relative overflow-hidden">
                        <div className="relative flex items-center justify-center w-3 h-3 shrink-0">
                          <div className="absolute w-full h-full bg-[#10B981] rounded-full animate-ping opacity-75"></div>
                          <div className="relative w-2 h-2 bg-[#10B981] rounded-full"></div>
                        </div>
                        <span className="text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-[#1B5E20] font-dm-sans text-center">
                          Batch is Live — Order now to be included
                        </span>
                      </div>"""
    
    content = re.sub(target_wishlist, good_badge_block, content)
    print("Fixed badge position.")
else:
    print("Could not find the bad badge block. It might have been modified.")


# Fix 2: Add OrderJourneyTimeline to desktop layout
desktop_desc = r"""              {/\* Accordion Details \*/}
              <div className="bg-white rounded-\[2rem\] p-8 shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] border border-neutral-100">
                <h3 className="text-xs uppercase tracking-widest font-bold text-black mb-4" style={{ fontFamily: '"Mona Sans", sans-serif' }}>Product Details</h3>"""

good_desktop_desc = """              {/* Order Journey Timeline */}
              <OrderJourneyTimeline />

              {/* Accordion Details */}
              <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100">
                <h3 className="text-xs uppercase tracking-widest font-bold text-black mb-4" style={{ fontFamily: '"Mona Sans", sans-serif' }}>Product Details</h3>"""

content = re.sub(desktop_desc, good_desktop_desc, content)
print("Added timeline to desktop layout.")


with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Patch complete.")
