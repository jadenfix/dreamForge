export const rewardFunctions = [
  {
    id: "iou",
    name: "Intersection over Union (IoU)",
    description: "Measures overlap between predicted & ground-truth boxes.",
    code: `module.exports = (pred, gt) => {
  const inter = computeIntersectionArea(pred.bbox, gt.bbox);
  const union = computeUnionArea(pred.bbox, gt.bbox);
  return inter / union;
};`,
    tradeoffs: ["balanced", "interpretable", "moderate-compute"],
    useCases: ["object-detection", "OCR", "license-plate"],
  },
  // ... existing code ...
  {
    id: "dice",
    name: "Dice Coefficient",
    description: "Overlap metric weighted toward small regions—favours recall.",
    code: `module.exports = (pred, gt) => {
  const inter = computeIntersectionArea(pred.mask, gt.mask);
  return (2 * inter) / (pred.area + gt.area);
};`,
    tradeoffs: ["high-recall", "sensitive-to-shape", "higher-compute"],
    useCases: ["segmentation", "medical-imaging", "aerial-mapping"],
  },
  {
    id: "f1_bbox",
    name: "F1 Score for Detection",
    description: "Harmonic mean of precision & recall on IoU-thresholded boxes.",
    code: `module.exports = (preds, gts) => {
  const tp = countMatches(preds, gts, 0.5);
  const fp = preds.length - tp;
  const fn = gts.length - tp;
  const prec = tp / (tp + fp);
  const rec = tp / (tp + fn);
  return 2 * (prec * rec) / (prec + rec);
};`,
    tradeoffs: ["precision-recall-balanced", "batch-compute"],
    useCases: ["object-detection", "security-cameras"],
  },
  {
    id: "bleu_caption",
    name: "BLEU Score (Captioning)",
    description: "N-gram overlap metric for text captions vs ground-truth.",
    code: `const { computeBLEU } = require('nlp-metrics');
module.exports = (pred, gt) => computeBLEU(pred.text, gt.text);`,
    tradeoffs: ["fast-text", "syntax-focused", "not-semantic"],
    useCases: ["image-captioning", "VQA", "assistive-tech"],
  },
  {
    id: "mse_keypoints",
    name: "MSE on Keypoints",
    description: "Mean Squared Error on predicted 2D keypoint coordinates.",
    code: `module.exports = (pred, gt) => {
  const errs = pred.points.map((p,i) => {
    const dx = p.x - gt.points[i].x;
    const dy = p.y - gt.points[i].y;
    return dx*dx + dy*dy;
  });
  return errs.reduce((a,b) => a + b, 0) / errs.length;
};`,
    tradeoffs: ["fast-compute", "sensitive-to-outliers"],
    useCases: ["pose-estimation", "facial-landmark"],
  },
  {
    id: "anomaly_score",
    name: "Anomaly Detection Reward",
    description: "Distance from normal-feature manifold → higher means more anomalous.",
    code: `const { featureExtractor } = require('my-vision-lib');
module.exports = (pred, gt) => {
  const fPred = featureExtractor(pred.image);
  const fGt   = featureExtractor(gt.image);
  return euclideanDistance(fPred, fGt);
};`,
    tradeoffs: ["domain-expert", "heavy-compute"],
    useCases: ["manufacturing-QA", "surveillance-anomaly"],
  },
  {
    id: "custom_weighted",
    name: "Custom Weighted Blend",
    description: "Composite: 70% IoU + 30% recall penalty → tune with slider.",
    code: `module.exports = ({pred,gt,weight=0.7}) => {
  const inter = computeIntersectionArea(pred.bbox, gt.bbox);
  const union = computeUnionArea(pred.bbox, gt.bbox);
  const iou = inter/union;
  const rec = inter / gt.bbox.area;
  return weight * iou + (1-weight) * rec;
};`,
    tradeoffs: ["configurable", "requires-param-tuning"],
    useCases: ["ecommerce-detection", "custom"],
  },
  {
    id: "rouge_text",
    name: "ROUGE-L (Longest Common Subsequence)",
    description: "Text overlap metric rewarding longest matching sequences.",
    code: `const { rougeL } = require('nlp-metrics');
module.exports = (pred, gt) => rougeL(pred.text, gt.text);`,
    tradeoffs: ["semantic-lenient", "slower-text"],
    useCases: ["image-captioning", "document-analysis"],
  },
]; 