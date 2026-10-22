import Portfolio from "@/components/Portfolio";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Navbar />
      <Portfolio />
    </main>
  );
}