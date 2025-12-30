import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactDOM from "react-dom";
import { MapPin, Search, Calendar, AlertCircle } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/Home.css";
import homevid1 from "../assets/homevid1.mp4";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [endDateError, setEndDateError] = useState("");

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const navigate = useNavigate();

  const PopperContainer = ({ children, containerRef }) =>
    containerRef?.current ? ReactDOM.createPortal(children, containerRef.current) : null;

  const onStartDateChange = (date) => {
    setStartDate(date);
    setEndDateError("");
    if (endDate && date && endDate < date) {
      setEndDate(null);
    }
  };

  const onEndDateChange = (date) => {
    if (!startDate) {
      setEndDateError("Please select start date first");
      return;
    }
    if (date < startDate) {
      setEndDateError("End date cannot be before start date");
      return;
    }
    setEndDate(date);
    setEndDateError("");
  };

  const onEndCalendarOpen = () => {
    if (!startDate) setEndDateError("Please select start date first");
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("query", searchQuery.trim());
    if (startDate) params.set("start_date", startDate.toISOString().split("T")[0]);
    if (endDate) params.set("end_date", endDate.toISOString().split("T")[0]);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="home-section">
      <video autoPlay muted loop className="home-video">
        <source src={homevid1} type="video/mp4" />
      </video>
      <div className="overlay">
        <div className="home-content">
          <h1 className="hero-title">Find Your Perfect Journey</h1>
          <p className="hero-description">
            Explore handpicked destinations and customize your travel experiences. Where will you go next?
          </p>
 
          <div className="search-field-wrapper">
            <div className="search-field-container">
              <div className="search-boxes">
                <MapPin size={18} className="icon" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="vertical-separator"></div>

              <div className="date-inline-box">
                <div className="date-inline-field" ref={startDateRef}>
                  <Calendar size={16} className="calendar-icon" />
                  <DatePicker
                    selected={startDate}
                    onChange={onStartDateChange}
                    placeholderText="Start date"
                    dateFormat="MM/dd/yyyy"
                    className="inline-datepicker"
                    autoComplete="off"
                    onKeyDown={(e) => e.preventDefault()}
                    minDate={new Date()}
                    popperPlacement="bottom-start"
                    popperContainer={(props) => (
                      <PopperContainer {...props} containerRef={startDateRef} />
                    )}
                  />
                </div>

                <span className="separator">—</span>

                <div className="date-inline-field end-date-wrapper" ref={endDateRef}>
                  <Calendar size={16} className="calendar-icon" />
                  <DatePicker
                    selected={endDate}
                    onChange={onEndDateChange}
                    onCalendarOpen={onEndCalendarOpen}
                    placeholderText="End date"
                    dateFormat="MM/dd/yyyy"
                    className="inline-datepicker"
                    autoComplete="off"
                    onKeyDown={(e) => e.preventDefault()}
                    minDate={startDate || new Date()}
                    popperPlacement="bottom-start"
                    popperContainer={(props) => (
                      <PopperContainer {...props} containerRef={endDateRef} />
                    )}
                  />
                </div>
              </div>

              <button className="search-btn" onClick={handleSearch}>
                Search <Search size={16} />
              </button>
            </div>

            {endDateError && (
              <div className="error-popup" role="alert">
                <AlertCircle size={16} />
                <span>{endDateError}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
