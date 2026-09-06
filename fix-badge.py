import re

path = r"src/app/product/[id]/ProductClient.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Remove the badge from its current location
# The badge starts with {/* Animated Batch Badge */} and ends with </div> right before <button onClick={handleWishlist}
badge_regex = r"\s*\{\/\*\s*Animated Batch Badge\s*\*\/\}.*?(?=<button\s+onClick=\{handleWishlist\})"
content = re.sub(badge_regex, "\n                        ", content, flags=re.DOTALL)


# Now inject it AFTER the flex container that holds the buttons.
# The flex container ends with </div>, just after the Heart button.
wishlist_button_regex = r"(<button\s+onClick=\{handleWishlist\}[^>]*>.*?<Heart[^>]*>.*?</button>\s*</div>)"

good_badge_block = r"""\1
                      
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

content = re.sub(wishlist_button_regex, good_badge_block, content, flags=re.DOTALL)
print("Badge fixed.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
