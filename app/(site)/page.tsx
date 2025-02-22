import CutContent from "./components/cut-content";
import Header from "./components/header";
import MainContent from "./components/main-content";

const Home = () => {
  return (
    <div className="flex h-full w-full flex-col justify-between gap-2">
      <Header />
      <MainContent />
      <CutContent />
    </div>
  );
};

export default Home;
