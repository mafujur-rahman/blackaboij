// Cloudinary base
const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/dwsp8rft8/";

// Normalize image URL for next/image
export const getImageUrl = (path) => {
  if (!path) return "/images/new.webp";

  // already full url
  if (path.startsWith("http")) return path;

  // relative cloudinary path
  return `${CLOUDINARY_BASE_URL}${path}`;
};
