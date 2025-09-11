import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import UrlForm from "../components/UrlForm";
import UrlTable from "../components/UrlTable";

export default function Home() {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Header />
      <main className="flex flex-col items-center w-full flex-1 py-1 gap-3">
        <HeroSection compact />
        <UrlForm redirectToRegisterOnSubmit />
        <UrlTable compact />
      </main>
    </div>
  );
}
