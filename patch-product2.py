import re

path = r"src/app/product/[id]/ProductClient.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Animated Badge below ADD TO CART
# Find the exact add to cart block
target_cart = r"(ADD TO CART\s*</button>)"
badge_code = r"""\1
                        
                        {/* Animated Batch Badge */}
                        <div className="w-full mt-2 flex items-center justify-center gap-3 bg-[#E8F5E9]/50 border border-[#10B981]/20 px-4 py-3 rounded-xl col-span-full shadow-sm relative overflow-hidden">
                          <div className="relative flex items-center justify-center w-3 h-3 shrink-0">
                            <div className="absolute w-full h-full bg-[#10B981] rounded-full animate-ping opacity-75"></div>
                            <div className="relative w-2 h-2 bg-[#10B981] rounded-full"></div>
                          </div>
                          <span className="text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-[#1B5E20] font-dm-sans text-center">
                            Batch is Live — Order now to be included
                          </span>
                        </div>"""

if "Batch is Live" not in content:
    content = re.sub(target_cart, badge_code, content)
    print("Injected Animated Badge.")

# 2. Add OrderJourneyTimeline above Product Details
target_desc = r"(<div className=\"border-t border-neutral-200 pt-8 mt-6\">\s*<h3[^>]*>Product Details</h3>)"
timeline_code = r"""<OrderJourneyTimeline />
                
                \1"""

if "OrderJourneyTimeline" not in content:
    content = content.replace("import PriceDisplay from '@/components/PriceDisplay';", "import PriceDisplay from '@/components/PriceDisplay';\nimport OrderJourneyTimeline from '@/components/OrderJourneyTimeline';")
    content = re.sub(target_desc, timeline_code, content, count=1)
    print("Injected OrderJourneyTimeline.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Patch complete.")
