import Available from "@/components/pages/home/Available";
import Banner from "@/components/pages/home/Banner";
import FridaySale from "@/components/pages/home/FridaySale";
import HotSale from "@/components/pages/home/HotSale";
import NewArrivals from "@/components/pages/home/NewArrivals";
import Newsletter from "@/components/pages/home/NewsLater";

export const metadata = {
  title: "Blackaboij | Premium Fashion & Lifestyle Store",
  description:
    "Blackaboij is a premium fashion and lifestyle brand offering modern clothing and accessories.",
};

export default function Home() {
  return (
    <main>
      {/* SEO + accessibility H1 (no visual impact) */}
      <h1 className="visually-hidden">
        Blackaboij – Premium Fashion & Lifestyle Store
      </h1>

      <Banner />
      <NewArrivals />
      <FridaySale />
      <HotSale />
      <Newsletter />
      <Available />
    </main>
  );
}

