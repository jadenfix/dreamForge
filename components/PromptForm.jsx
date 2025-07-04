import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Upload, Send, Settings, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const PromptForm = forwardRef(({ onSubmit, loading }, ref) => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [useAnthropicPlanner, setUseAnthropicPlanner] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const textareaRef = useRef(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    setPrompt: (newPrompt) => {
      setPrompt(newPrompt);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    },
    getPrompt: () => prompt,
    clearForm: () => {
      setPrompt('');
      setImage(null);
      setImagePreview(null);
    }
  }));

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + Enter submits form
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleSubmit(e);
      }
      // '/' focuses prompt input (unless typing in input already)
      if (e.key === '/' && document.activeElement !== textareaRef.current) {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prompt, image]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1]; // Remove data URL prefix
      setImage(base64);
      setImagePreview(e.target.result);
    };
    
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    
    if (!image) {
      toast.error('Please upload an image');
      return;
    }

    onSubmit({
      prompt: prompt.trim(),
      image,
      useAnthropicPlanner
    });
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass-card shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gradient-start to-gradient-end p-6">
        <h2 className="text-2xl font-bold text-white mb-2">DreamForge VLM</h2>
        <p className="text-white/80">Transform your vision with AI-powered image analysis</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Image Upload Section */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">
            Upload Image
          </label>
          
          {!imagePreview ? (
            <div className="border-2 border-dashed border-moondream-purple/60 rounded-xl p-8 text-center hover:border-moondream-purple transition-colors bg-white/5 backdrop-blur">
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label 
                htmlFor="image-upload" 
                className="cursor-pointer flex flex-col items-center space-y-3"
              >
                <div className="w-16 h-16 bg-moondream-purple/20 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-moondream-purple" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    Click to upload image
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-gray-200">
              <img 
                src={imagePreview} 
                alt="Upload preview" 
                className="w-full h-64 object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            What would you like to know about this image?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., What objects can you detect in this image? Where is the person standing? Describe what's happening in the scene..."
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-moondream-blue focus:border-transparent resize-none transition-all placeholder-gray-600 dark:placeholder-gray-400"
            disabled={loading}
            ref={textareaRef}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Be specific for better results</span>
            <span>{prompt.length}/2000</span>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-sm text-moondream-blue hover:text-moondream-purple transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Advanced Settings</span>
            <svg 
              className={`w-4 h-4 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAdvanced && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Zap className="w-4 h-4 text-moondream-purple" />
                    <span>Smart Planning (Anthropic)</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Use AI to automatically select the best analysis method
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setUseAnthropicPlanner(!useAnthropicPlanner)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    useAnthropicPlanner ? 'bg-moondream-blue' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useAnthropicPlanner ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !prompt.trim() || !image}
          className="w-full bg-gradient-to-r from-gradient-start to-gradient-end text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Analyze Image</span>
            </>
          )}
        </button>

        {/* Quick Examples */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Examples:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "What objects do you see?",
              "Describe this scene",
              "Count the people in the image",
              "Where is the car located?"
            ].map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPrompt(example)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                disabled={loading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
});

PromptForm.displayName = 'PromptForm';

export default PromptForm; 