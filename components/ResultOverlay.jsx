import React, { useState, useRef, useEffect } from 'react';
import { Eye, MapPin, MessageSquare, FileText, Clock, Zap, Copy, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const ResultOverlay = ({ result, image, onClose }) => {
  const [activeTab, setActiveTab] = useState('result');
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (result && result.skill === 'detect' && result.result.objects) {
      drawBoundingBoxes();
    } else if (result && result.skill === 'point' && result.result.points) {
      drawPoints();
    }
  }, [result]);

  const drawBoundingBoxes = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    // Set canvas display size to match image
    const rect = img.getBoundingClientRect();
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeWidth = 3;
    ctx.font = '16px Arial';

    result.result.objects.forEach((obj, index) => {
      const [x, y, width, height] = obj.bbox;
      const color = getColorForIndex(index);
      
      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width - x, height - y);
      
      // Draw label background
      const label = `${obj.label} (${Math.round(obj.confidence * 100)}%)`;
      const textMetrics = ctx.measureText(label);
      const labelHeight = 20;
      
      ctx.fillStyle = color;
      ctx.fillRect(x, y - labelHeight, textMetrics.width + 10, labelHeight);
      
      // Draw label text
      ctx.fillStyle = 'white';
      ctx.fillText(label, x + 5, y - 5);
    });
  };

  const drawPoints = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    const rect = img.getBoundingClientRect();
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    result.result.points.forEach((point, index) => {
      const color = getColorForIndex(index);
      
      // Draw point
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw confidence label
      const label = `${Math.round(point.confidence * 100)}%`;
      ctx.fillStyle = color;
      ctx.font = 'bold 12px Arial';
      ctx.fillText(label, point.x + 15, point.y - 10);
    });
  };

  const getColorForIndex = (index) => {
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    return colors[index % colors.length];
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy');
    });
  };

  const downloadResult = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dreamforge-result-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!result) return null;

  const { skill, result: data, metadata, usage, verified, feedback } = result;

  const getSkillIcon = (skill) => {
    switch (skill) {
      case 'detect': return <Eye className="w-5 h-5" />;
      case 'point': return <MapPin className="w-5 h-5" />;
      case 'query': return <MessageSquare className="w-5 h-5" />;
      case 'caption': return <FileText className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getSkillColor = (skill) => {
    switch (skill) {
      case 'detect': return 'bg-blue-500';
      case 'point': return 'bg-green-500';
      case 'query': return 'bg-purple-500';
      case 'caption': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl ring-4 ${typeof verified === 'boolean' ? (verified ? 'ring-green-400' : 'ring-red-400') : 'ring-transparent'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-gradient-start to-gradient-end p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getSkillColor(skill)} text-white`}>
                {getSkillIcon(skill)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white capitalize">
                  {skill} Results
                </h3>
                <p className="text-white/80 text-sm">
                  Analysis completed in {metadata.totalTime}ms
                </p>
                {typeof verified === 'boolean' && (
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${verified ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                    {verified ? 'Verified' : 'Unverified'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={downloadResult}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Download results"
              >
                <Download className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['result', 'analytics', 'metadata'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-moondream-blue text-moondream-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'result' && (
            <div className="space-y-6">
              {/* Image with overlays */}
              <div className="relative bg-gray-100 rounded-xl overflow-hidden">
                <img
                  ref={imageRef}
                  src={`data:image/jpeg;base64,${image}`}
                  alt="Analysis result"
                  className="w-full h-auto max-h-96 object-contain"
                  onLoad={() => {
                    if (skill === 'detect' || skill === 'point') {
                      setTimeout(() => {
                        if (skill === 'detect') drawBoundingBoxes();
                        else drawPoints();
                      }, 100);
                    }
                  }}
                />
                {(skill === 'detect' || skill === 'point') && (
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 pointer-events-none"
                    style={{ maxHeight: '384px' }}
                  />
                )}
              </div>

              {/* Results based on skill */}
              {skill === 'detect' && data.objects && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Detected Objects</h4>
                  <div className="grid gap-3">
                    {data.objects.map((obj, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: getColorForIndex(index) }}
                          ></div>
                          <span className="font-medium capitalize">{obj.label}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {Math.round(obj.confidence * 100)}% confidence
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {skill === 'point' && data.points && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Located Points</h4>
                  <div className="grid gap-3">
                    {data.points.map((point, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: getColorForIndex(index) }}
                          ></div>
                          <span className="font-medium">Point {index + 1}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          ({point.x}, {point.y}) - {Math.round(point.confidence * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {skill === 'query' && data.answer && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Answer</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 leading-relaxed">{data.answer}</p>
                    {data.confidence && (
                      <div className="mt-2 text-sm text-gray-600">
                        Confidence: {Math.round(data.confidence * 100)}%
                      </div>
                    )}
                    <button
                      onClick={() => copyToClipboard(data.answer)}
                      className="mt-2 text-sm text-moondream-blue hover:text-moondream-purple flex items-center space-x-1"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy answer</span>
                    </button>
                  </div>
                </div>
              )}

              {skill === 'caption' && data.caption && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Caption</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 leading-relaxed">{data.caption}</p>
                    {data.confidence && (
                      <div className="mt-2 text-sm text-gray-600">
                        Confidence: {Math.round(data.confidence * 100)}%
                      </div>
                    )}
                    <button
                      onClick={() => copyToClipboard(data.caption)}
                      className="mt-2 text-sm text-moondream-blue hover:text-moondream-purple flex items-center space-x-1"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy caption</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && usage && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold">Usage Analytics</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{usage.totalCalls}</div>
                  <div className="text-sm text-blue-600">Total Calls</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{usage.successRate.toFixed(1)}%</div>
                  <div className="text-sm text-green-600">Success Rate</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{usage.timeRange}</div>
                  <div className="text-sm text-purple-600">Days Range</div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-semibold">Skill Breakdown</h5>
                {Object.entries(usage.skillBreakdown).map(([skill, stats]) => (
                  <div key={skill} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${getSkillColor(skill)} text-white`}>
                        {getSkillIcon(skill)}
                      </div>
                      <span className="font-medium capitalize">{skill}</span>
                    </div>
                    <div className="text-sm text-gray-600 space-x-4">
                      <span>{stats.count} calls</span>
                      <span>{stats.avgResponseTime}ms avg</span>
                      <span>{stats.successRate}% success</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold">Request Metadata</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Total Time</span>
                    <span className="text-sm text-gray-600">{metadata.totalTime}ms</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Dream Time</span>
                    <span className="text-sm text-gray-600">{metadata.dreamTime}ms</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Timestamp</span>
                    <span className="text-sm text-gray-600">
                      {new Date(metadata.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Skill Used</span>
                    <span className="text-sm text-gray-600 capitalize">{skill}</span>
                  </div>
                  {result.params && Object.keys(result.params).length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium block mb-2">Parameters</span>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                        {JSON.stringify(result.params, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {typeof verified === 'boolean' && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Verification</span>
                  <span className={`text-sm font-semibold ${verified ? 'text-green-600' : 'text-red-600'}`}>
                    {verified ? 'Passed' : 'Failed'}
                  </span>
                </div>
              )}

              {feedback && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium block mb-2">Verifier Feedback</span>
                  <p className="text-xs text-gray-600 whitespace-pre-wrap">{feedback}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultOverlay; 