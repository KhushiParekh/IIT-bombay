import React, { useState, useCallback, useEffect, useRef } from 'react';
import { autoInject } from 'invisible-watermark';

const ImageWatermark = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);
  const [watermarkSettings, setWatermarkSettings] = useState({
    fontSize: 24,
    opacity: 0.5,
    angle: -30,
    density: 2
  });

  const drawVisibleWatermark = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !preview) return;

    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = preview;

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      if (watermarkText) {
        ctx.font = `${watermarkSettings.fontSize}px Arial`;
        ctx.fillStyle = `rgba(255, 255, 255, ${watermarkSettings.opacity})`;
        ctx.strokeStyle = `rgba(0, 0, 0, ${watermarkSettings.opacity})`;
        
        const metrics = ctx.measureText(watermarkText);
        const spacingX = canvas.width / watermarkSettings.density;
        const spacingY = canvas.height / watermarkSettings.density;

        ctx.save();
        ctx.rotate((watermarkSettings.angle * Math.PI) / 180);

        for (let y = -canvas.height; y < canvas.height * 2; y += spacingY) {
          for (let x = -canvas.width; x < canvas.width * 2; x += spacingX) {
            ctx.strokeText(watermarkText, x, y);
            ctx.fillText(watermarkText, x, y);
          }
        }

        ctx.restore();
      }
    };
  }, [preview, watermarkText, watermarkSettings]);

  useEffect(() => {
    drawVisibleWatermark();
  }, [drawVisibleWatermark]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelection(droppedFile);
  }, []);

  const handleFileSelection = (selectedFile) => {
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setFile(selectedFile);
      setError('');
      
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const downloadVisibleWatermark = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `visible-watermarked-${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const addInvisibleWatermark = async () => {
    if (!file || !watermarkText) return;
    
    setLoading(true);
    setError('');
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const image = new Image();
          image.src = e.target.result;
          
          await new Promise((resolve) => {
            image.onload = resolve;
          });

          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0);

          await autoInject({
            text: watermarkText,
            image: canvas,
            options: {
              strength: 0.3
            }
          });

          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invisible-watermarked-${file.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setLoading(false);
          }, 'image/png');

        } catch (err) {
          console.error('Error processing image:', err);
          setError('Error processing image. Please try again.');
          setLoading(false);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      setError('Error reading file. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Image Watermark Tool
        </h1>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div 
            className="border-2 border-dashed border-blue-200 rounded-xl p-8 mb-6 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {preview ? (
              <div className="relative">
                <canvas 
                  ref={canvasRef}
                  className="max-h-64 mx-auto rounded-lg shadow"
                />
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="py-8">
                <div className="text-gray-500 mb-4">
                  Drag and drop your image here, or
                </div>
                <label className="cursor-pointer">
                  <span className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                    Browse Files
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileSelection(e.target.files[0])}
                    accept="image/*"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Watermark Text
              </label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                placeholder="Enter watermark text..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size
              </label>
              <input
                type="range"
                min="12"
                max="48"
                value={watermarkSettings.fontSize}
                onChange={(e) => setWatermarkSettings(prev => ({
                  ...prev,
                  fontSize: parseInt(e.target.value)
                }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opacity
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={watermarkSettings.opacity * 100}
                onChange={(e) => setWatermarkSettings(prev => ({
                  ...prev,
                  opacity: parseInt(e.target.value) / 100
                }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Angle
              </label>
              <input
                type="range"
                min="-90"
                max="90"
                value={watermarkSettings.angle}
                onChange={(e) => setWatermarkSettings(prev => ({
                  ...prev,
                  angle: parseInt(e.target.value)
                }))}
                className="w-full"
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={downloadVisibleWatermark}
              disabled={!file || !watermarkText || loading}
              className={`w-full bg-green-500 text-white py-4 rounded-lg font-medium transition-all
                ${(!file || !watermarkText || loading)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-green-600 hover:shadow-lg'
                }`}
            >
              Download with Visible Watermark
            </button>

            <button
              onClick={addInvisibleWatermark}
              disabled={!file || !watermarkText || loading}
              className={`w-full bg-blue-500 text-white py-4 rounded-lg font-medium transition-all
                ${(!file || !watermarkText || loading)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-600 hover:shadow-lg'
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                'Download with Invisible Watermark'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageWatermark;