import { createContext, useState, useEffect, useContext } from "react";
import countries from "../data/countries.json";

export const CountryContext = createContext();

export const CountryProvider = (props) => {
  const [country, setcountry] = useState(() => {
    const storedCountry = localStorage.getItem("country");
    return storedCountry ? storedCountry : "in";
  });

  useEffect(() => {
    localStorage.setItem("country", country);
  }, [country]);

  return (
    <CountryContext.Provider value={{ country, setcountry, countries }}>
      {props.children}
    </CountryContext.Provider>
  );
};

export const useCountry = () => {
  return useContext(CountryContext);
};
