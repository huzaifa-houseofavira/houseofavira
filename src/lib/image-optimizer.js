export function optimizeCloudinaryUrl(url, width = 800) {
  if (!url || typeof url !== 'string') return url;
  
  // Only optimize if it's a Cloudinary URL
  if (!url.includes('res.cloudinary.com')) return url;
  
  // If it already has transformations (like q_auto, w_), don't mess with it
  if (url.includes('/upload/q_') || url.includes('/upload/w_')) return url;

  // Insert q_auto,f_auto,w_{width} after /upload/
  return url.replace('/upload/', `/upload/q_auto,f_auto,w_${width}/`);
}
