import Banner from "@/components/pages/home/Banner";
import FridaySale from "@/components/pages/home/FridaySale";
import NewArrivals from "@/components/pages/home/NewArrivals";
import Navbar from "@/components/shared/Navbar";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Banner />
      <NewArrivals />
      <FridaySale />
    </div>
  );
}
