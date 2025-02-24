import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Button } from "./components/ui/Buttons";
import { Card, CardContent } from "./components/ui/Card";
import { Play, StopCircle } from "lucide-react";
import Editor from "@monaco-editor/react";

const ArduinoModel = () => {
  const { scene } = useGLTF("/models/arduino.glb"); // Load the 3D model
  return <primitive object={scene} scale={1.5} />;
};

const ArduinoSimulator = () => {
  const [code, setCode] = useState("void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}");
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    alert("Simulation Started: Your Arduino code is running.");
  };

  const handleStop = () => {
    setIsRunning(false);
    alert("Simulation Stopped: Your Arduino code has stopped.");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">⚡ Arduino Simulator</h1>
      <Card>
        <CardContent className="p-4">
          <Editor
            height="300px"
            defaultLanguage="c"
            value={code}
            onChange={(value) => setCode(value)}
          />
          <div className="flex gap-4 mt-4">
            <Button onClick={handleRun} disabled={isRunning}>
              <Play className="mr-2" /> Run
            </Button>
            <Button onClick={handleStop} disabled={!isRunning} variant="destructive">
              <StopCircle className="mr-2" /> Stop
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3D Arduino Model */}
      <div className="w-full h-[400px] mt-6 border rounded-lg shadow-lg">
        <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <ArduinoModel />
          <OrbitControls enableZoom={true} />
        </Canvas>
      </div>
    </div>
  );
};

export default ArduinoSimulator;
