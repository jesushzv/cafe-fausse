import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MENU_CATEGORIES, FEATURED_DISHES } from "../data/cafeData";

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const visibleCategories =
    selectedCategory === "all"
      ? MENU_CATEGORIES
      : MENU_CATEGORIES.filter((cat) => cat.id === selectedCategory);

  return (
    <div>
      <section className="page-header">
        <div className="container">
          <span className="page-header__eyebrow">Culinary Offerings</span>
          <h1 className="page-header__title">Our Menu</h1>
          <p className="page-header__subtitle">
            Traditional Italian flavors elevated with modern culinary innovation.
          </p>
          <hr className="gold-divider" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Interactive Flexbox Category Filter Bar */}
          <div className="filter-tabs" role="tablist" aria-label="Menu Categories">
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === "all"}
              className={`filter-tab ${selectedCategory === "all" ? "filter-tab--active" : ""}`}
              onClick={() => setSelectedCategory("all")}
            >
              All
            </button>
            {MENU_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={selectedCategory === category.id}
                className={`filter-tab ${
                  selectedCategory === category.id ? "filter-tab--active" : ""
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Categorized Menu Items (FR-5) */}
          {visibleCategories.map((category) => (
            <section key={category.id} className="menu-section">
              <h2 className="menu-category__title">{category.name}</h2>
              <div className="grid-2">
                {category.items.map((item) => (
                  <article key={item.id} className="menu-item">
                    <div className="menu-item__header">
                      <span className="menu-item__name">{item.name}</span>
                      <span className="menu-item__dots" aria-hidden="true" />
                      <span className="menu-item__price">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="menu-item__desc">{item.description}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      {/* Chef's Visual Highlights */}
      <section className="section section-cream">
        <div className="container">
          <div className="section-header">
            <span className="section-header__eyebrow">Chef&apos;s Visual Highlights</span>
            <h2 className="section-header__title">Featured Plates</h2>
            <p className="section-header__subtitle">
              A closer look at three guest favorites from our dinner service.
            </p>
            <hr className="gold-divider" />
          </div>

          <div className="grid-3">
            {FEATURED_DISHES.map((dish) => (
              <article key={dish.id} className="dish-card">
                <div className="dish-card__media">
                  <img src={dish.image} alt={dish.alt} loading="lazy" />
                </div>
                <div className="dish-card__body">
                  <div className="dish-card__header">
                    <h3 className="dish-card__title">{dish.name}</h3>
                    <span className="dish-card__price">${dish.price.toFixed(2)}</span>
                  </div>
                  <p className="dish-card__desc">{dish.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="flex justify-center" style={{ marginTop: "3rem" }}>
            <Link to="/reservations" className="btn btn-gold">
              Reserve Your Table
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
