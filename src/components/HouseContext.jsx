import { createContext, useEffect, useReducer, useState } from "react";

// import data
import { housesData } from "../data";

// create context
export const HouseContext = createContext();

// create a function that checks if the string includes '(any)'
function isDefault(str) {
  return str.split(" ").includes("(any)");
}

const initialState = {
  houses: housesData,
  country: "Location (any)",
  countries: [],
  property: "Property type (any)",
  properties: [],
  price: "Price range (any)",
  loading: false,
};
function reducer(state, action) {
  switch (action.type) {
    case "houses/data":
      return { ...state, houses: action.payload };
    case "country/item":
      return { ...state, country: action.payload };
    case "countries/list":
      return { ...state, countries: action.payload };
    case "property/value":
      return { ...state, property: action.payload };
    case "property/set":
      return { ...state, properties: action.payload };
    case "price/set":
      return { ...state, price: action.payload };
    case "loading/set":
      return { ...state, loading: action.payload };
    default:
      throw new Error("Unknown action");
  }
}

const HouseContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { houses, country, property, price } = state;
  // return all countries
  useEffect(() => {
    const allCountries = houses.map((house) => house.country);
    // remove dublicates
    const uniqueCountries = ["Location (any)", ...new Set(allCountries)];
    // set countries
    dispatch({ type: "countries/list", payload: uniqueCountries });
  }, []);
  // return all properties
  useEffect(() => {
    const allProperties = houses.map((house) => house.type);
    // remove dublicates
    const uniqueProperties = ["Location (any)", ...new Set(allProperties)];
    // set properties
    dispatch({ type: "property/set", payload: uniqueProperties });
  }, []);

  const handleClick = () => {
    dispatch({ type: "loading/set", payload: true });

    // get first value of price and parse it to number
    const minPrice = parseInt(price.split(" ").at(0));
    // get second value of price and parse it to number
    const maxPrice = parseInt(price.split(" ").at(-1));
    const newHouses = housesData.filter((house) => {
      const housePrice = parseInt(house.price);
      // if all values are selected
      if (
        house.country === country &&
        house.type === property &&
        housePrice >= minPrice &&
        housePrice <= maxPrice
      ) {
        return house;
      }
      // if all value are default
      if (isDefault(country) && isDefault(property) && isDefault(price))
        return house;
      // if country is not default
      if (!isDefault(country) && isDefault(property) && isDefault(price))
        return house.country === country;
      // if propery is not default
      if (!isDefault(property) && isDefault(country) && isDefault(price))
        return house.type === property;
      // if price is not default
      if (!isDefault(price) && isDefault(country) && isDefault(property)) {
        if (housePrice >= minPrice && housePrice <= maxPrice) return house;
      }
      // if country & property is not default
      if (!isDefault(country) && !isDefault(property) && isDefault(price))
        return house.country === country && house.type === property;
      // if country and price is not default
      if (!isDefault(country) && isDefault(property) && !isDefault(price)) {
        if (housePrice >= minPrice && housePrice <= maxPrice)
          return house.country === country;
      }
      // property and price is not default
      if (!isDefault(country) && !isDefault(property) && !isDefault(price)) {
        if (housePrice >= minPrice && housePrice <= maxPrice)
          return house.type === property;
      }
    });
    setTimeout(() => {
      return (
        newHouses.length < 1
          ? dispatch({ type: "houses/data", payload: [] })
          : dispatch({ type: "houses/data", payload: newHouses }),
        dispatch({ type: "loading/set", pauload: false })
      );
    }, 1000);
  };

  return (
    <HouseContext.Provider
      value={{
        state,
        handleClick,
        dispatch,
      }}
    >
      {children}
    </HouseContext.Provider>
  );
};

export default HouseContextProvider;
