// src/MyVideos.jsx
import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5000"; // optionally use env var

const MyVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch(`${BASE_URL}/my-videos`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch videos");
        }

        const data = await res.json();
        setVideos(data.videos || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">My Recordings</h1>

      {loading && <p>Loading videos...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          {videos.length === 0 ? (
            <p>No videos found.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                // <div key={video._id} className="bg-white shadow-md rounded p-4">
                //   <video
                //     src={`${BASE_URL}/uploads/videos/${video.videoUrl}`}
                //     controls
                //     className="w-full rounded"
                //   />
                //   <p className="mt-2 text-sm font-medium text-gray-800 truncate">
                //     {video.title}
                //   </p>
                //   <img
                //     src={`${BASE_URL}/uploads/videos/${video.thumbnailUrl}`}
                //     alt="Thumbnail"
                //     className="mt-2 w-full h-40 object-cover rounded"
                //   />
                // </div>
                <div> hello
                    </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyVideos;
