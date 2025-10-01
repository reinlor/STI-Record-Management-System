function ColorLegend({ colors }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Legend</h3>
      <div className="space-y-2">
        {colors.map((item, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`w-4 h-4 rounded-full mr-2`}
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-gray-700">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorLegend;