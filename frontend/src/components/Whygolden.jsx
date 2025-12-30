import React from "react";
import "../styles/Whygolden.css";
import img2 from "../assets/217870.jpg"; 
import { useNavigate } from "react-router-dom";

import { GoPeople } from "react-icons/go";
import { CiMap, CiStar } from "react-icons/ci";
import { LuLeaf } from "react-icons/lu";

export default function WhyGolden() {
  const navigate = useNavigate();

  return (
    <section className="why-golden-section">
      {/* ─── Heading ─── */}
      <h2 className="why-golden-title">Why Smart TMS?</h2>
      <div className="why-golden-underline" />

      {/* ─── Text & Image Row ─── */}
      <div className="why-golden-container">
        <div className="why-golden-text">
          <h3 className="why-golden-subtitle">
            Crafting Unforgettable Journeys Since 2003
          </h3>

          <p className="why-golden-description">
            For over two decades, we’ve crafted immersive journeys that connect
            travelers with authentic experiences and extraordinary destinations.
            Our passion for travel and deep local connections allow us to create
            unique itineraries that go beyond typical tourist routes.
          </p>
          <p className="why-golden-description">
            We believe travel should transform, inspire, and connect. Every
            journey with us is designed to provide meaningful experiences that
            create lasting memories while respecting local cultures and
            environments.
          </p>

          <button
            className="read-more-btn"
            onClick={() => navigate("/about")}
          >
            Read More About Our Story
          </button>
        </div>

        <div className="why-golden-image">
          <img src={img2} alt="Why Golden" />
        </div>
      </div>

      {/* ─── Feature Cards with Decorative Lines ─── */}
      <div className="feature-wrapper">
        <div className="why-golden-features">
          <div className="feature-box">
            <div className="feature-header">
              <span className="icon-box">
                <GoPeople className="feature-icon" />
              </span>
              <h4 className="feature-title">
                Small‑Group <br /> Travel
              </h4>
            </div>
            <p className="feature-desc">
              Intimate experiences with like‑minded travelers, never exceeding
              16 people per group.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-header">
              <span className="icon-box">
                <CiMap className="feature-icon" />
              </span>
              <h4 className="feature-title">
                Expert Local <br /> Guides
              </h4>
            </div>
            <p className="feature-desc">
              Passionate, knowledgeable locals who share authentic insights into
              their homeland.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-header">
              <span className="icon-box">
                <CiStar className="feature-icon" />
              </span>
              <h4 className="feature-title">
                Unique <br /> Experiences
              </h4>
            </div>
            <p className="feature-desc">
              Access to off‑the‑beaten‑path locations and authentic cultural
              exchanges.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-header">
              <span className="icon-box">
                <LuLeaf className="feature-icon" />
              </span>
              <h4 className="feature-title">
                Sustainable <br /> Tourism
              </h4>
            </div>
            <p className="feature-desc">
              Responsible travel practices that respect local communities and
              environments.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
