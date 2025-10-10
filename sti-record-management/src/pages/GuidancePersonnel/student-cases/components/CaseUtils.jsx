function timestampToString(timestamp, locale = 'en-US') {
    if (!timestamp) {
        return '';
    }

    let date;

    if (typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
    }
    else if (timestamp instanceof Date) {
        date = timestamp;
    }
    else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
    } else {
        console.warn("Input is not a recognized Date or Timestamp format:", timestamp);
        return '';
    }

    if (isNaN(date.getTime())) {
        console.error("Invalid date object created from input:", timestamp);
        return 'Invalid Date';
    }

    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'shortOffset',
    };

    try {
        return new Intl.DateTimeFormat(locale, options).format(date);
    } catch (error) {
        console.error(`Error formatting date for locale ${locale}:`, error);
        return date.toLocaleString(locale, options);
    }
}

export const caseFieldDefinitions = {
    caseDetails: [
        { key: 'studentName', label: 'Full Name', type: 'text' },
        { key: 'studentId', label: 'Student ID', type: 'text' },
        { key: 'dateOfInitiation', label: 'Date of Case Initiation', type: 'date' },
        { key: 'timeOfInitiation', label: 'Time of Initiation', type: 'time' },
        { key: 'counselingTypeCategory', label: 'Counseling Type/Category', type: 'text' },
        { key: 'caseStatus', label: 'Case Status', type: 'select', options: ['On-going', 'Resolved'] },
        { key: 'detailedDescription', label: 'Detailed Description', type: 'textarea', multiline: true },
        { key: 'violation', label: 'Violation', type: 'text' },
        { key: 'processedBy', label: 'Processed By', type: 'text', disabled: true},
        { key: 'lastUpdate', label: 'Last Updated', type: 'text', disabled: true},
        { key: 'dateSubmitted', label: 'Date Submitted', type: 'text', disabled: true},
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
            violation: violation.violation ?? 'N/A',
            priority: violation.priorityLevel ?? 'N/A',
            processedBy: violation.processedBy ?? 'N/A',
            lastUpdate: timestampToString(violation.lastUpdate) ?? 'N/A',
            dateSubmitted: timestampToString(violation.timeCreated) ?? 'N/A'
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
        priorityLevel: cd.priority ?? ''
    };
};