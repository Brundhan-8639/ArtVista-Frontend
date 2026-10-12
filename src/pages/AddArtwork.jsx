
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://artvista-backend-echr.onrender.com";

function AddArtwork({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: ""
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const isPopup = Boolean(onCancel);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    setMessage("");

    if (!file) {
      setImage(null);
      setPreview("");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      setImage(null);
      setPreview("");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("Image size must be 10 MB or less.");
      event.target.value = "";
      setImage(null);
      setPreview("");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!form.title.trim() || !form.category.trim()) {
      setMessage("Title and category are required.");
      return;
    }

    if (!image) {
      setMessage("Please select an artwork image.");
      return;
    }

    if (!localStorage.getItem("artvistaUser")) {
      setMessage("Please sign in again before uploading.");
      return;
    }

    const data = new FormData();

    data.append("title", form.title.trim());
    data.append("description", form.description.trim());
    data.append("category", form.category.trim());
    data.append("image", image);

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/artworks/upload`,
        {
          method: "POST",
          body: data
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Could not upload artwork."
        );
      }

      if (typeof onSuccess === "function") {
        onSuccess(result);
      } else {
        navigate("/gallery");
      }
    } catch (error) {
      console.error("Artwork upload failed:", error);
      setMessage(
        error.message || "Could not connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className={`auth-card ${
        isPopup ? "upload-popup-card" : ""
      }`}
    >
      <p className="auth-brand">ARTVISTA</p>
      <p className="auth-eyebrow">YOUR CREATIVE SPACE</p>

      <h1 id={isPopup ? "upload-modal-title" : undefined}>
        Add your artwork
      </h1>

      <p className="auth-subtitle">
        Share your creativity with the world.
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="artwork-title">Artwork title</label>
        <input
          id="artwork-title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter artwork title"
          maxLength={150}
          required
        />

        <label htmlFor="artwork-description">Description</label>
        <textarea
          id="artwork-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe your artwork (optional)"
          rows={3}
          maxLength={250}
        />

        <label htmlFor="artwork-category">Category</label>
        <input
          id="artwork-category"
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="e.g. Charcoal, Graphite, Digital Art"
          maxLength={100}
          required
        />

        <label htmlFor="artwork-image">
          Choose artwork image
        </label>
        <input
          id="artwork-image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          required
        />

        {preview && (
          <img
            src={preview}
            alt="Selected artwork preview"
            style={{
              display: "block",
              width: "100%",
              maxHeight: "250px",
              objectFit: "contain",
              borderRadius: "10px",
              marginTop: "10px"
            }}
          />
        )}

        {message && (
          <p className="auth-message" role="alert">
            {message}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload artwork"}
        </button>

        {isPopup && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </form>

      {!isPopup && (
        <p className="auth-switch">
          <Link to="/gallery">Back to gallery</Link>
        </p>
      )}
    </section>
  );
}

export default AddArtwork;
