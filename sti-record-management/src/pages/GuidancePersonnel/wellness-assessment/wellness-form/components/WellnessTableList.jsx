
function WellnessTableList({ data }) {
    if (data.length === 0) {
        return <div>There is no data</div>;
    }

    const groupedData = data.reduce((acc, currentItem) => {
        if (!acc[currentItem.category]) {
            acc[currentItem.category] = [];
        }
        acc[currentItem.category].push(currentItem);
        return acc;
    }, {});

    return (
        <div className="space-y-8">
            {Object.keys(groupedData).map(category => (
                <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-indigo-700 border-b pb-2 mb-4">{category}</h2>
                    <div className="space-y-4">
                        {groupedData[category].map((res, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border-l-4 border-indigo-400 hover:shadow transition">
                                <h3 className="font-semibold text-gray-800 mb-2">{res.question}</h3>
                                <ul className="space-y-1 pl-2">
                                    {res.options.map((option, optionIndex) => (
                                        <li key={optionIndex} className="text-gray-600 flex items-center">
                                            <span className="text-indigo-500 font-medium mr-2">{optionIndex + 1}.</span>
                                            {option}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default WellnessTableList