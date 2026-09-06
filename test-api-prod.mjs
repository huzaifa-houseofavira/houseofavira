async function run() {
  const res = await fetch("https://www.houseofavira.shop/api/products");
  if (!res.ok) {
     console.error("API error: " + res.status);
     return;
  }
  const products = await res.json();
  console.log(`API returned ${products.length} products`);
}
run().catch(console.error);
