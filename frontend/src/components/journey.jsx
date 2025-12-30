import React, { useState, useEffect } from "react";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axiosInstance"; // your custom axios instance
import "../styles/journey.css";

const tabs = ["all", "popular", "new"];

export default function ExclusiveTrips() {
  const [activeTab, setActiveTab] = useState("all");
  const [tripsData, setTripsData] = useState({});
  // liked: object mapping tripId -> wishlistItemId (or undefined if not liked)
  const [liked, setLiked] = useState({});
  const [loadingWishIds, setLoadingWishIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Helper function to truncate text with ellipsis
  const truncate = (text, maxLength = 100) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  // Fetch trips for active tab
  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      setError(null);
      try {
        const filterParam = activeTab === "all" ? "" : `?filter=${activeTab}`;
        const url = `/destinations/travel-deals/${filterParam}`;
        console.log("Fetching trips from:", url);
        const res = await axiosInstance.get(url);
        console.log("API response data:", res.data);
        setTripsData((prev) => ({ ...prev, [activeTab]: res.data }));
      } catch (error) {
        console.error("Failed to load trips", error);
        setError("Failed to load trips");
      } finally {
        setLoading(false);
      }
    };

    if (!tripsData[activeTab]) {
      fetchTrips();
    }
  }, [activeTab, tripsData]);

  // Fetch user's wishlist on mount if token exists
  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return; // Not logged in

      try {
        const res = await axiosInstance.get("/destinations/wishlist/");
        const tripMap = {};
        res.data.results.forEach((item) => {
          tripMap[item.deal] = item.id; // assuming 'deal' matches trip id
        });
        setLiked(tripMap);
      } catch (err) {
        console.error("Failed to fetch wishlist", err);
        toast.error("Failed to load wishlist");
      }
    };
    fetchWishlist();
  }, []);

  // Wishlist toggle with loading indicator per tripId
  const toggleFavorite = async (tripId) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.info("Please log in to use wishlist");
      navigate("/login");
      return;
    }

    if (loadingWishIds.has(tripId)) return; // Prevent double clicks

    setLoadingWishIds((prev) => new Set(prev).add(tripId));

    const wishlistId = liked[tripId];
    try {
      if (wishlistId) {
        // Remove from wishlist
        await axiosInstance.delete(`/destinations/wishlist/${wishlistId}/`);
        setLiked((prev) => {
          const next = { ...prev };
          delete next[tripId];
          return next;
        });
        toast.success("Removed from wishlist");
      } else {
        // Add to wishlist
        const res = await axiosInstance.post("/destinations/wishlist/", {
          deal: tripId,
        });
        setLiked((prev) => ({
          ...prev,
          [tripId]: res.data.id,
        }));
        toast.success("Added to wishlist");
      }
    } catch (err) {
      console.error("Wishlist error", err);
      toast.error(
        wishlistId
          ? "Failed to remove from wishlist"
          : "Failed to add to wishlist"
      );
    } finally {
      setLoadingWishIds((prev) => {
        const next = new Set(prev);
        next.delete(tripId);
        return next;
      });
    }
  };

  const trips = tripsData[activeTab]?.results || [];

  return (
    <section className="exclusive-section">
      <div className="exclusive-header">
        <h2 className="exclusive-title">EXCLUSIVE JOURNEYS</h2>
        <div className="exclusive-subheader">
          <div className="exclusive-tabs">
            {tabs.map((tab) => (
              <span
                key={tab}
                className={`exclusive-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
            ))}
          </div>
          <span
            className="exclusive-explore-link"
            onClick={() => navigate("/alldestinations")}
            style={{ cursor: "pointer" }}
          >
            Explore all trips →
          </span>
        </div>
      </div>

      <div className="exclusive-card-container">
        {loading && <p>Loading trips...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && trips.length === 0 && (
          <p>No trips available for this category.</p>
        )}

        {!loading &&
          trips.map((trip) => (
            <div
              key={trip.id}
              className="exclusive-card"
              style={{ backgroundImage: `url(${trip.image})` }}
            >
              <div className="exclusive-top">
                {trip.tag && (
                  <div className="exclusive-badge-wrapper">
                    <div className="exclusive-badge">{trip.tag}</div>
                  </div>
                )}

                <div
                  className="exclusive-heart"
                  onClick={() => toggleFavorite(trip.id)}
                  style={{ cursor: loadingWishIds.has(trip.id) ? "not-allowed" : "pointer" }}
                >
                  {liked[trip.id] ? (
                    <FaHeart className="heart-icon filled" size={18} />
                  ) : (
                    <CiHeart className="heart-icon outline" size={20} />
                  )}
                </div>
              </div>

              <div className="exclusive-content">
                <h3 className="exclusive-trip-title">{trip.title}</h3>
                <p className="exclusive-trip-desc">{truncate(trip.description, 100)}</p>
                <div className="exclusive-trip-days">{trip.days} days</div>
                <div className="exclusive-action-row">
                <button
                  className="exclusive-details-btn"
                  onClick={() =>
                    navigate(
                      `/destinations/${trip.country?.slug || "country"}/deal/${trip.slug || trip.id}`
                    )
                  }
                >
                  See Details
                </button>
                  <div className="exclusive-price">
                    <span className="exclusive-original">
                      {trip.originalPrice ? `$${trip.originalPrice}` : ""}
                    </span>
                    <span className="exclusive-discounted">${trip.price}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
