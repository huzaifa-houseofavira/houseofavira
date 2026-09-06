import re

path = r"src/app/product/[id]/ProductClient.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

desktop_target = r"""            {/\* Right: Scrolling Details \*/}
            <div className="w-\[55%\] flex flex-col gap-12 pt-4">
              
              {/\* Accordion Details \*/}
              <div className="bg-white rounded-\[2rem\] p-8 shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] border border-neutral-100">
                <h3 className="text-xs uppercase tracking-widest font-bold text-black mb-4" style={{ fontFamily: '"Mona Sans", sans-serif' }}>Product Details</h3>"""

good_desktop_target = """            {/* Right: Scrolling Details */}
            <div className="w-[55%] flex flex-col gap-12 pt-4">
              
              {/* Order Journey Timeline */}
              <OrderJourneyTimeline />
              
              {/* Accordion Details */}
              <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100">
                <h3 className="text-xs uppercase tracking-widest font-bold text-black mb-4" style={{ fontFamily: '"Mona Sans", sans-serif' }}>Product Details</h3>"""

if "Right: Scrolling Details" in content:
    content = re.sub(desktop_target, good_desktop_target, content)
    print("Injected into desktop.")
else:
    print("Desktop target not found.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
