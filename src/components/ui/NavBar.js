import React, { useContext, useRef } from "react";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { NavLink } from "react-router-dom";
import categories from "../../data/categories.json";
import { useCountry } from "../../context/CountryProvider";

const NavBar = () => {
  const { country, setcountry, countries } = useCountry();
  const navbarCollapse = useRef();
  const collapseNavBar = () => window.innerWidth < 992 && navbarCollapse.current.click();
  const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);
  
  return (
    <Navbar expand="lg" sticky="top" bg="dark" data-bs-theme="dark">
      <Container fluid>
        <NavLink className="navbar-brand" to="/">
          {process.env.REACT_APP_NAME}
        </NavLink>
        <Navbar.Toggle ref={navbarCollapse} aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {categories.map((category) => {
              return (
                <Nav.Item key={category}>
                  <NavLink className="nav-link" to={`/${category}`} onClick={collapseNavBar}>
                    {capitalizeFirstLetter(category)}
                  </NavLink>
                </Nav.Item>
              );
            })}
          </Nav>
          <Form className="d-flex" id="countrySelector">
            <Form.Select
              className="bg-dark text-white"
              onChange={(e) => {setcountry(e.target.value); collapseNavBar();}}
              value={country}
            >
              {countries.map((country) => {
                return (
                  <option value={country} key={country}>
                    {country.toUpperCase()}
                  </option>
                );
              })}
            </Form.Select>
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
