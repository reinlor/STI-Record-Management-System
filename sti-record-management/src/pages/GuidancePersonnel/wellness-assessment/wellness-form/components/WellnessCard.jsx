import { CirclePlus } from 'lucide-react';

function Card({ name, description, type, plus = false, setDisplay }) {
    return (
        <div
            onClick={setDisplay}
            className={`cursor-pointer rounded-2xl shadow-md p-6 w-80 min-h-[200px] flex flex-col items-center justify-center text-center transition-transform duration-200 hover:scale-105
        ${type === "addNew" ? "bg-yellow-300" : "bg-white border border-gray-200"}
      `}
        >
            {!plus ? (
                <>
                    <h2 className="text-lg font-semibold text-gray-800">{name}</h2>
                    <p className="text-sm text-gray-600 mt-2">{description}</p>
                </>
            ) : (
                <CirclePlus size={64} className="text-gray-700" />
            )}
        </div>
    );
}

export default Card;
