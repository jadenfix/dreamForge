import React, { useState, useCallback } from 'react';
import { Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MiniPlayground() {
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      processImage(imageFile);
    } else {
      toast.error('Please drop an image file');
    }
  }, []);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImage(file);
    }
  };

  const processImage = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageDataUrl = e.target.result;
      setPreviewImage(imageDataUrl);
      
      // Auto-run caption demo
      setIsAnalyzing(true);
      setResult(null);
      
      try {
        const base64 = imageDataUrl.split(',')[1];
        const response = await fetch('/api/dream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: 'Describe what you see in this image',
            image: base64
          })
        });

        const data = await response.json();
        if (response.ok) {
          setResult(data);
          toast.success('Analysis complete!');
        } else {
          throw new Error(data.message || 'Analysis failed');
        }
      } catch (error) {
        console.error('Mini playground error:', error);
        toast.error('Demo failed - try the full experience below');
        setResult({
          result: { caption: 'Demo mode - upload an image to see live analysis!' },
          skill: 'caption'
        });
      } finally {
        setIsAnalyzing(false);
      }
    };
    
    reader.readAsDataURL(file);
  };

  const clearDemo = () => {
    setPreviewImage(null);
    setResult(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gradient-start/20 to-gradient-end/20 p-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-gradient-start" />
            <h3 className="font-semibold text-gray-100">Live Demo – Moondream API</h3>
          </div>
          <p className="text-sm text-gray-400 mt-1">Drop an image to see instant AI analysis</p>
        </div>

        <div className="p-6">
          {!previewImage ? (
            /* Drop Zone */
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                isDragging 
                  ? 'border-gradient-start bg-gradient-start/10' 
                  : 'border-white/20 hover:border-white/40 hover:bg-white/5'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gradient-start/20 to-gradient-end/20 rounded-xl flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gradient-start" />
                </div>
                
                <div>
                  <p className="text-lg font-medium text-gray-200">
                    {isDragging ? 'Drop your image here' : 'Drag & drop an image'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    or click to browse • PNG, JPG, WEBP
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Preview & Result */
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="w-full h-40 object-cover rounded-lg"
                />
                <button
                  onClick={clearDemo}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-black/90 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {isAnalyzing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="relative">
                    <div className="w-8 h-8 border-4 border-gradient-start border-t-transparent rounded-full animate-spin"></div>
                    <Sparkles className="absolute inset-0 w-8 h-8 text-gradient-start animate-pulse" />
                  </div>
                  <span className="ml-3 text-gray-300">Analyzing...</span>
                </div>
              ) : result ? (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-gradient-start/20 to-gradient-end/20 rounded-lg flex items-center justify-center mt-0.5">
                      <ImageIcon className="w-4 h-4 text-gradient-start" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-200 mb-2">AI Analysis Result</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {result.result.caption || result.result.answer || 'Analysis complete!'}
                      </p>
                      {result.verified !== undefined && (
                        <div className="mt-2 flex items-center space-x-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${result.verified ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                          <span className="text-xs text-gray-400">
                            {result.verified ? 'Verified by AI' : 'Unverified'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 