import React from "react";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import noImage from "../../assets/no-image.png";
import Button from "react-bootstrap/Button";

const Article = (props) => {
  let { title, description, urlToImage, url, author, publishedAt, source } =
    props.article;
  return (
    <Col md={6} sm={12} lg={6} xl={4}>
      <Card className="shadow my-4">
        <div className="d-flex justify-content-end position-absolute end-0">
          <Badge bg="danger" pill>
            {source.name}
          </Badge>
        </div>
        <Card.Img
          variant="top"
          alt={source.name}
          src={urlToImage ? urlToImage : noImage}
        />
        <Card.Body>
          <Card.Title>{title ? title : ""}</Card.Title>
          <Card.Text>{description ? description : ""}</Card.Text>
          <Card.Text className="text-muted small">
            <div>
              <b>Author :</b> {author ? author : "Anonymous"}
            </div>
            <div>
              <b>Date :</b> {new Date(publishedAt).toGMTString()}
            </div>
          </Card.Text>
          <Button href={url} target="_blank" variant="dark" size="sm">
            Read More &#8594;
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default Article;
