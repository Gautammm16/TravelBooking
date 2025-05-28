import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Favorites = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchFavorites = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/api/v1/favorites`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        if (Array.isArray(data.favorites)) {
          setFavorites(data.favorites);
        } else {
          throw new Error("Unexpected response format");
        }
      } catch (err) {
        if (err.name === "TypeError" && err.message.includes("Failed to fetch")) {
          setError("Cannot connect to server. Please check if the backend is running.");
        } else {
          setError(err.message || "Failed to fetch favorites");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, token, navigate, API_URL]);

  const handleRemoveFavorite = async (tourId) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/favorites/${tourId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to remove favorite");
      }

      // Update favorites list locally
      setFavorites((prev) => prev.filter((tour) => tour._id !== tourId));
    } catch (err) {
      alert(err.message || "Error removing favorite.");
    }
  };

  if (loading) return <div className="p-4 text-center">Loading favorites...</div>;
  if (error) return <div className="p-4 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6">My Favorite Tours</h1>

      {favorites.length === 0 ? (
        <p>You have no favorite tours yet.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {favorites.map((tour) => (
            <li
              key={tour._id}
              className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
            >
              <img
                src={tour.imageCover}
                alt={tour.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-bold">{tour.name}</h2>
                <p className="text-gray-600">{tour.summary}</p>
                <div className="mt-3 space-x-2">
                  <button
                    onClick={() => navigate(`/tour/${tour.id}`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleRemoveFavorite(tour._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Favorites;
