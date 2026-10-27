import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Navbar from "./shared/Navbar";
import HeroSection from "./HeroSection";
import CategoryCarousel from "./CategoryCarousel";
import LatestJobs from "./LatestJobs";
import Footer from "./Footer";
import useGetAllJobs from "./hooks/useGetAllJobs";

const Home = () => {
  const user = useSelector((state) => state.auth.user);

  useGetAllJobs();

  if (user?.role === "recruiter") {
    return <Navigate to="/admin/companies" replace />;
  }

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <CategoryCarousel />
        <LatestJobs />
      </main>
      <Footer />
    </>
  );
};

export default Home;
