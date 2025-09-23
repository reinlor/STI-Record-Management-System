function OffensesTab({ offenseName, onClick }) {
    return (
        <div
            onClick={onClick}
            className="cursor-pointer rounded-2xl p-6 bg-white shadow-md hover:shadow-xl transition duration-300 border border-gray-200 w-full h-full flex flex-col justify-center"
        >
            <h2 className="font-semibold text-lg sm:text-xl mb-2 text-gray-800 text-center">
                {offenseName}
            </h2>
            <p className="text-gray-500 text-sm text-center">Tap to view details</p>
        </div>
    );
}

export default OffensesTab;
