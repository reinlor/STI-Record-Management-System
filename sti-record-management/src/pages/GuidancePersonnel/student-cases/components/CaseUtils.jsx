export const caseFieldDefinitions = {
    caseDetails: [
        { key: 'studentName', label: 'Full Name', type: 'text' },
        { key: 'studentId', label: 'Student ID', type: 'text' },
        { key: 'dateOfInitiation', label: 'Date of Case Initiation', type: 'date' },
        { key: 'timeOfInitiation', label: 'Time of Initiation', type: 'time' },
        { key: 'counselingTypeCategory', label: 'Counseling Type/Category', type: 'text' },
        { key: 'caseStatus', label: 'Case Status', type: 'select', options: ['On-going', 'Resolved'] },
        { key: 'detailedDescription', label: 'Detailed Description', type: 'textarea', multiline: true },
    ],
    proof: [
        { key: 'proofDescription', label: 'Proof Description', type: 'textarea', multiline: true },
        { key: 'proofImage', label: 'Proof', type: 'file' },
    ],
    actionsTaken: [
        { key: 'actions', label: 'Actions Taken/Disciplinary Measures', type: 'textarea', multiline: true },
        { key: 'dateOfAction', label: 'Date of Action', type: 'date' },
    ],
    counselorNotes: [
        { key: 'notes', label: "Counselor's Notes", type: 'textarea', multiline: true },
    ],
};

// Convert a server violation object -> UI grouped structure used by CaseInfoSection
export const serverViolationToUIDetails = (violation) => {
    if (!violation) return null;

    return {
        caseDetails: {
            studentName: violation.name ?? 'N/A',
            studentId: violation.sid ?? 'N/A',
            dateOfInitiation: violation.initiationDate ?? 'N/A',
            timeOfInitiation: violation.initialTime ?? 'N/A',
            counselingTypeCategory: violation.counselingType ?? 'N/A',
            caseStatus: violation.status ?? 'On-going',
            detailedDescription: violation.detailedDescription ?? 'N/A',
        },
        proof: {
            proofDescription: violation.proofDescription ?? 'N/A',
            proofImage: violation.proofUrl ?? null,
        },
        actionsTaken: {
            actions: violation.actionTaken ?? 'N/A',
            dateOfAction: violation.dateOfAction ?? 'N/A',
        },
        counselorNotes: {
            notes: violation.notes ?? 'N/A',
        },
    };
};

// Convert UI grouped structure (editedCaseData) -> server payload shape for POST/PUT
export const uiDetailsToServerPayload = (uiGrouped) => {
    if (!uiGrouped) return {};
    const cd = uiGrouped.caseDetails || {};
    const pf = uiGrouped.proof || {};
    const act = uiGrouped.actionsTaken || {};
    const cn = uiGrouped.counselorNotes || {};

    return {
        sid: cd.studentId ?? '',
        name: cd.studentName ?? '',
        initiationDate: cd.dateOfInitiation ?? '',
        initialTime: cd.timeOfInitiation ?? '',
        counselingType: cd.counselingTypeCategory ?? '',
        detailedDescription: cd.detailedDescription ?? '',
        proofDescription: pf.proofDescription ?? '',
        proofUrl: pf.proofImage ?? '',
        actionTaken: act.actions ?? '',
        dateOfAction: act.dateOfAction ?? '',
        status: cd.caseStatus ?? 'On-going',
        notes: cn.notes ?? '',
    };
};