function OffensesTab({ offenseName, onClick }) {
    return (
        <div
            onClick={onClick}
            className="cursor-pointer rounded-2xl p-6 bg-white shadow-lg hover:shadow-xl transition duration-300 border-2 border-gray-100 w-full h-full flex flex-col justify-center"
        >
            <h2 className="font-semibold text-lg sm:text-xl mb-2 text-[#0172bd] text-center">
                {offenseName}
            </h2>
            <p className="text-gray-500 text-sm text-center">Tap to view details</p>
        </div>
    );
}

export default OffensesTab;
