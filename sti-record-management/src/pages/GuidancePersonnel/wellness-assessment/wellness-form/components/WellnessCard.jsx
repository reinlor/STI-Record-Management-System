import { CirclePlus } from 'lucide-react';

function Card({ name, description, type, plus = false, setDisplay }) {
    return (
        <div
            onClick={setDisplay}
            className={`cursor-pointer rounded-2xl shadow-lg p-4 w-full max-w-xs min-h-[180px] flex flex-col items-center justify-center text-center transition-transform duration-200 hover:scale-105
    ${type === "addNew" ? "bg-[#0172bd] border-2 border-gray-100" : "bg-white border-2 border-gray-100"}
  `}
        >
            {!plus ? (
                <>
                    <h2 className="text-lg font-bold text-[#0172bd]">{name}</h2>
                    <p className="text-sm text-gray-700 mt-2">{description}</p>
                </>
            ) : (
                <CirclePlus size={64} className="text-white" />
            )}
        </div>
    );
}

export default Card;
