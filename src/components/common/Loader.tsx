import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <img
        src="/loader.svg" // Path to your loading SVG file
        alt="Loading..."
        className="h-12 w-12 animate-spin" // You can adjust size and animation here
      />
    </div>
  );
};

export default Loader;
