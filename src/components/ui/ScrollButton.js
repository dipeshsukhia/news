import React, { useState } from "react";
import Button from "react-bootstrap/Button";

const ScrollButton = () => {
  const [visible, setVisible] = useState(false);

  const toggleVisible = () => {
    const scrolled = document.documentElement.scrollTop;
    setVisible(scrolled > 300);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  window.addEventListener("scroll", toggleVisible);

  return (
    <div
      className={`position-fixed end-0 mx-2 cursor-pointer ${
        visible ? "d-block" : "d-none"
      }`}
      style={{
        bottom: "50px",
      }}
    >
      <Button
        variant="dark"
        onClick={scrollToTop}
        className="rounded-circle border-5"
      >
        &#8593;
      </Button>
    </div>
  );
};

export default ScrollButton;
