import React, { useState, Fragment, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  Check,
  Pencil,
  Archive,
} from "lucide-react";
import user from "../../../assets/user.png";

import CaseInfoSection from "./components/CaseInfoSection.jsx";
import AddCaseModal from "./components/AddCaseModal.jsx";
import {
  caseFieldDefinitions,
  serverViolationToUIDetails,
  uiDetailsToServerPayload,
} from "./components/CaseUtils.jsx";

function StudentCases() {
  const myRef = useRef();
  const casesListRef = useRef(null);
  const itemRefs = useRef(new Map());
  const [visibleIds, setVisibleIds] = useState(new Set());

  const [cases, setCases] = useState([]);
  const [caseDetailsMap, setCaseDetailsMap] = useState({});
  const [activeTab, setActiveTab] = useState("On-going");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [infoType, setInfoType] = useState("caseDetails");
  const [editedCaseData, setEditedCaseData] = useState(null);
  const location = useLocation();

  const [newCaseForm, setNewCaseForm] = useState({
    studentName: "",
    studentId: "",
    dateOfInitiation: "",
    timeOfInitiation: "",
    counselingTypeCategory: "",
    detailedDescription: "",
    proofDescription: "",
    proofImage: null,
    actions: "",
    dateOfAction: "",
    caseStatus: "On-going",
    counselorNotes: "",
  });

  const handleNewCaseFormChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setNewCaseForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setNewCaseForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleIds((prev) => {
          const next = new Set(prev);
          entries.forEach((entry) => {
            const id = entry.target.getAttribute("data-case-id");
            if (!id) return;
            if (entry.isIntersecting) {
              next.add(id);
            } else {
              next.delete(id);
            }
          });
          return next
        })
      },
      {
        root: casesListRef.current,
        rootMargin: "200px",
        threshold: 0.1
      }
    );

    itemRefs.current.forEach((el) => {
      if(el) observer.observe(el);
    })

    return () => observer.disconnect()
  }, [cases, searchTerm, activeTab])

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await axios.get("/cases");
        const violations = Array.isArray(res.data) ? res.data : [];
        const list = violations.map((v) => ({
          id: v.id,
          studentName: v.name ?? "Unknown",
          studentId: v.sid ?? "",
          status: v.status ?? "On-going",
        }));
        const details = {};
        violations.forEach((v) => {
          details[v.id] = v;
        });

        setCases(list);
        setCaseDetailsMap(details);
      } catch (err) {
        console.error("Failed to fetch cases", err);
        setCases([]);
        setCaseDetailsMap({});
      }
    };

    fetchCases();
    console.log('My ref', myRef.current);
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      const raw = caseDetailsMap[selectedCaseId];
      const ui = serverViolationToUIDetails(raw);
      setEditedCaseData(ui ? JSON.parse(JSON.stringify(ui)) : null);
      setIsEditing(false);
    } else {
      setEditedCaseData(null);
      setIsEditing(false);
    }
  }, [selectedCaseId, caseDetailsMap]);

  useEffect(() => {
    const { idSearch } = location.state || {};
    if (idSearch !== undefined && idSearch !== null) {
      setSearchTerm(idSearch);
    }
  }, []);

  const handleAddCase = async () => {
    if (
      !newCaseForm.studentName ||
      !newCaseForm.studentId ||
      !newCaseForm.counselingTypeCategory
    ) {
      alert(
        "Please fill in Student Name, Student ID, and Counseling Type/Category."
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("sid", newCaseForm.studentId || "");
      formData.append("name", newCaseForm.studentName || "");
      formData.append("initiationDate", newCaseForm.dateOfInitiation || "");
      formData.append("initialTime", newCaseForm.timeOfInitiation || "");
      formData.append(
        "counselingType",
        newCaseForm.counselingTypeCategory || ""
      );
      formData.append(
        "detailedDescription",
        newCaseForm.detailedDescription || ""
      );
      formData.append("proofDescription", newCaseForm.proofDescription || "");
      formData.append("actionTaken", newCaseForm.actions || "");
      formData.append("dateOfAction", newCaseForm.dateOfAction || "");
      formData.append("status", newCaseForm.caseStatus || "On-going");
      formData.append("notes", newCaseForm.counselorNotes || "");
      if (newCaseForm.proofImage) {
        formData.append("proof", newCaseForm.proofImage);
      }

      await axios.post("/cases/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const refresh = await axios.get("/cases");
      const violations = Array.isArray(refresh.data) ? refresh.data : [];
      const list = violations.map((v) => ({
        id: v.id,
        studentName: v.name ?? "Unknown",
        studentId: v.sid ?? "",
        status: v.status ?? "On-going",
      }));
      const details = {};
      violations.forEach((v) => {
        details[v.id] = v;
      });

      setCases(list);
      setCaseDetailsMap(details);

      setNewCaseForm({
        studentName: "",
        studentId: "",
        dateOfInitiation: "",
        timeOfInitiation: "",
        counselingTypeCategory: "",
        detailedDescription: "",
        proofDescription: "",
        proofImage: null,
        actions: "",
        dateOfAction: "",
        caseStatus: "On-going",
        counselorNotes: "",
      });
      setShowAddModal(false);
      alert("Case Added Successfully!");
    } catch (err) {
      console.error("Error adding case", err);
      alert("Error adding case.");
    }
  };

  const handleArchiveCase = async () => {
    if (!selectedCaseId) return;

    try {
      await axios.put(`/cases/update/${selectedCaseId}`, {
        status: "Resolved",
      });

      setCases((prev) =>
        prev.map((c) =>
          c.id === selectedCaseId ? { ...c, status: "Resolved" } : c
        )
      );
      setCaseDetailsMap((prev) => {
        const next = { ...prev };
        if (next[selectedCaseId]) next[selectedCaseId].status = "Resolved";
        return next;
      });

      setSelectedCaseId(null);
      alert("Case status updated to Resolved!");
    } catch (err) {
      console.error("Error updating case status", err);
      alert("Error archiving case.");
    }
  };

  const handleSaveEdits = async () => {
    if (!editedCaseData || !selectedCaseId) return;

    try {
      const payload = uiDetailsToServerPayload(editedCaseData);
      await axios.put(`/cases/update/${selectedCaseId}`, payload);

      const res = await axios.get("/cases");
      const violations = Array.isArray(res.data) ? res.data : [];
      const list = violations.map((v) => ({
        id: v.id,
        studentName: v.name ?? "Unknown",
        studentId: v.sid ?? "",
        status: v.status ?? "On-going",
      }));
      const details = {};
      violations.forEach((v) => {
        details[v.id] = v;
      });

      setCases(list);
      setCaseDetailsMap(details);

      setIsEditing(false);
      alert("Changes saved successfully!");
    } catch (err) {
      console.error("Error saving edits", err);
      alert("Error saving changes.");
    }
  };

  const handleCaseFieldChange = (category, field, value) => {
    setEditedCaseData((prevData) => {
      if (!prevData) return prevData;
      const newData = JSON.parse(JSON.stringify(prevData));
      if (!newData[category]) newData[category] = {};
      newData[category][field] = value;
      return newData;
    });
  };

  const filteredCases = cases.filter((c) => {
    const matchesTab =
      (activeTab === "All" &&
        (c.status === "On-going" || c.status === "Resolved")) ||
      c.status === activeTab;
    const matchesSearch =
      searchTerm === "" ||
      (c.studentName &&
        c.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.studentId &&
        c.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.id && c.id.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const displayCaseData =
    isEditing && editedCaseData
      ? editedCaseData
      : selectedCaseId
        ? serverViolationToUIDetails(caseDetailsMap[selectedCaseId])
        : null;

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <div
        className={`w-96 bg-white border-r border-gray-200 shadow-lg flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <h2 className="text-3xl font-bold text-gray-800">Student Cases</h2>
          </div>

          <div className="flex justify-around bg-gray-200 p-1 rounded-lg mb-4">
            <button
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out cursor-pointer hover:bg-[#003d54] ${activeTab === "Resolved"
                ? "bg-[#0A1220] text-white shadow-sm hover:bg-[#003d54]"
                : "text-gray-700 hover:bg-gray-300"
                }`}
              onClick={() => setActiveTab("Resolved")}
            >
              Resolved
            </button>
            <button
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out cursor-pointer ${activeTab === "On-going"
                ? "bg-[#0A1220] text-white shadow-sm hover:bg-[#003d54]"
                : "text-gray-700 hover:bg-gray-300"
                }`}
              onClick={() => setActiveTab("On-going")}
            >
              On-going
            </button>
          </div>

          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Name/ ID"
              className="w-full pl-2 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="w-full bg-[#0A1220] hover:bg-[#003d54] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out shadow-md hover:shadow-lg cursor-pointer"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Case
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
          {filteredCases.length > 0 ? (
            filteredCases.map((aCase) => (
              <div
                ref={(el) => {
                  if (el) {
                    itemRefs.current.set(aCase.id, el);
                  } else {
                    itemRefs.current.delete(aCase.id);
                  }
                }}
                data-case-id={aCase.id}
                key={aCase.id}
                className={`flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer transition duration-150 ease-in-out ${selectedCaseId === aCase.id
                  ? "bg-blue-100 border-l-4 border-blue-500"
                  : "hover:bg-gray-50"
                  }`}
                onClick={() => setSelectedCaseId(aCase.id)}
              >
                {visibleIds.has(aCase.id) ? (<div className="flex items-center">
                  <img
                    src={user}
                    alt="User"
                    className="w-5 h-5 object-cover mr-5"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {aCase.studentName}
                    </p>
                    <p className="text-sm text-gray-600">{aCase.studentId}</p>
                  </div>
                </div>): null}
                <ChevronRight className="w-5 h-5 text-[#0A1220]" />
              </div>
            ))
          ) : (
            <p className="p-4 text-gray-500 text-center">No cases found.</p>
          )}
        </div>
      </div>

      <div className={`flex-1 bg-white flex flex-col`}>
        <Fragment>
          <div className="p-3 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                className="p-2 rounded-full hover:bg-gray-200 transition duration-150 ease-in-out cursor-pointer"
                onClick={() => setSelectedCaseId(null)}
              >
                <ChevronLeft className="w-8 h-8 text-gray-700" />
              </button>
              <select
                className="block px-3 sm:px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out appearance-none bg-white pr-8 text-sm sm:text-base cursor-pointer"
                value={infoType}
                onChange={(e) => setInfoType(e.target.value)}
              >
                <option value="caseDetails">Case Details</option>
                <option value="proof">Proof</option>
                <option value="actionsTaken">Actions Taken</option>
                <option value="counselorNotes">Counselor's Notes</option>
              </select>
            </div>

            {selectedCaseId !== null ? (
              <div className="flex items-center space-x-2 sm:space-x-3 mt-2 sm:mt-0">
                <button
                  className={`px-3 sm:px-4 py-2 rounded-lg flex items-center transition duration-150 ease-in-out text-sm sm:text-base font-medium cursor-pointer ${isEditing
                    ? "bg-gray-500 text-white shadow-md"
                    : "bg-gray-800 hover:bg-gray-700 text-white shadow-md hover:shadow-lg"
                    }`}
                  onClick={() => {
                    if (isEditing) {
                      handleSaveEdits();
                    }
                    setIsEditing(!isEditing);
                  }}
                >
                  {isEditing ? "Save" : "Edit Case"}
                  <Pencil className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 sm:px-4 rounded-lg flex items-center transition duration-150 ease-in-out shadow-md hover:shadow-lg cursor-pointer"
                  onClick={handleArchiveCase}
                >
                  Resolve Case
                  <Archive className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
                </button>
              </div>
            ) : null}
          </div>

          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {displayCaseData ? (
              <CaseInfoSection
                infoType={infoType}
                caseData={displayCaseData[infoType]}
                isEditing={isEditing}
                onFieldChange={handleCaseFieldChange}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-xl p-4 text-center">
                Select a case from the list to view its information.
              </div>
            )}
          </div>
        </Fragment>
      </div>

      <AddCaseModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        newCaseForm={newCaseForm}
        onChange={handleNewCaseFormChange}
        onSave={handleAddCase}
      />
    </div>
  );
}

export default StudentCases;
