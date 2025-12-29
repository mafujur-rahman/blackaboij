const BASE_URL = "https://api.blackaboij.com";

export const getImageUrl = (path) => {
  if (!path) return "/images/placeholder.png";

  // Already absolute
  if (path.startsWith("http")) return path;

  // Ensure single slash
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};
