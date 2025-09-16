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
        studentRecords: { canView: true, canEdit: true },
        requestSlip: false,
        referralForm: false,
        backupRestore: true,
        wellness: true,
        userManagement: { canView: true, canEdit: true },
    },
    Disciplinary: {
        studentCases: { canView: true, canEdit: true },
        studentRecords: { canView: true, canEdit: false },
        requestSlip: true,
        referralForm: false,
        backupRestore: false,
        wellness: false,
        userManagement: { canView: false, canEdit: false },
    },
    Teacher: undefined,
};

export const serverToUIAccess = (srv = {}) => ({
    'Student 201 Files': {
        canView: !!srv.studentRecords?.canView,
        canEdit: !!srv.studentRecords?.canEdit,
    },
    'Student Cases': {
        canView: !!srv.studentCases?.canView,
        canEdit: !!srv.studentCases?.canEdit,
    },
    'Request Slips Form': !!srv.requestSlip,
    'Referral Forms': !!srv.referralForm,
    'Backup and Restore': !!srv.backupRestore,
    'Student Wellness': !!srv.wellness,
});

export const uiToServerAccess = (ui) => ({
    studentCases: {
        canView: ui['Student Cases']?.canView || false,
        canEdit: ui['Student Cases']?.canEdit || false,
    },
    studentRecords: {
        canView: ui['Student 201 Files']?.canView || false,
        canEdit: ui['Student 201 Files']?.canEdit || false,
    },
    requestSlip: !!ui['Request Slips Form'],
    referralForm: !!ui['Referral Forms'],
    backupRestore: !!ui['Backup and Restore'],
    wellness: !!ui['Student Wellness'],
    userManagement: {
        canView: ui['User Management']?.canView ?? true,
        canEdit: ui['User Management']?.canEdit ?? true,
    },
});
