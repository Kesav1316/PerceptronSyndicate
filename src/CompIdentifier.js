import React, { useState, useRef } from "react";

const CompIdentifier = () => {
    const [capturedImage, setCapturedImage] = useState(null);
    const [componentInfo, setComponentInfo] = useState("");
    const [loading, setLoading] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null); // Store webcam stream

    // Start the webcam
    const startCamera = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                videoRef.current.srcObject = stream;
                streamRef.current = stream; // Save the stream reference
            })
            .catch((error) => {
                console.error("Error accessing webcam:", error);
            });
    };

    // Capture image from video stream
    const captureImage = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL("image/png");
        setCapturedImage(imageData);
    };

    // Send image to backend for identification
    const identifyComponent = async () => {
        if (!capturedImage) {
            alert("Capture an image first!");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/identify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: capturedImage }),
            });

            const data = await response.json();
            setComponentInfo(data.component_info || "No identification available.");
        } catch (error) {
            console.error("Error identifying component:", error);
            setComponentInfo("Error processing request.");
        }
        setLoading(false);
    };

    // Stop the webcam stream
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop()); // Stop all video tracks
            videoRef.current.srcObject = null; // Clear video stream
            streamRef.current = null;
        }
    };

    return (
        <div className="comp-identifier-container">
            <h1>🔍 CompIdentifier</h1>
            <video ref={videoRef} autoPlay playsInline className="video-feed" />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            <div className="buttons">
                <button onClick={startCamera}>🎥 Start Camera</button>
                <button onClick={captureImage}>📸 Capture Image</button>
                <button onClick={identifyComponent} disabled={loading}>
                    {loading ? "🔄 Identifying..." : "🔍 Identify Component"}
                </button>
                <button onClick={stopCamera} className="quit-button">❌ Quit</button>
            </div>

            {capturedImage && <img src={capturedImage} alt="Captured" className="captured-img" />}
            {componentInfo && <p className="component-info">📝 {componentInfo}</p>}
        </div>
    );
};

export default CompIdentifier;
