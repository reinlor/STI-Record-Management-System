import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingDots from "../../../../component/Loading";

export default function CasesTable({ studentId }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId) {
      setCases([]);
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchCases = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/cases/allViolations/${studentId}`);
        let data = res.data;

        if (!Array.isArray(data)) {
          if (data.data && Array.isArray(data.data)) {
            data = data.data;
          } else {
            data = [data];
          }
        }

        data.sort((a, b) => {
          const aDate = extractDate(a.timeCreated || a.date || a.createdAt);
          const bDate = extractDate(b.timeCreated || b.date || b.createdAt);
          return bDate - aDate;
        });

        if (mounted) setCases(data);
      } catch (err) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCases();
    return () => {
      mounted = false;
    };
  }, [studentId]);

  const tableHeaderClass = "bg-[#0172bd] text-white font-bold px-4 py-2";
  const tableCellClass = "px-4 py-3 whitespace-nowrap";
  const tableRowClass = "hover:bg-gray-100 transition";

  // 🔹 Convert Firestore timestamp OR normal date string → JS Date
  const extractDate = (val) => {
    if (!val) return new Date(0);

    // Firestore timestamp object
    if (typeof val === "object" && val._seconds !== undefined) {
      return new Date(val._seconds * 1000 + Math.floor(val._nanoseconds / 1e6));
    }

    // already a Date
    if (val instanceof Date) return val;

    // number (milliseconds or seconds)
    if (typeof val === "number") {
      return val > 1e12 ? new Date(val) : new Date(val * 1000);
    }

    // fallback parse string
    const parsed = new Date(val);
    return isNaN(parsed) ? new Date(0) : parsed;
  };

  const formatDate = (val) => {
    const d = extractDate(val);
    if (!d || isNaN(d.getTime())) return "";
    return d.toLocaleString();
  };

  return (
    <div className="mt-6 overflow-x-auto rounded-lg shadow">
      {loading ? <LoadingDots /> : (<table className="w-full text-left">
        <thead>
          <tr>
            <th className={tableHeaderClass}>Case ID</th>
            <th className={tableHeaderClass}>Violation</th>
            <th className={tableHeaderClass}>Date</th>
            <th className={tableHeaderClass}>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className="text-center py-8 text-gray-400">
                Loading cases...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={4} className="text-center py-8 text-red-500">
                Error loading cases. {error.message}
              </td>
            </tr>
          ) : cases.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-8 text-gray-400">
                No cases found for this student.
              </td>
            </tr>
          ) : (
            cases.map((c) => {
              const id = c._id || c.id || c.caseId || "";
              const violation =
                c.violation || c.offense || c.type || c.title || "";
              const status = c.status || c.caseStatus || "";

              return (
                <tr key={id || Math.random()} className={tableRowClass}>
                  <td className={tableCellClass}>{id}</td>
                  <td className={tableCellClass}>{violation}</td>
                  <td className={tableCellClass}>
                    {formatDate(c.timeCreated || c.date || c.createdAt)}
                  </td>
                  <td className={tableCellClass}>{status}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>)}
    </div>
  );
}
