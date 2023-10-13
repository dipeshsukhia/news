import React from "react";
import Container from "react-bootstrap/Container";
import { Link } from "react-router-dom";
import ScrollButton from "./ScrollButton";
import NavBar from "./NavBar";
import { LoadProgressProvider } from "../../context/LoadProgressProvider";
import { CountryProvider } from "../../context/CountryProvider";

const Layout = (props) => {
  return (
    <LoadProgressProvider>
      <CountryProvider>
        <NavBar />
        <Container fluid className="mb-5">
          {props.children}
          <ScrollButton />
        </Container>
        <footer className="navbar bg-dark text-white justify-content-center fixed-bottom">
          Copyright © {new Date().getFullYear()}&nbsp;
          <Link
            to="https://dipeshsukhia.github.io/"
            className=" text-bg-dark text-decoration-none"
            target="_blnk"
          >
            Dipesh Sukhia.
          </Link>
          <span className="d-none d-sm-block">&nbsp;All Rights Reserved.</span>
        </footer>
      </CountryProvider>
    </LoadProgressProvider>
  );
};

export default Layout;
