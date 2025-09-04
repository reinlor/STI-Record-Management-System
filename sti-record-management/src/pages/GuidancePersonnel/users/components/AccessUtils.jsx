export const accessPermissions = [
    'Student 201 Files',
    'Student Cases',
    'Request Slips Form',
    'Referral Forms',
    'Backup and Restore',
    'Student Wellness',
];

export const initialNewUserAccess = accessPermissions.reduce((acc, curr) => {
    if (['Student 201 Files', 'Student Cases'].includes(curr)) {
        acc[curr] = { canView: false, canEdit: false };
    } else {
        acc[curr] = false;
    }
    return acc;
}, {});

export const serverAccessPresets = {
    Admin: {
        studentCases: { canView: true, canEdit: false },
        backupRestore: { canView: true },
        userManagement: { canView: true, canEdit: true },
        requestSlip: { canView: false },
        wellness: { canView: true },
        referralForm: { canView: false },
        studentRecords: { canView: true, canEdit: true },
    },
    Disciplinary: {
        studentCases: { canView: true, canEdit: true },
        backupRestore: { canView: false },
        userManagement: { canView: false, canEdit: false },
        requestSlip: { canView: true },
        wellness: { canView: false },
        referralForm: { canEdit: true },
        studentRecords: { canView: true, canEdit: false },
    },
    Teacher: undefined,
};

export const serverToUIAccess = (srv = {}) => {
    return {
        'Student 201 Files': srv.studentRecords ? { canView: !!srv.studentRecords.canView, canEdit: !!srv.studentRecords.canEdit } : { canView: false, canEdit: false },
        'Student Cases': srv.studentCases ? { canView: !!srv.studentCases.canView, canEdit: !!srv.studentCases.canEdit } : { canView: false, canEdit: false },
        'Request Slips Form': srv.requestSlip ? !!(srv.requestSlip.canView || srv.requestSlip === true) : false,
        'Referral Forms': srv.referralForm ? !!(srv.referralForm.canEdit || srv.referralForm.canView || srv.referralForm === true) : false,
        'Backup and Restore': srv.backupRestore ? !!(srv.backupRestore.canView || srv.backupRestore === true) : false,
        'Student Wellness': srv.wellness ? !!(srv.wellness.canView || srv.wellness === true) : false,
    };
};

export const uiToServerAccess = (ui = {}) => {
    const srv = {};
    if (ui['Student 201 Files']) {
        srv.studentRecords = { canView: !!ui['Student 201 Files'].canView, canEdit: !!ui['Student 201 Files'].canEdit };
    }
    if (ui['Student Cases']) {
        srv.studentCases = { canView: !!ui['Student Cases'].canView, canEdit: !!ui['Student Cases'].canEdit };
    }
    if (ui['Request Slips Form']) {
        srv.requestSlip = { canView: true };
    }
    if (ui['Referral Forms']) {
        srv.referralForm = { canEdit: true };
    }
    if (ui['Backup and Restore']) {
        srv.backupRestore = { canView: true };
    }
    if (ui['Student Wellness']) {
        srv.wellness = { canView: true };
    }
    return srv;
};