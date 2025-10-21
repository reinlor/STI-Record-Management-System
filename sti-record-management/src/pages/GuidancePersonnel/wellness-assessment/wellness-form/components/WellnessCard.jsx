// WellnessCard.jsx (full component)
import { CirclePlus } from 'lucide-react';

function Card({ name, description, type, plus = false, setDisplay, processedBy, timeCreated, schoolYear, isReleased = false }) {

    function parseToMillis(dateInput) {
        if (!dateInput) return null;

        if (typeof dateInput === 'object' && typeof dateInput.toDate === 'function') {
            try {
                return dateInput.toDate().getTime();
            } catch {
                return null;
            }
        }

        if (typeof dateInput === 'object' && (dateInput.seconds !== undefined || dateInput._seconds !== undefined)) {
            const seconds = dateInput.seconds ?? dateInput._seconds;
            const nanos = dateInput.nanoseconds ?? dateInput._nanoseconds ?? 0;
            return (Number(seconds) * 1000) + Math.floor(Number(nanos) / 1e6);
        }

        if (typeof dateInput === 'number') {
            return dateInput > 1e12 ? dateInput : dateInput * 1000;
        }

        if (typeof dateInput === 'string') {
            const parsed = Date.parse(dateInput);
            if (!isNaN(parsed)) return parsed;

            const simplified = dateInput.replace(/\s+at\s+/i, ' ').replace(/UTC.*$/i, '').trim();
            const parsed2 = Date.parse(simplified);

            if (!isNaN(parsed2)) return parsed2;
        }

        return null;
    }

    function formatDate(dateInput) {
        const ms = typeof dateInput === 'number' ? dateInput : parseToMillis(dateInput);
        if (!ms) return '';
        const d = new Date(ms);

        const datePart = d.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'Asia/Manila'
        });
        const timePart = d.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone: 'Asia/Manila'
        });

        return `${datePart} at ${timePart}`;
    }

    const indicatorColor = isReleased ? '#10b981' : '#9ca3af'; // green or gray

    return (
        <div
            onClick={setDisplay}
            className={`cursor-pointer rounded-2xl shadow-lg p-4 w-full max-w-xs min-h-[180px] flex flex-col 
            items-start justify-start text-left transition-transform duration-200 hover:scale-105
            ${type === "addNew" ? "bg-[#0172bd] border-2 border-gray-100" : "bg-white border-2 border-gray-100"}`}
            style={{ position: 'relative' }}
        >
            {/* Left indicator */}
            {!plus && (
                <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 6,
                    background: indicatorColor,
                    borderTopLeftRadius: 12,
                    borderBottomLeftRadius: 12
                }} />
            )}

            {!plus ? (
                <div className="w-full pl-3"> {/* add padding left to avoid the indicator */}
                    <h2 className="text-lg font-bold text-[#0172bd]">{name}</h2>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-3 overflow-hidden">{description}</p>
                    <div className="mt-3 text-sm text-gray-700">
                        <div>Created By: <span className="font-medium">{processedBy}</span></div>
                        <div>Time Created: <span className="font-medium">{formatDate(timeCreated)}</span></div>
                        <div>School Year: <span className="font-medium">{schoolYear}</span></div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center w-full">
                    <CirclePlus size={64} className="text-white" />
                </div>
            )}
        </div>
    );
}

export default Card;
