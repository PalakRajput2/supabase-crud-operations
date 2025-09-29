import React from "react";

const Loader = () => {
  return (
    <div
      id="loader"
      className="d-flex justify-content-center align-items-center vh-100"
    >
      <div
        className="spinner-border text-primary"
        role="status"
        style={{ width: "5rem", height: "5rem" }} // 🔹 bigger size
      >
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;
