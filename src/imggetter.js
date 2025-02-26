import React, { useState } from "react";
import axios from "axios";

function ImageGetter() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file)); // Preview image
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      alert("Please select an image first!");
      return;
    }

    setLoading(true);
    setResult("");

    const reader = new FileReader();
    reader.readAsDataURL(selectedImage);
    reader.onload = async () => {
      const base64Image = reader.result.split(",")[1]; // Extract Base64 data

      let data;
      try {

        const response = await fetch("http://localhost:5010/identify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Image,
            query: "Identify this electronic component.", }),
        });
        data = await response.json();
        console.log(data)
        setResult(data.components);
      } catch (error) {
        setResult("Error: Unable to identify the component.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">🛠️ CompIdentifier</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <input type="file" accept="image/*" onChange={handleImageChange} className="mb-4" />
        {preview && <img src={preview} alt="Preview" className="w-64 h-64 object-contain mb-4 border" />}
        
        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Identifying..." : "Identify Component"}
        </button>

        {result && (
          <div className="mt-4 p-4 text-white bg-gray-200 rounded">
            <h2 className="font-bold">Result:</h2>
            <p>{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageGetter;
