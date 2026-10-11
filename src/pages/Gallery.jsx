
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddArtwork from "./AddArtwork";
import "./Gallery.css";

function Gallery() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("artvistaUser") || "null"
  );

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    let cancelled = false;

    async function fetchArtworks() {
      try {
        const response = await fetch(
          "http://localhost:8080/api/artworks"
        );

        if (!response.ok) {
          throw new Error("Could not load artworks.");
        }

        const data = await response.json();

        if (!cancelled) {
          setArtworks(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError(
            "Unable to load artworks. Check that the backend is running."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchArtworks();

    return () => {
      cancelled = true;
    };
  }, [navigate, user]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setSelectedArtwork(null);
        setShowUploadForm(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function getImageUrl(imageUrl) {
    if (!imageUrl) return "";

    return imageUrl.startsWith("/uploads/")
      ? `http://localhost:8080${imageUrl}`
      : imageUrl;
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this artwork?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/artworks/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Could not delete artwork.");
      }

      setArtworks((current) =>
        current.filter((art) => art.id !== id)
      );

      setSelectedArtwork((current) =>
        current?.id === id ? null : current
      );
    } catch (err) {
      alert(err.message || "Could not connect to the server.");
    }
  }

  async function handleEdit(art, updatedFields) {
    try {
      const response = await fetch(
        `http://localhost:8080/api/artworks/${art.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...art,
            ...updatedFields
          })
        }
      );

      if (!response.ok) {
        throw new Error("Could not update artwork.");
      }

      const updatedArtwork = await response.json();

      setArtworks((current) =>
        current.map((item) =>
          item.id === art.id ? updatedArtwork : item
        )
      );

      setSelectedArtwork((current) =>
        current?.id === art.id ? updatedArtwork : current
      );
    } catch (err) {
      alert(err.message || "Could not connect to the server.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("artvistaUser");
    navigate("/login", { replace: true });
  }

  function handleUploadSuccess(newArtwork) {
    setArtworks((current) => [newArtwork, ...current]);
    setShowUploadForm(false);
  }

  return (
    <main className="gallery-page">
      <header className="gallery-header">
        <h2>ARTVISTA</h2>

        <div className="gallery-user">
          <span>Welcome, {user?.name || "Artist"}</span>

          <button
            type="button"
            onClick={() => setShowUploadForm(true)}
          >
            + Add Artwork
          </button>

          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="gallery-content">
        <p className="gallery-eyebrow">YOUR CREATIVE SPACE</p>

        <h1>Discover Artworks</h1>

        <p className="gallery-subtitle">
          Explore creativity, one artwork at a time.
        </p>

        {loading && <p>Loading artworks...</p>}

        {error && (
          <p className="gallery-error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && artworks.length === 0 && (
          <p>No artworks yet. Be the first to add one!</p>
        )}

        <div className="artwork-grid">
          {artworks.map((art) => (
            <article className="artwork-card" key={art.id}>
              {art.imageUrl && (
                <img
                  src={getImageUrl(art.imageUrl)}
                  alt={art.title}
                  className="artwork-image"
                  onClick={() => setSelectedArtwork(art)}
                  title="Click to view full size"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();
                      setSelectedArtwork(art);
                    }
                  }}
                />
              )}

              <div className="artwork-details">
                <h3>{art.title}</h3>

                {art.description && <p>{art.description}</p>}

                <span>{art.category}</span>

                <div className="artwork-actions">
                  <button
                    type="button"
                    className="edit-artwork-button"
                    onClick={() => {
                      const title = window.prompt(
                        "Enter artwork title:",
                        art.title
                      );

                      if (title === null || !title.trim()) {
                        return;
                      }

                      const category = window.prompt(
                        "Enter artwork category:",
                        art.category
                      );

                      if (
                        category === null ||
                        !category.trim()
                      ) {
                        return;
                      }

                      const description = window.prompt(
                        "Enter artwork description (optional):",
                        art.description || ""
                      );

                      if (description === null) return;

                      handleEdit(art, {
                        title: title.trim(),
                        category: category.trim(),
                        description: description.trim()
                      });
                    }}
                  >
                    Edit artwork
                  </button>

                  <button
                    type="button"
                    className="delete-artwork-button"
                    onClick={() => handleDelete(art.id)}
                  >
                    Delete artwork
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {showUploadForm && (
        <div
          className="upload-modal"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowUploadForm(false);
            }
          }}
        >
          <div
            className="upload-modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-modal-title"
          >
            <button
              type="button"
              className="close-modal"
              aria-label="Close upload form"
              onClick={() => setShowUploadForm(false)}
            >
              ✕
            </button>

            <AddArtwork
              onCancel={() => setShowUploadForm(false)}
              onSuccess={handleUploadSuccess}
            />
          </div>
        </div>
      )}

      {selectedArtwork && (
        <div
          className="image-preview-modal"
          onClick={() => setSelectedArtwork(null)}
        >
          <button
            type="button"
            className="image-preview-close"
            aria-label="Close image preview"
            onClick={() => setSelectedArtwork(null)}
          >
            ✕
          </button>

          <div
            className="image-preview-content"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={getImageUrl(selectedArtwork.imageUrl)}
              alt={selectedArtwork.title}
            />

            <h2>{selectedArtwork.title}</h2>

            {selectedArtwork.description && (
              <p>{selectedArtwork.description}</p>
            )}

            <span>{selectedArtwork.category}</span>
          </div>
        </div>
      )}
    </main>
  );
}

export default Gallery;
