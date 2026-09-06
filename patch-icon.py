import os

path = r"src/components/OrderJourneyTimeline.jsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("PackageCheck", "CheckCircle")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched OrderJourneyTimeline.jsx")
