import os

path = r"src/app/product/[id]/ProductClient.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

import_statement = "import OrderJourneyTimeline from '@/components/OrderJourneyTimeline';\n"
if "OrderJourneyTimeline from" not in content:
    content = content.replace("import ProductCard from '@/components/ProductCard';", "import ProductCard from '@/components/ProductCard';\n" + import_statement)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Import injected.")
else:
    print("Import already exists.")
