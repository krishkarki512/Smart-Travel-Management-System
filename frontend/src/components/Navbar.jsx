import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Heart,
  User,
  Search,
  Phone,
} from "lucide-react";
import { IoLanguageOutline } from "react-icons/io5";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Divide as Hamburger } from "hamburger-react";
import axiosInstance from "../utils/axiosInstance";
import logo from "../assets/logo1.png";
import baliImage from "../assets/bali.jpg";
import "../styles/Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [regions, setRegions] = useState([]);
  const [countriesByRegion, setCountriesByRegion] = useState({});
  const [travelTypes, setTravelTypes] = useState([]);
  const [travelOptions, setTravelOptions] = useState({});
  const [dealCategories, setDealCategories] = useState([]);
  const [dealItems, setDealItems] = useState({});

  const [activeRegion, setActiveRegion] = useState(null);
  const [activeTravelType, setActiveTravelType] = useState(null);
  const [activeDealCategory, setActiveDealCategory] = useState(null);
  const [showDestinations, setShowDestinations] = useState(false);
  const [showWaysToTravel, setShowWaysToTravel] = useState(false);
  const [showDeals, setShowDeals] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showSearchIcon, setShowSearchIcon] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileView, setMobileView] = useState("main");
  const [mobileActiveRegion, setMobileActiveRegion] = useState(null);
  const [activeCountry, setActiveCountry] = useState(null);
  const [move, setMove] = useState(false);

  useEffect(() => {
    axiosInstance.get("destinations/").then((res) => {
      const regionList = res.data.regions.map((r) => r.region_name);
      const map = {};
      res.data.regions.forEach((r) => {
        map[r.region_name] = r.countries.map((c) => ({
          name: c.name,
          slug: c.slug,
        }));
      });
      setRegions(regionList);
      setCountriesByRegion(map);
      setActiveRegion(regionList[0] || null);
    });

    axiosInstance.get("destinations/travel-types/").then((res) => {
      const { types, options = {} } = res.data;
      setTravelTypes(types);
      setTravelOptions(options);
      setActiveTravelType(types[0] || null);
    });

    axiosInstance.get("destinations/deals/").then((res) => {
      const { categories, offers = {} } = res.data;
      setDealCategories(categories);
      setDealItems(offers);
      setActiveDealCategory(categories[0] || null);
    });
  }, []);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("access_token"));
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setShowSearchIcon(window.scrollY > 100);
    if (location.pathname !== "/") {
      setShowSearchIcon(true);
    } else {
      window.addEventListener("scroll", handleScroll);
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === "/") setShowSearchBar(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const dropdowns = document.querySelectorAll(".dropdown");
      if (![...dropdowns].some((el) => el.contains(e.target))) {
        setShowDestinations(false);
        setShowWaysToTravel(false);
        setShowDeals(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsAuthenticated(false);
    setShowProfile(false);
    navigate("/login");
  };

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  const mobileBack = () => {
    if (mobileView === "countries") setMobileView("destinations");
    else setMobileView("main");
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/search?query=${encodeURIComponent(q)}`);
    setShowSearchBar(false);
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo" onClick={handleLogoClick}>
          <img src={logo} alt="Golden Leaf Travels" />
            <span>
              Smart
              <br />
              TMS
            </span>
          </div>

          <div className="hamburger-wrapper">
            <Hamburger
              toggled={isMobileMenuOpen}
              toggle={(t) => {
                setIsMobileMenuOpen(t);
                setMobileView("main");
              }}
              size={20}
            />
          </div>

          <nav className="navbar-links">
            {/* Destinations */}
            <div
              className="dropdown"
              onClick={() => {
                setShowDestinations(!showDestinations);
                setShowWaysToTravel(false);
                setShowDeals(false);
              }}
            >
              <span className="link-item">
                Destinations <ChevronDown size={14} />
              </span>
              {showDestinations && activeRegion && (
                <div className="mega-menu-dest">
                  <div className="mega-columns">
                    {/* Regions column */}
                    <div className="column">
                      <ul>
                        {regions.map((r) => (
                          <li
                            key={r}
                            onClick={() => {
                              setActiveRegion(r);
                              setActiveCountry(null);
                            }}
                            className={activeRegion === r ? "region-active" : ""}
                            onMouseEnter={() => setActiveRegion(r)}
                          >
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Countries column */}
                    <div className="column countries-column">
                      <div className="countries-subcolumns">
                        {(() => {
                          const countries = countriesByRegion[activeRegion] || [];
                          const firstCol = countries.slice(0, 6);
                          const secondCol = countries.slice(6, 12);
                          return (
                            <>
                              <ul>
                                {firstCol.map((c) => (
                                  <li key={c.slug}>
                                    <Link
                                      to={`/destinations/${c.slug}`}
                                      className="plain-link"
                                      onClick={() => {
                                        setActiveCountry(c);
                                        setShowDestinations(false);
                                      }}
                                    >
                                      {c.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                              <ul>
                                {secondCol.map((c) => (
                                  <li key={c.slug}>
                                    <Link
                                      to={`/destinations/${c.slug}`}
                                      className="plain-link"
                                      onClick={() => {
                                        setActiveCountry(c);
                                        setShowDestinations(false);
                                      }}
                                    >
                                      {c.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </>
                          );
                        })()}
                      </div>
                      <button
                        className={`view-all-region-btn ${move ? "move-right" : ""}`}
                        onClick={() => {
                          setMove(true);
                          setShowDestinations(false);
                          navigate(`/destinations/${activeRegion.toLowerCase()}`);
                        }}
                      >
                        View all {activeRegion}
                      </button>
                    </div>
                    {/* Featured card column */}
                    <div className="column image-column">
                      <div className="featured-card">
                        <div className="featured-image-wrapper">
                          <img
                            src={baliImage}
                            alt={activeCountry ? activeCountry.name : activeRegion}
                            className="featured-image"
                          />
                          <div className="featured-overlay">
                            <div className="featured-title">{activeRegion}</div>
                            <div className="featured-desc">
                              {activeCountry
                                ? `Explore ${activeCountry.name} with all our heart and money.`
                                : `Discover unforgettable journeys in ${activeRegion}.`}
                            </div>
                            <Link
                              to={
                                activeCountry
                                  ? `/destinations/${activeCountry.slug}`
                                  : `/destinations/${activeRegion.toLowerCase()}`
                              }
                              className="featured-btn"
                            >
                              View Trip
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Ways to Travel */}
            <div
              className="dropdown"
              onClick={() => {
                setShowWaysToTravel(!showWaysToTravel);
                setShowDestinations(false);
                setShowDeals(false);
              }}
            >
              <span className="link-item">
                Ways to Travel <ChevronDown size={14} />
              </span>
              {showWaysToTravel && activeTravelType && (
                <div className="mega-menu-ways">
                  <div className="mega-columns">
                    <div className="column">
                      <ul>
                        {travelTypes.map((t) => (
                          <li
                            key={t}
                            onClick={() => setActiveTravelType(t)}
                            className={activeTravelType === t ? "active" : ""}
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="column">
                      <ul>
                        {(travelOptions[activeTravelType] || []).map((o) => (
                          <li key={o}>{o}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="column image-column">
                      <img src={baliImage} alt={activeTravelType} />
                      <p className="image-description">
                        Discover flexible adventures with{" "}
                        <strong>{activeTravelType}</strong> style.
                      </p>
                      <Link
                        to={`/ways-to-travel/${activeTravelType.toLowerCase()}`}
                        className="read-more-btn"
                      >
                        Explore More
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Deals */}
            <div
              className="dropdown"
              onClick={() => {
                setShowDeals(!showDeals);
                setShowWaysToTravel(false);
                setShowDestinations(false);
              }}
            >
              <span className="link-item">
                Deals <ChevronDown size={14} />
              </span>
              {showDeals && activeDealCategory && (
                <div className="mega-menu-deals">
                  <div className="mega-columns">
                    <div className="column">
                      <ul>
                        {dealCategories.map((d) => (
                          <li
                            key={d}
                            onClick={() => setActiveDealCategory(d)}
                            className={activeDealCategory === d ? "active" : ""}
                          >
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="column">
                      <ul>
                        {(dealItems[activeDealCategory] || []).map((o) => (
                          <li key={o}>{o}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="column image-column">
                      <img src={baliImage} alt={activeDealCategory} />
                      <p className="image-description">
                        Grab hot deals in <strong>{activeDealCategory}</strong> now!
                      </p>
                      <Link
                        to={`/deals/${activeDealCategory.toLowerCase()}`}
                        className="read-more-btn"
                      >
                        View Offers
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* About Us */}
            <div className="dropdown link-item">
              <span className="dropdown-toggle">About Us</span>
              <div className="dropdown-menu">
                <Link to="/about" className="dropdown-link">
                  Our Stories
                </Link>
                <Link to="/blogs" className="dropdown-link">
                  Blogs
                </Link>
                <Link to="/write" className="dropdown-link">
                  Write for us
                </Link>
              </div>
            </div>
          </nav>

          {/* Desktop Icons */}
          <div className="navbar-icons">
            <button
              className={`search-icon ${showSearchIcon ? "visible" : "hidden"}`}
              onClick={() => setShowSearchBar((p) => !p)}
            >
              <Search size={20} />
            </button>

            <div className="language-switch">
              <IoLanguageOutline size={20} />
            </div>
            <Link
              to="/profile"
              state={{ tab: "favourites" }}
              className="wishlist-icon"
            >
              <Heart size={18} />
            </Link>
            <div className="profile-dropdown">
              <User
                size={18}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (isAuthenticated) setShowProfile(!showProfile);
                  else navigate("/login");
                }}
              />
              {isAuthenticated && showProfile && (
                <div className="profile-menu">
                  <Link to="/profile" className="profile-item">
                    My Profile
                  </Link>
                  <span onClick={handleLogout} className="profile-item">
                    Logout
                  </span>
                </div>
              )}
            </div>
            <Link to="/contact" className="contact-btn" tabIndex={0}>
              Contact Us
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        {showSearchBar && (
          <div className="search-bar-wrapper">
            <form className="search-bar-form" onSubmit={submitSearch}>
              <input
                type="text"
                placeholder="Search destinations, deals..."
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setShowSearchBar(false);
                }}
              />
              <button type="submit" className="search-submit-btn">
                <Search size={18} />
              </button>
              <button
                type="button"
                onClick={() => setShowSearchBar(false)}
                className="search-close-btn"
              >
                ×
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      <div
        className={`mobile-menu-overlay ${isMobileMenuOpen ? "open" : ""}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <aside
        className={`mobile-menu-panel ${isMobileMenuOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mobile-menu-header">
          {mobileView !== "main" && (
            <button className="mobile-back-btn" onClick={mobileBack}>
              <ChevronLeft size={20} /> Back
            </button>
          )}
          <span />
          <button
            className="mobile-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ×
          </button>
        </div>

        {/* Mobile Views */}
        {mobileView === "main" && (
          <ul className="mobile-menu-list">
            <li onClick={() => setMobileView("destinations")}>
              Destinations <ChevronRight size={18} />
            </li>
            <li onClick={() => setMobileView("ways")}>
              Ways to Travel <ChevronRight size={18} />
            </li>
            <li onClick={() => setMobileView("deals")}>
              Deals <ChevronRight size={18} />
            </li>
            <li>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>
                About
              </Link>
            </li>
            <hr className="mobile-divider" />
            <li>
              <Heart size={18} />{" "}
              <Link to="/wishlist" className="with-icon">
                Wishlist
              </Link>
            </li>
            <li>
              <User size={18} />{" "}
              <Link to="/manage-booking" className="with-icon">
                Manage Booking
              </Link>
            </li>
            <li>
              <Phone size={18} />{" "}
              <Link
                to="/contact"
                className="with-icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
            </li>
          </ul>
        )}

        {mobileView === "destinations" && (
          <>
            <h2 className="mobile-subtitle">Destinations</h2>
            <ul className="mobile-menu-list sub">
              {regions.map((r) => (
                <li
                  key={r}
                  onClick={() => {
                    setMobileActiveRegion(r);
                    setMobileView("countries");
                  }}
                >
                  {r} <ChevronRight size={18} />
                </li>
              ))}
            </ul>
          </>
        )}

        {mobileView === "countries" && (
          <>
            <h2 className="mobile-subtitle">{mobileActiveRegion}</h2>
            <ul className="mobile-menu-list sub">
              {(countriesByRegion[mobileActiveRegion] || []).map((c) => (
                <li key={c.slug}>
                  <Link
                    to={`/destinations/${c.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {mobileView === "ways" && (
          <>
            <h2 className="mobile-subtitle">Ways to Travel</h2>
            <ul className="mobile-menu-list sub">
              {travelTypes.map((t) => (
                <li key={t}>
                  <Link
                    to={`/ways-to-travel/${t.toLowerCase()}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {mobileView === "deals" && (
          <>
          <h2 className="mobile-subtitle">Deals</h2>
          <ul className="mobile-menu-list sub">
            {dealCategories.map((d) => (
              <li key={d}>
                <Link
                  to={`/deals/${d.toLowerCase()}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {d}
                </Link>
              </li>
            ))}
          </ul>
        </>
        )}
      </aside>
    </>
  );
}
