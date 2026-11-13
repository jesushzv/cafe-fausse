/**
 * Centralized SRS Content & Configuration Data for Café Fausse (NFR-9)
 * Single source of truth for restaurant details, menu items, history, awards, and reviews.
 */

export const RESTAURANT_INFO = {
  name: "Café Fausse",
  tagline: "Fine Italian Dining Blending Tradition with Modern Culinary Innovation",
  address: "1234 Culinary Ave, Suite 100, Washington, DC 20002",
  phone: "(202) 555-4567",
  hours: {
    monSat: "Monday–Saturday: 5:00 PM – 11:00 PM",
    sunday: "Sunday: 5:00 PM – 9:00 PM",
  },
  capacityTables: 30,
};

export const MENU_CATEGORIES = [
  {
    id: "starters",
    name: "Starters",
    items: [
      {
        id: "bruschetta",
        name: "Bruschetta",
        description: "Fresh tomatoes, basil, olive oil, and toasted baguette slices",
        price: 8.5,
      },
      {
        id: "caesar-salad",
        name: "Caesar Salad",
        description: "Crisp romaine with homemade Caesar dressing",
        price: 9.0,
      },
    ],
  },
  {
    id: "main-courses",
    name: "Main Courses",
    items: [
      {
        id: "grilled-salmon",
        name: "Grilled Salmon",
        description: "Served with lemon butter sauce and seasonal vegetables",
        price: 22.0,
      },
      {
        id: "ribeye-steak",
        name: "Ribeye Steak",
        description: "12 oz prime cut with garlic mashed potatoes",
        price: 28.0,
      },
      {
        id: "vegetable-risotto",
        name: "Vegetable Risotto",
        description: "Creamy Arborio rice with wild mushrooms",
        price: 18.0,
      },
    ],
  },
  {
    id: "desserts",
    name: "Desserts",
    items: [
      {
        id: "tiramisu",
        name: "Tiramisu",
        description: "Classic Italian dessert with mascarpone",
        price: 7.5,
      },
      {
        id: "cheesecake",
        name: "Cheesecake",
        description: "Creamy cheesecake with berry compote",
        price: 7.0,
      },
    ],
  },
  {
    id: "beverages",
    name: "Beverages",
    items: [
      {
        id: "red-wine",
        name: "Red Wine (Glass)",
        description: "A selection of Italian reds",
        price: 10.0,
      },
      {
        id: "white-wine",
        name: "White Wine (Glass)",
        description: "Crisp and refreshing",
        price: 9.0,
      },
      {
        id: "craft-beer",
        name: "Craft Beer",
        description: "Local artisan brews",
        price: 6.0,
      },
      {
        id: "espresso",
        name: "Espresso",
        description: "Strong and aromatic",
        price: 3.0,
      },
    ],
  },
];

export const ABOUT_CONTENT = {
  foundedYear: 2010,
  story:
    "Founded in 2010 by Chef Antonio Rossi and restaurateur Maria Lopez, Café Fausse blends traditional Italian flavors with modern culinary innovation.",
  mission:
    "Our mission is to provide an unforgettable dining experience that reflects both quality and creativity.",
  founders: [
    {
      id: "antonio-rossi",
      name: "Chef Antonio Rossi",
      role: "Co-Founder & Executive Chef",
      bio: "Trained in classic Northern and Central Italian kitchens before bringing his craft to Washington, DC, Chef Antonio Rossi pairs heritage recipes with seasonal modern techniques.",
    },
    {
      id: "maria-lopez",
      name: "Maria Lopez",
      role: "Co-Founder & Restaurateur",
      bio: "With over two decades in fine-dining hospitality, Maria Lopez curates Café Fausse's warm mahogany atmosphere, attentive service culture, and Italian cellar selections.",
    },
  ],
  pillars: [
    {
      id: "unforgettable-dining",
      title: "Unforgettable Dining",
      description:
        "Intimate chandelier-lit hospitality designed around unhurried conversation and attentive table service.",
    },
    {
      id: "excellent-food",
      title: "Excellent Food",
      description:
        "Time-honored Italian preparations elevated with modern technique, house-made dressings, and prime cuts.",
    },
    {
      id: "locally-sourced",
      title: "Locally Sourced Ingredients",
      description:
        "Seasonal produce, wild mushrooms, and artisan selections sourced from regional Mid-Atlantic farms and purveyors.",
    },
  ],
};

export const AWARDS = [
  { id: "culinary-excellence-2022", title: "Culinary Excellence Award", year: "2022" },
  { id: "restaurant-of-the-year-2023", title: "Restaurant of the Year", year: "2023" },
  {
    id: "best-fine-dining-2023",
    title: "Best Fine Dining Experience – Foodie Magazine",
    year: "2023",
  },
];

export const REVIEWS = [
  {
    id: "gourmet-review",
    quote: "Exceptional ambiance and unforgettable flavors.",
    source: "Gourmet Review",
  },
  {
    id: "daily-bite",
    quote: "A must-visit restaurant for food enthusiasts.",
    source: "The Daily Bite",
  },
];

export const GALLERY_IMAGES = [
  {
    id: "home-ambiance",
    src: "/images/home-cafe-fausse.webp",
    alt: "Café Fausse main dining room with warm chandelier lighting",
    category: "Interior Ambiance",
  },
  {
    id: "cafe-interior",
    src: "/images/gallery-cafe-interior.webp",
    alt: "Intimate evening table setting inside Café Fausse",
    category: "Interior Ambiance",
  },
  {
    id: "ribeye-steak",
    src: "/images/gallery-ribeye-steak.webp",
    alt: "12 oz prime cut Ribeye Steak with garlic mashed potatoes",
    category: "Dishes from the Menu",
  },
  {
    id: "special-event",
    src: "/images/gallery-special-event.webp",
    alt: "Private dining celebration and chef's tasting service at Café Fausse",
    category: "Special Events",
  },
];

