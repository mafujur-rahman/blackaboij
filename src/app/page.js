import Available from "@/components/pages/home/Available";
import Banner from "@/components/pages/home/Banner";
import FridaySale from "@/components/pages/home/FridaySale";
import HotSale from "@/components/pages/home/HotSale";
import NewArrivals from "@/components/pages/home/NewArrivals";
import Newsletter from "@/components/pages/home/NewsLater";
import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Banner />
      <NewArrivals />
      <FridaySale />
      <HotSale />
      <Newsletter />
      <Available />
      <Footer />
    </div>
  );
}
