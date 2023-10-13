import React from "react";
import Layout from "./components/ui/Layout";
import News from "./components/news/News";
import { Routes, Route } from "react-router-dom";
import categories from "./data/categories.json";
import NotFound404 from "./components/ui/NotFound404";


const App = () => {
  return (    
      <Layout>
        <Routes>
          <Route
            exact
            path="/"
            element={<News key="home" />}
          />
          {categories.map((category) => {
            return (
              <Route
                exact
                path={`/${category}`}
                key={category}
                element={
                  <News
                    key={category}
                    category={category}
                  />
                }
              />
            );
          })}
          <Route
            path="*"
            element={<NotFound404/>}
          />
        </Routes>
        
      </Layout>
  );
};

export default App;
