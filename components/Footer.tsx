import React from "react";

const Footer = () => {
  return (
    <footer
      className="text-center py-3"
      style={{
        backgroundColor: "#343a40",
        color: "white",
      }}
    >
      <p className="mb-0">
        &copy; {new Date().getFullYear()} SupaNext. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
