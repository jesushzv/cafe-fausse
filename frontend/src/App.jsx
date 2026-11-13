import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import ReservationsPage from "./pages/ReservationsPage";
import AboutPage from "./pages/AboutPage";
import GalleryPage from "./pages/GalleryPage";

function NotFoundPage() {
  return (
    <section className="section">
      <div className="container text-center">
        <span className="section-header__eyebrow">404 &bull; Page Not Found</span>
        <h1 className="page-header__title" style={{ color: "var(--text-dark)" }}>
          We Couldn&apos;t Find That Page
        </h1>
        <p className="section-header__subtitle" style={{ marginInline: "auto", marginBottom: "1.75rem" }}>
          The page you are looking for may have moved or does not exist. Explore our menu,
          reserve a table, or return to the Café Fausse home page.
        </p>
        <Link to="/" className="btn btn-gold">
          Return to Home
        </Link>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="app-shell">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
