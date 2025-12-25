"use client"; // make the page itself a client component

import SearchHome from "@/components/search/Search";

export const dynamic = "force-dynamic"; // ensures CSR, no pre-render

export default function SearchPage() {
  return <SearchHome />;
}
