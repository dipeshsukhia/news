import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Alert from "react-bootstrap/Alert";
import axios from "axios";
import Article from "./Article";
import Loader from "../ui/Loader";
import PropTypes from "prop-types";
import InfiniteScroll from "react-infinite-scroll-component";
import { useLoadProgress } from "../../context/LoadProgressProvider";
import { useCountry } from "../../context/CountryProvider";

const News = (props) => {
  const initialPage = 1;
  const initialArticles = [];
  const [articles, setArticles] = useState(initialArticles);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [totalResults, setTotalResults] = useState(0);
  const { country } = useCountry();
  const { setLoadProgress } = useLoadProgress();

  // // news api setup
  // const apiKey = process.env.REACT_APP_NEWS_API;
  // const apiUrl = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}&country=${country}&category=${props.category}&pageSize=${props.pageSize}`;

  // my api setup
  const apiUrl =
    `https://dipeshsukhia.github.io/news/data/` +
    (props.category
      ? `${country}-en-${props.category}.json`
      : "everything-en-news.json");

  const capitalizeFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

  const fetchData = async (
    pageNumber = initialPage,
    oldArticles = initialArticles
  ) => {
    setLoadProgress(10);
    setError("");
    await axios
      //.get(apiUrl + `&page=${pageNumber}`) // news api setup
      .get(apiUrl) // my api setup
      .then((response) => {
        setPage(pageNumber);
        setLoadProgress(30);
        setArticles(oldArticles.concat(response.data.articles));
        setTotalResults(response.data.articles.length); // my api setup
        //setTotalResults(response.data.totalResults); // news api setup
        setLoadProgress(70);
      })
      .catch((errorResponse) => {
        setLoadProgress(70);
        setTotalResults(0);
        setError(errorResponse.message);
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    setLoading(false);
    setLoadProgress(100);
  };

  useEffect(() => {
    props.category
      ? document.getElementById('countrySelector').classList.remove('d-none')
      : document.getElementById('countrySelector').classList.add('d-none')

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    fetchData();
    // eslint-disable-next-line
  }, [country]);

  return (
    <>
      <h1 className="text-center mt-4 mb-4">
        {props.category &&
          `${country.toUpperCase()} - Top ${capitalizeFirstLetter(
            props.category
          )} Headlines`}
        {!props.category && `Top News Headlines`}
      </h1>
      {loading && <Loader />}
      {error.length !== 0 && (
        <Alert variant="danger" cls>
          <Alert.Heading>{error}</Alert.Heading>
        </Alert>
      )}
      <InfiniteScroll
        dataLength={articles.length}
        next={() => fetchData(page + 1, articles)}
        hasMore={articles.length !== totalResults}
        loader={<Loader />}
      >
        <Container>
          <Row>
            {articles.map((article, index) => {
              return article.title.toLowerCase() !== "[removed]" && <Article key={article.url + index} article={article} />;
            })}
          </Row>
        </Container>
      </InfiniteScroll>
    </>
  );
};

News.defaultProps = {
  //pageSize: 30,
  //category: "general",
  category: null,
};

News.propTypes = {
  //pageSize: PropTypes.number,
  category: PropTypes.string,
};

export default News;
