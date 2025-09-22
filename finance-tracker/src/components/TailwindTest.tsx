export default function TailwindTest() {
  return (
    <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <h2 className="text-xl font-bold mb-2">Tailwind CSS Test</h2>
      <p className="text-sm">This component verifies Tailwind CSS is working correctly.</p>
      <button className="mt-2 bg-white text-blue-500 px-4 py-2 rounded hover:bg-gray-100 transition-colors">
        Test Button
      </button>
    </div>
  );
}
