import React from "react";
import { Link } from "react-router-dom";
import { RESTAURANT_INFO } from "../data/cafeData";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__brand">{RESTAURANT_INFO.name}</div>
            <p className="footer__tagline">{RESTAURANT_INFO.tagline}</p>
          </div>

          <div>
            <h3 className="footer__heading">Location &amp; Contact</h3>
            <p className="footer__text">{RESTAURANT_INFO.address}</p>
            <p className="footer__text">
              <a
                href={`tel:${RESTAURANT_INFO.phone.replace(/[^0-9]/g, "")}`}
                className="footer__link"
              >
                {RESTAURANT_INFO.phone}
              </a>
            </p>
          </div>

          <div>
            <h3 className="footer__heading">Dining Hours</h3>
            <p className="footer__text">{RESTAURANT_INFO.hours.monSat}</p>
            <p className="footer__text">{RESTAURANT_INFO.hours.sunday}</p>
          </div>

          <div>
            <h3 className="footer__heading">Explore</h3>
            <ul className="footer__links">
              <li>
                <Link to="/" className="footer__link">Home</Link>
              </li>
              <li>
                <Link to="/menu" className="footer__link">Menu</Link>
              </li>
              <li>
                <Link to="/reservations" className="footer__link">Reservations</Link>
              </li>
              <li>
                <Link to="/about" className="footer__link">About Us</Link>
              </li>
              <li>
                <Link to="/gallery" className="footer__link">Gallery</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>
            &copy; {new Date().getFullYear()} {RESTAURANT_INFO.name}. All rights reserved.
          </span>
          <span>Washington, DC</span>
        </div>
      </div>
    </footer>
  );
}
