import React, { useState, useRef, useEffect } from "react";

const CompIdentifier = () => {
    const [capturedImage, setCapturedImage] = useState(null);
    const [componentData, setComponentData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null); // Store webcam stream
    const displayCanvasRef = useRef(null); // Separate canvas for display

    // Start the webcam
    const startCamera = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                videoRef.current.srcObject = stream;
                streamRef.current = stream; // Save the stream reference
            })
            .catch((error) => {
                console.error("Error accessing webcam:", error);
                alert("Error accessing webcam. Please check permissions.");
            });
    };

    // Capture image from video stream
    const captureImage = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        if (!video || !video.videoWidth) {
            alert("Please start the camera first!");
            return;
        }
        
        const context = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL("image/png");
        setCapturedImage(imageData);
        
        // Also set up the display canvas with the same dimensions
        const displayCanvas = displayCanvasRef.current;
        if (displayCanvas) {
            displayCanvas.width = canvas.width;
            displayCanvas.height = canvas.height;
            const displayContext = displayCanvas.getContext("2d");
            const img = new Image();
            img.onload = () => {
                displayContext.drawImage(img, 0, 0);
            };
            img.src = imageData;
        }
    };

    // Parse component info into 2D array format for hover display
    const parseComponentInfo = (info) => {
        if (!info || typeof info !== 'string') return [];
        
        try {
            // Try to parse as JSON if it's a JSON string
            const parsed = JSON.parse(info);
            if (Array.isArray(parsed)) {
                return parsed;
            } else if (typeof parsed === 'object') {
                // Convert object to array of [key, value] pairs
                return Object.entries(parsed);
            }
        } catch (e) {
            // If not JSON, try to parse as text with sections
            const lines = info.split('\n').filter(line => line.trim());
            const result = [];
            
            lines.forEach(line => {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    const header = parts[0].trim();
                    const description = parts.slice(1).join(':').trim();
                    result.push([header, description]);
                } else {
                    // For lines without a clear delimiter, use the whole line as header
                    result.push([line, '']);
                }
            });
            
            return result;
        }
        
        // Fallback: just return the string as a single entry
        return [["Component Info", info]];
    };

    // Mock data for testing when server is not available
    const mockResponse = () => {
        return {
            component_info: JSON.stringify([
                ["Type", "Resistor"],
                ["Value", "10kΩ ±5%"],
                ["Power Rating", "0.25W"],
                ["Temperature Coefficient", "±100ppm/°C"],
                ["Description", "Standard carbon film resistor commonly used in electronic circuits"]
            ]),
            detections: [
                {
                    bbox: [100, 100, 300, 200],
                    class: "Resistor",
                    confidence: 0.95
                }
            ]
        };
    };

    // Send image to backend for identification
    const identifyComponent = async () => {
        if (!capturedImage) {
            alert("Capture an image first!");
            return;
        }

        setLoading(true);
        try {
            let data;
            try {
                const response = await fetch("http://localhost:5005/identify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image: capturedImage }),
                });
                data = await response.json();
            } catch (error) {
                console.log("Could not connect to server, using mock data", error);
                data = mockResponse();
            }

            const componentInfo = data.component_info || [["No identification available.","error"]];
            
            // Parse the component info into our 2D array format
            const parsedData = parseComponentInfo(componentInfo);
            setComponentData(componentInfo);
            
            // Draw bounding boxes on the display canvas
            const displayCanvas = displayCanvasRef.current;
            if (displayCanvas) {
                const ctx = displayCanvas.getContext("2d");
                const detections = data.detections || [];
                
                // Clear and redraw the image first
                const img = new Image();
                img.onload = () => {
                    ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
                    ctx.drawImage(img, 0, 0, displayCanvas.width, displayCanvas.height);
                    
                    // Now draw the bounding boxes
                    const xsc = displayCanvas.width / 640;
                    const ysc = displayCanvas.height / 640;

                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 2;
                    ctx.font = '16px Arial';
                    ctx.fillStyle = 'red';
                    
                    detections.forEach(det => {
                        const [x1_1, y1_1, x2_2, y2_2] = det.bbox;
                        const x1 = x1_1 * xsc;
                        const y1 = y1_1 * ysc;
                        const width = (x2_2 - x1_1) * xsc;
                        const height = (y2_2 - y1_1) * ysc;
                        
                        ctx.strokeRect(x1, y1, width, height);
                        ctx.fillText(`${det.class} (${(det.confidence * 100).toFixed(1)}%)`, x1, y1 - 5);
                    });
                };
                img.src = capturedImage;
            }

        } catch (error) {
            console.log("Error identifying component:", error);
            setComponentData([["Error", "Error processing request."]]);
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

    // CSS styles as direct objects to ensure they are applied
    const containerStyle = {
        fontFamily: 'Arial, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px'
    };

    const titleStyle = {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#ffffff'
    };

    const buttonContainerStyle = {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap'
    };

    const buttonStyle = {
        padding: '8px 16px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    };

    const canvasContainerStyle = {
        marginBottom: '20px'
    };

    const canvasStyle = {
        display: capturedImage ? 'block' : 'none',
        maxWidth: '100%',
        border: '1px solid #ccc',
        borderRadius: '8px'
    };

    const infoContainerStyle = {
        backgroundColor: 'blacke',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 4px 6px rgba(231, 218, 218, 0.1)',
        marginTop: '16px'
    };

    const infoTitleStyle = {
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '16px',
        color: '#333'
    };

    const infoGridStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '16px'
    };

    const boxStyle = {
        position: 'relative',
        backgroundColor: '#f9f9f9',
        padding: '16px',
        borderRadius: '16px',
        border: '1px solidrgb(16, 243, 53)',
        transition: 'box-shadow 0.3s ease'
    }; 

    const headerStyle = {
        fontSize: '16px',
        fontWeight: '500',
        color: '#3b82f6',
        marginBottom: '4px'
    };

    const tooltipStyle = (isVisible) => ({
        position: 'absolute',
        left: '0',
        right: '0',
        zIndex: '10',
        marginTop: '8px',
        padding: '12px',
        backgroundColor: '#ebf5ff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        fontSize: '14px',
        color: '#333',
        display: isVisible ? 'block' : 'none'
    });

    return (
        <div style={containerStyle}>
            <h1 style={titleStyle}>🔍 CompIdentifier</h1>
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                style={{ width: '100%', borderRadius: '8px', marginBottom: '16px' }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            
            <div style={buttonContainerStyle}>
                <button 
                    onClick={startCamera} 
                    style={buttonStyle}
                >
                    🎥 Start Camera
                </button>
                <button 
                    onClick={captureImage} 
                    style={buttonStyle}
                >
                    📸 Capture Image
                </button>
                <button 
                    onClick={identifyComponent} 
                    disabled={loading}
                    style={{
                        ...buttonStyle,
                        backgroundColor: loading ? '#cccccc' : '#2196F3'
                    }}
                >
                    {loading ? "🔄 Identifying..." : "🔍 Identify Component"}
                </button>
                <button 
                    onClick={stopCamera} 
                    style={{
                        ...buttonStyle,
                        backgroundColor: '#f44336'
                    }}
                >
                    ❌ Quit
                </button>
            </div>

            <div style={canvasContainerStyle}>
                <canvas 
                    ref={displayCanvasRef} 
                    style={canvasStyle}
                />
            </div>
            
            {componentData.length > 0 && (
                <div style={infoContainerStyle}>
                    <h2 style={infoTitleStyle}>Component Information</h2>
                    <div style={infoGridStyle}>
                        {componentData.map((item, index) => (
                            <div 
                                key={index}
                                style={boxStyle}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <h3 style={headerStyle}>
                                    {item[0]}
                                </h3>
                                
                                <div style={tooltipStyle(hoveredIndex === index && item[1])}>
                                    {item[1]}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompIdentifier;