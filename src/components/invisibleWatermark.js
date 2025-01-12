import React, { useState } from 'react';
import { autoInject } from 'invisible-watermark';

const WatermarkModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check if file is an image
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleWatermark = async () => {
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

          // Create a canvas
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0);

          // Add watermark
          await autoInject({
            text: watermarkText,
            image: canvas,
            options: {
              strength: 0.3
            }
          });

          // Convert canvas to blob and download
          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `watermarked-${file.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            setIsOpen(false);
            setFile(null);
            setWatermarkText('');
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
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Add Watermark to Image
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Add Watermark to Image</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Select Image
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full border rounded p-2"
                accept="image/*"
              />
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Watermark Text
              </label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full border rounded p-2"
                placeholder="Enter watermark text"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setError('');
                  setFile(null);
                  setWatermarkText('');
                }}
                className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWatermark}
                disabled={!file || !watermarkText || loading}
                className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ${
                  (!file || !watermarkText || loading) && 'opacity-50 cursor-not-allowed'
                }`}
              >
                {loading ? 'Processing...' : 'Add Watermark & Download'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatermarkModal;