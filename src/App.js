import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { fabric } from "fabric";

// Use the API key from the environment variable
// const API_KEY = process.env.REACT_APP_PIXABAY_API_KEY;

const App = () => {
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = new fabric.Canvas("canvas", {
        width: 600,
        height: 400,
      });
    }

    return () => {
      if (canvasRef.current) {
        canvasRef.current.dispose();
        canvasRef.current = null;
      }
    };
  }, []);

  const validateQuery = (query) => {
    if (!query.trim()) {
      setErrorMessage("Search query cannot be empty.");
      return false;
    }
    return true;
  };

  const handleSearch = async () => {
    if (!validateQuery(query)) return;

    setLoading(true);
    setErrorMessage(""); // Clear previous error messages
    try {
      const response = await fetch(
        `https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(
          query
        )}&image_type=photo`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch images. Please try again later.");
      }

      const data = await response.json();

      if (data.hits.length === 0) {
        setErrorMessage("No images found for the given query.");
      } else {
        setImages(data.hits);
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addText = () => {
    if (!canvasRef.current) {
      setErrorMessage("Canvas is not initialized.");
      return;
    }
    const text = new fabric.Textbox("Enter text here", {
      left: 100,
      top: 100,
      fontSize: 20,
      fill: "#000",
    });
    canvasRef.current.add(text);
    canvasRef.current.renderAll();
  };

  const addShape = (shapeType) => {
    if (!canvasRef.current) {
      setErrorMessage("Canvas is not initialized.");
      return;
    }

    let shape;
    switch (shapeType) {
      case "circle":
        shape = new fabric.Circle({
          radius: 50,
          fill: "red",
          left: 100,
          top: 100,
        });
        break;
      case "rectangle":
        shape = new fabric.Rect({
          width: 100,
          height: 50,
          fill: "green",
          left: 100,
          top: 100,
        });
        break;
      case "triangle":
        shape = new fabric.Triangle({
          width: 100,
          height: 100,
          fill: "blue",
          left: 100,
          top: 100,
        });
        break;
      default:
        return;
    }
    canvasRef.current.add(shape);
    canvasRef.current.renderAll();
  };

  const addImageToCanvas = (imageUrl) => {
    if (!canvasRef.current) {
      setErrorMessage("Canvas is not initialized.");
      return;
    }

    fabric.Image.fromURL(
      imageUrl,
      (img) => {
        img.set({
          scaleX: 0.5,
          scaleY: 0.5,
        });
        canvasRef.current.add(img);
        canvasRef.current.renderAll();
      },
      { crossOrigin: "anonymous" }
    );
  };

  const downloadImage = () => {
    if (!canvasRef.current) {
      setErrorMessage("Canvas is not initialized.");
      return;
    }

    try {
      const dataURL = canvasRef.current.toDataURL({
        format: "png",
        quality: 1,
      });
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "canvas-image.png";
      link.click();
    } catch (error) {
      setErrorMessage("Unable to download image. Please try again.");
    }
  };

  return (
    <>
      <div className="details">
        <h3>Name: Prachi Sharma</h3>
        <h3>Email: prachiii.sharmaa02@gmail.com</h3>
      </div>

      <div className="App">
        <h1>Image Editor</h1>

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <div className="search-bar">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for images..."
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        <div className="image-results">
          {images.map((image) => (
            <div key={image.id} className="image-item">
              <img src={image.previewURL} alt={image.tags} />
              <button onClick={() => addImageToCanvas(image.largeImageURL)}>
                Add Caption
              </button>
            </div>
          ))}
        </div>

        <div className="canvas-container">
          <canvas id="canvas"></canvas>
        </div>

        <div className="controls">
          <button onClick={addText}>Add Text</button>
          <button onClick={() => addShape("circle")}>Add Circle</button>
          <button onClick={() => addShape("rectangle")}>Add Rectangle</button>
          <button onClick={() => addShape("triangle")}>Add Triangle</button>
          <button onClick={downloadImage}>Download</button>
        </div>
      </div>
    </>
  );
};

export default App;
