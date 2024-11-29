import React from "react";
import "./loading.css";

function LoadingSpinner({ isBg }) {
  return (
    <div className={`${isBg ? "bg-spinner-container" : "spinner-container"}`}>
      <div className="spinner"></div>
    </div>
  );
}

export default LoadingSpinner;
