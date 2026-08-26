export default function AttentionScore({ score }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-sm text-gray-500">Attention Score</span>
      <span className="text-2xl font-semibold text-indigo-600">{score}%</span>
    </div>
  );
}