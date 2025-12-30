import React, { useState, useEffect } from "react";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axiosInstance";
import "../styles/trending.css";

export default function TrendingTours() {
  const [groupToursData, setGroupToursData] = useState(null);
  const [liked, setLiked] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingWishIds, setLoadingWishIds] = useState(new Set());
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const truncate = (text, maxLength = 100) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  useEffect(() => {
    const fetchGroupTours = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get("/destinations/group-tours/");
        setGroupToursData(res.data);
      } catch (err) {
        console.error("Failed to fetch group tours", err);
        setError("Failed to load group tours");
      } finally {
        setLoading(false);
      }
    };
    fetchGroupTours();
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const res = await axiosInstance.get("/destinations/wishlist/");
        const tripMap = {};
        res.data.results.forEach((item) => {
          tripMap[item.deal] = item.id;
        });
        setLiked(tripMap);
      } catch (err) {
        console.error("Failed to fetch wishlist", err);
        toast.error("Failed to load wishlist");
      }
    };
    fetchWishlist();
  }, []);

  const toggleFavorite = async (tripId) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.info("Please log in to use wishlist");
      navigate("/login");
      return;
    }

    if (loadingWishIds.has(tripId)) return;

    setLoadingWishIds((prev) => new Set(prev).add(tripId));

    const wishlistId = liked[tripId];
    try {
      if (wishlistId) {
        await axiosInstance.delete(`/destinations/wishlist/${wishlistId}/`);
        setLiked((prev) => {
          const next = { ...prev };
          delete next[tripId];
          return next;
        });
        toast.success("Removed from wishlist");
      } else {
        const res = await axiosInstance.post("/destinations/wishlist/", { deal: tripId });
        setLiked((prev) => ({ ...prev, [tripId]: res.data.id }));
        toast.success("Added to wishlist");
      }
    } catch (err) {
      console.error("Wishlist error", err);
      toast.error(wishlistId ? "Failed to remove from wishlist" : "Failed to add to wishlist");
    } finally {
      setLoadingWishIds((prev) => {
        const next = new Set(prev);
        next.delete(tripId);
        return next;
      });
    }
  };

  const groupTours = groupToursData?.results || [];

  return (
    <section className="trend-section">
      <h2 className="trend-title">Trending Group Tours</h2>
      <div className="trend-underline" /> {/* ✅ underline restored */}
      <p className="trend-subtitle">
        Discover our carefully selected destinations that promise unforgettable experiences and breathtaking landscapes.
      </p>

      {loading && <p>Loading group tours...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && groupTours.length === 0 && <p>No group tours available at the moment.</p>}

      <div className="trend-card-container">
        {!loading &&
          groupTours.map((trip) => (
            <div
              key={trip.id}
              className="trend-card"
              style={{ backgroundImage: trip.image ? `url(${trip.image})` : "none" }}
            >
              {/* ✅ Badge in top-left corner */}
              {trip.tag && (
                <div className="trend-badge-wrapper">
                  <div className="trend-badge">{trip.tag}</div>
                </div>
              )}

              <div className="trend-card-top">
                <div
                  className={`trend-heart ${liked[trip.id] ? "active" : ""}`}
                  onClick={() => toggleFavorite(trip.id)}
                  style={{ cursor: loadingWishIds.has(trip.id) ? "not-allowed" : "pointer" }}
                  role="button"
                  aria-pressed={!!liked[trip.id]}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") toggleFavorite(trip.id);
                  }}
                >
                  {liked[trip.id] ? (
                    <FaHeart className="heart-icon filled" size={18} />
                  ) : (
                    <CiHeart className="heart-icon outline" size={20} />
                  )}
                </div>
              </div>

              <div className="trend-content">
                <h3 className="trend-trip-title">{trip.title}</h3>
                <p className="trend-trip-desc">{truncate(trip.description, 100)}</p>
                <div className="trend-trip-days">{trip.days} days</div>
                <div className="trend-action-row">
                  <button
                    className="trend-details-btn"
                    onClick={() =>
                      navigate(`/destinations/${trip.country?.slug || "country"}/deal/${trip.slug || trip.id}`)
                    }
                  >
                    See Details
                  </button>
                  <div className="trend-price">
                    <span className="trend-discounted">${trip.price}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="trend-btn-wrapper">
        <button className="trend-view-btn" onClick={() => navigate("/alldestinations")}>
          View All Destinations <IoIosArrowForward />
        </button>
      </div>
    </section>
  );
}
