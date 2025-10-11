export const fieldDefinitions = {
    basic: [
        { key: 'fullName', label: 'Full Name', type: 'text' },
        { key: 'studentId', label: 'Student ID', type: 'text' },
        { key: 'emailAddress', label: 'Email', type: 'email' },
        { key: 'mobilePhoneNumber', label: 'Contact No', type: 'tel' },
        { key: 'academicLevel', label: 'Academic Level', type: 'text' },
        { key: 'programYearSection', label: 'Program and Year/Section', type: 'text', multiline: true },
        { key: 'gender', label: 'Gender', type: 'radio', options: ['Male', 'Female', 'Others'] },
        { key: 'birthDate', label: 'Birth Date', type: 'date' },
        { key: 'address', label: 'Address', type: 'textarea' },
        { key: 'emergencyContact', label: 'Emergency Contact', type: 'text' },
        { key: 'healthCondition', label: 'Health Condition/s', type: 'array' },
    ],
    personal: [
        { key: 'fullName', label: 'Full Name', type: 'text' },
        { key: 'nickname', label: 'Nickname', type: 'text' },
        { key: 'studentId', label: 'Student ID', type: 'text' },
        { key: 'gradeYearLevel', label: 'Grade/Year Level', type: 'text' },
        { key: 'tertiaryCollegeProgram', label: 'Tertiary College Program', type: 'text' },
        { key: 'section', label: 'Section', type: 'text' },
        { key: 'birthDate', label: 'Birth Date', type: 'date' },
        { key: 'nationality', label: 'Nationality', type: 'text' },
        { key: 'gender', label: 'Gender', type: 'radio', options: ['Male', 'Female', 'Others'] },
        { key: 'religion', label: 'Religion', type: 'text' },
        { key: 'status', label: 'Status', type: 'text' },
    ],
    contact: [
        { key: 'mobilePhoneNumber', label: 'Mobile Phone Number', type: 'tel' },
        { key: 'emailAddress', label: 'Email Address', type: 'email' },
        { key: 'homeNumber', label: 'Home Number', type: 'tel' },
        { key: 'presentAddress', label: 'Present Address', type: 'textarea' },
        { key: 'permanentAddress', label: 'Permanent Address', type: 'textarea' },
        { key: 'working', label: 'Working', type: 'text' },
        { key: 'emergencyContact', label: 'Emergency Contact', type: 'text' },
        { key: 'contactNumber', label: 'Contact Number', type: 'tel' },
    ],
    family: [
        { key: 'fatherName', label: "Father's Name", type: 'text' },
        { key: 'fatherAge', label: "Father's Age", type: 'number' },
        { key: 'fatherBirthDate', label: "Father's Birth Date", type: 'date' },
        { key: 'fatherNationality', label: "Father's Nationality", type: 'text' },
        { key: 'fatherReligion', label: "Father's Religion", type: 'text' },
        { key: 'fatherEducationalAttainment', label: "Father's Educational Attainment", type: 'text' },
        { key: 'fatherOccupation', label: "Father's Occupation", type: 'text' },
        { key: 'fatherContactNumber', label: "Father's Contact Number", type: 'tel' },
        { key: 'fatherEmailAddress', label: "Father's Email Address", type: 'email' },
        { key: 'motherName', label: "Mother's Name", type: 'text' },
        { key: 'motherAge', label: "Mother's Age", type: 'number' },
        { key: 'motherBirthDate', label: "Mother's Birth Date", type: 'date' },
        { key: 'motherNationality', label: "Mother's Nationality", type: 'text' },
        { key: 'motherReligion', label: "Mother's Religion", type: 'text' },
        { key: 'motherEducationalAttainment', label: "Mother's Educational Attainment", type: 'text' },
        { key: 'motherOccupation', label: "Mother's Occupation", type: 'text' },
        { key: 'motherContactNumber', label: "Mother's Contact Number", type: 'tel' },
        { key: 'motherEmailAddress', label: "Mother's Email Address", type: 'email' },
        { key: 'statusOfParents', label: 'Status of Parents', type: 'text' },
        { key: 'nameOfGuardian', label: 'Name of Guardian', type: 'text' },
        { key: 'typeOfRelationWithGuardian', label: 'Relation with Guardian', type: 'text' },
        { key: 'guardianContactNumber', label: 'Guardian Contact Number', type: 'tel' },
        { key: 'guardianEmailAddress', label: 'Guardian Email Address', type: 'email' },
        { key: 'parentGuardianAddress', label: 'Parent/Guardian Address', type: 'textarea' },
        { key: 'siblings', label: 'Siblings', type: 'array' },
        { key: 'siblingsCount', label: 'Number of Siblings', type: 'number' },
        { key: 'birthOrder', label: 'Birth Order', type: 'text' },
    ],
    educationalBackground: [
        { key: 'nameOfGradeSchool', label: 'Name of Grade School', type: 'text' },
        { key: 'yearsAttendedGradeSchool', label: 'Years Attended Grade School', type: 'text' },
        { key: 'nameOfJuniorHighSchool', label: 'Name of Junior High School', type: 'text' },
        { key: 'yearsAttendedJuniorHighSchool', label: 'Years Attended Junior High School', type: 'text' },
        { key: 'nameOfSeniorHighSchool', label: 'Name of Senior High School', type: 'text' },
        { key: 'yearsAttendedSeniorHighSchool', label: 'Years Attended Senior High School', type: 'text' },
        { key: 'nameOfCollege', label: 'Name of College', type: 'text' },
        { key: 'yearsAttendedCollege', label: 'Years Attended College', type: 'text' },
        { key: 'extraCurricularActivities', label: 'Extra Curricular Activities', type: 'array' },
        { key: 'awards', label: 'Awards/Citations Received', type: 'array' },
        { key: 'mostLikedSubject', label: 'Most Liked Subject', type: 'text' },
        { key: 'leastLikedSubject', label: 'Least Liked Subject', type: 'text' },
    ],
    work: [
        { key: 'nameOfCompanyInstitution', label: 'Name of Company/Institution', type: 'text' },
        { key: 'durationFromTo', label: 'Duration (From-To)', type: 'text' },
        { key: 'jobDescription', label: 'Job Description', type: 'textarea' },
        { key: 'companyContactNo', label: 'Company Contact No', type: 'tel' },
        { key: 'companyEmailAddress', label: 'Company Email Address', type: 'email' },
    ],
    // This are the array values (previosly has type: text or type: textarea )
    interests: [
        { key: 'sports', label: 'Sports', type: 'array' },
        { key: 'hobbies', label: 'Hobbies', type: 'array' },
        { key: 'talents', label: 'Talents', type: 'array' },
        { key: 'socioCivic', label: 'Socio Civic', type: 'array' },
        { key: 'organization', label: 'Organizations Involved', type: 'array' },
    ],
    health: [
        { key: 'hospitalized', label: 'Hospitalized', type: 'array' },
        { key: 'reason', label: 'Reason', type: 'array' },
        { key: 'operation', label: 'Operation', type: 'array' },
        { key: 'illness', label: 'Illness/Condition', type: 'array' },
        { key: 'medicalCert', label: 'Medical Certificate', type: 'array' },
        { key: 'prescribedDrug', label: 'Take Prescribed Drugs', type: 'array' },
        { key: 'hereditary', label: 'Hereditary Illness', type: 'array' },
        { key: 'doctorLastSeen', label: 'Last Saw Doctor', type: 'array' },
    ],
    // 
    life: [
        { key: 'recentLoss', label: 'Recent Loss', type: 'text' },
        { key: 'currentConcern', label: 'Current Concern', type: 'textarea' },
    ],
    violation: [
        { key: "violations", label: "Violations", type: "custom" }
    ]
};

export const normalizeForUI = (raw) => {
    if (!raw) return {};

    const profile = raw.studentProfile || {};
    const contact = raw.contactInfo || {};
    const family = raw.familyBackground || {};
    const edu = raw.educationalBackground || {};
    const work = raw.workExperience || {};
    const interests = raw.interests || {};
    const health = raw.health || {};
    const life = raw.lifeCircumstances || {};

    return {
        basic: {
            fullName: profile.name ?? 'N/A',
            studentId: raw.sid ?? raw.id ?? 'N/A',
            emailAddress: contact.email ?? 'N/A',
            mobilePhoneNumber: contact.contactNo ?? 'N/A',
            academicLevel: profile.academicLevel ?? 'N/A',
            program: profile.program ?? 'N/A',
            section: profile.section ?? 'N/A',
            gender: profile.gender ?? 'N/A',
            birthDate: profile.birthday ?? 'N/A',
            address:
                contact.address?.currentAddress ??
                contact.address?.permanentAddress ??
                'N/A',
            emergencyContact: family?.emergency?.contactNo ?? 'N/A',
            healthCondition: health?.illness ?? 'N/A',
        },

        personal: {
            fullName: profile.name ?? 'N/A',
            nickname: profile.nickname ?? 'N/A',
            studentId: raw.sid ?? raw.id ?? 'N/A',
            gradeYearLevel: profile.academicLevel ?? 'N/A',
            tertiaryCollegeProgram: profile.program ?? 'N/A',
            section: profile.section ?? 'N/A',
            birthDate: profile.birthday ?? 'N/A',
            nationality: profile.nationality ?? 'N/A',
            gender: profile.gender ?? 'N/A',
            religion: profile.religion ?? 'N/A',
            status: profile.status ?? 'N/A',
        },

        contact: {
            mobilePhoneNumber: contact.contactNo ?? 'N/A',
            emailAddress: contact.email ?? 'N/A',
            homeNumber: contact.homeNo ?? 'N/A',
            presentAddress: contact.address?.currentAddress ?? 'N/A',
            permanentAddress: contact.address?.permanentAddress ?? 'N/A',
            working: contact.workNo ?? 'N/A',
            emergencyContact: family?.emergency?.contactNo ?? 'N/A',
            contactNumber: contact.contactNo ?? 'N/A',
        },

        family: {
            fatherName: family?.fatherInfo?.name ?? 'N/A',
            fatherAge: family?.fatherInfo?.age ?? 'N/A',
            fatherBirthDate: family?.fatherInfo?.birthday ?? 'N/A',
            fatherNationality: family?.fatherInfo?.nationality ?? 'N/A',
            fatherReligion: family?.fatherInfo?.religion ?? 'N/A',
            fatherEducationalAttainment: family?.fatherInfo?.educationalAttainment ?? 'N/A',
            fatherOccupation: family?.fatherInfo?.occupation ?? 'N/A',
            fatherContactNumber: family?.fatherInfo?.contactNo ?? 'N/A',
            fatherEmailAddress: family?.fatherInfo?.email ?? 'N/A',

            motherName: family?.motherInfo?.name ?? 'N/A',
            motherAge: family?.motherInfo?.age ?? 'N/A',
            motherBirthDate: family?.motherInfo?.birthday ?? 'N/A',
            motherNationality: family?.motherInfo?.nationality ?? 'N/A',
            motherReligion: family?.motherInfo?.religion ?? 'N/A',
            motherEducationalAttainment: family?.motherInfo?.educationalAttainment ?? 'N/A',
            motherOccupation: family?.motherInfo?.occupation ?? 'N/A',
            motherContactNumber: family?.motherInfo?.contactNo ?? 'N/A',
            motherEmailAddress: family?.motherInfo?.email ?? 'N/A',

            statusOfParents: family?.statusOfParent ?? 'N/A',
            nameOfGuardian: family?.guardian?.name ?? 'N/A',
            typeOfRelationWithGuardian: family?.guardian?.relation ?? 'N/A',
            guardianContactNumber: family?.guardian?.contactNo ?? 'N/A',
            guardianEmailAddress: family?.guardian?.email ?? 'N/A',
            parentGuardianAddress: family?.address ?? 'N/A',

            siblings: Array.isArray(family?.siblings)
                ? family.siblings.join(', ')
                : family?.siblings ?? 'N/A',
            siblingsCount: Array.isArray(family?.siblings)
                ? family.siblings.length
                : 'N/A',
            birthOrder: family?.birthOrder ?? 'N/A',
        },

        educationalBackground: {
            nameOfGradeSchool: edu?.elementary?.schoolName ?? 'N/A',
            yearsAttendedGradeSchool: edu?.elementary?.dateEnrolled ?? 'N/A',
            nameOfJuniorHighSchool: edu?.juniorHighSchool?.schoolName ?? 'N/A',
            yearsAttendedJuniorHighSchool: edu?.juniorHighSchool?.dateEnrolled ?? 'N/A',
            nameOfSeniorHighSchool: edu?.seniorHighSchool?.schoolName ?? 'N/A',
            yearsAttendedSeniorHighSchool: edu?.seniorHighSchool?.dateEnrolled ?? 'N/A',
            nameOfCollege: edu?.college?.schoolName ?? 'N/A',
            yearsAttendedCollege: edu?.college?.dateEnrolled ?? 'N/A',
            extraCurricularActivities: edu?.extraCurricular ?? 'N/A',
            awards: edu?.awards ?? 'N/A',
            mostLikedSubject: edu?.likedSubject ?? 'N/A',
            leastLikedSubject: edu?.leastSubject ?? 'N/A',
        },

        work: {
            nameOfCompanyInstitution: work?.name ?? 'N/A',
            durationFromTo: work?.duration ?? 'N/A',
            jobDescription: work?.description ?? 'N/A',
            companyContactNo: work?.contactNo ?? 'N/A',
            companyEmailAddress: work?.email ?? 'N/A',
        },

        interests: {
            sports: interests?.sports ?? 'N/A',
            hobbies: interests?.hobbies ?? 'N/A',
            talents: interests?.talents ?? 'N/A',
            socioCivic: interests?.socioCivic ?? 'N/A',
            organization: interests?.organization ?? 'N/A',
        },

        health: {
            hospitalized: health?.hospitalized ?? 'N/A',
            reason: health?.reason ?? 'N/A',
            operation: health?.operation ?? 'N/A',
            illness: health?.illness ?? 'N/A',
            medicalCert: health?.medicalCert ?? 'N/A',
            prescribedDrug: health?.prescribedDrug ?? 'N/A',
            hereditary: health?.hereditary ?? 'N/A',
            doctorLastSeen: health?.doctorLastSeen ?? 'N/A',
        },

        life: {
            recentLoss: life?.recentLoss ?? 'N/A',
            currentConcern: life?.currentConcern ?? 'N/A',
        },
    };
};

export const updateRawField = (raw, category, field, value) => {
    if (!raw) return raw;
    const next = JSON.parse(JSON.stringify(raw));

    const setPath = (objPath, v) => {
        const parts = objPath.split('.');
        let cur = next;
        for (let i = 0; i < parts.length - 1; i++) {
            const p = parts[i];
            if (cur[p] === undefined || cur[p] === null) cur[p] = {};
            cur = cur[p];
        }
        cur[parts[parts.length - 1]] = v;
    };

    try {
        switch (category) {
            case 'basic':
                if (field === 'fullName') setPath('studentProfile.name', value);
                if (field === 'studentId') {
                    next.sid = value;
                    next.id = value;
                }
                if (field === 'emailAddress') setPath('contactInfo.email', value);
                if (field === 'mobilePhoneNumber') setPath('contactInfo.contactNo', value);
                if (field === 'academicLevel') setPath('studentProfile.academicLevel', value);
                if (field === 'program') setPath('studentProfile.program', value);
                if (field === 'section') setPath('studentProfile.section', value);
                if (field === 'gender') setPath('studentProfile.gender', value);
                if (field === 'birthDate') setPath('studentProfile.birthday', value);
                if (field === 'address') setPath('contactInfo.address.currentAddress', value);
                if (field === 'emergencyContact')
                    setPath('familyBackground.emergency.contactNo', value);
                if (field === 'healthCondition') setPath('health.illness', value);
                break;

            case 'personal':
                if (field === 'fullName') setPath('studentProfile.name', value);
                if (field === 'nickname') setPath('studentProfile.nickname', value);
                if (field === 'studentId') {
                    next.sid = value;
                    next.id = value;
                }
                if (field === 'gradeYearLevel') setPath('studentProfile.academicLevel', value);
                if (field === 'tertiaryCollegeProgram') setPath('studentProfile.program', value);
                if (field === 'section') setPath('studentProfile.section', value);
                if (field === 'birthDate') setPath('studentProfile.birthday', value);
                if (field === 'nationality') setPath('studentProfile.nationality', value);
                if (field === 'gender') setPath('studentProfile.gender', value);
                if (field === 'religion') setPath('studentProfile.religion', value);
                if (field === 'status') setPath('studentProfile.status', value);
                break;

            case 'contact':
                if (field === 'mobilePhoneNumber') setPath('contactInfo.contactNo', value);
                if (field === 'emailAddress') setPath('contactInfo.email', value);
                if (field === 'homeNumber') setPath('contactInfo.homeNo', value);
                if (field === 'presentAddress') setPath('contactInfo.address.currentAddress', value);
                if (field === 'permanentAddress') setPath('contactInfo.address.permanentAddress', value);
                if (field === 'working') setPath('contactInfo.workNo', value);
                if (field === 'emergencyContact')
                    setPath('familyBackground.emergency.contactNo', value);
                if (field === 'contactNumber') setPath('contactInfo.contactNo', value);
                break;

            case 'family':
                if (field.startsWith('father')) {
                    const key = field.replace('father', '');
                    setPath(`familyBackground.fatherInfo.${key.charAt(0).toLowerCase() + key.slice(1)}`, value);
                }
                if (field.startsWith('mother')) {
                    const key = field.replace('mother', '');
                    setPath(`familyBackground.motherInfo.${key.charAt(0).toLowerCase() + key.slice(1)}`, value);
                }
                if (field === 'statusOfParents') setPath('familyBackground.statusOfParent', value);
                if (field === 'nameOfGuardian') setPath('familyBackground.guardian.name', value);
                if (field === 'typeOfRelationWithGuardian') setPath('familyBackground.guardian.relation', value);
                if (field === 'guardianContactNumber') setPath('familyBackground.guardian.contactNo', value);
                if (field === 'guardianEmailAddress') setPath('familyBackground.guardian.email', value);
                if (field === 'parentGuardianAddress') setPath('familyBackground.address', value);
                if (field === 'siblings')
                    setPath('familyBackground.siblings', value.split(',').map((s) => s.trim()));
                if (field === 'birthOrder') setPath('familyBackground.birthOrder', value);
                break;

            case 'educational':
                if (field === 'nameOfGradeSchool') setPath('educationalBackground.elementary.schoolName', value);
                if (field === 'yearsAttendedGradeSchool') setPath('educationalBackground.elementary.dateEnrolled', value);
                if (field === 'nameOfJuniorHighSchool') setPath('educationalBackground.juniorHighSchool.schoolName', value);
                if (field === 'yearsAttendedJuniorHighSchool') setPath('educationalBackground.juniorHighSchool.dateEnrolled', value);
                if (field === 'nameOfSeniorHighSchool') setPath('educationalBackground.seniorHighSchool.schoolName', value);
                if (field === 'yearsAttendedSeniorHighSchool') setPath('educationalBackground.seniorHighSchool.dateEnrolled', value);
                if (field === 'nameOfCollege') setPath('educationalBackground.college.schoolName', value);
                if (field === 'yearsAttendedCollege') setPath('educationalBackground.college.dateEnrolled', value);
                if (field === 'extraCurricularActivities') setPath('educationalBackground.extraCurricular', value);
                if (field === 'awardsCitationsReceived') setPath('educationalBackground.awards', value);
                if (field === 'mostLikedSubject') setPath('educationalBackground.likedSubject', value);
                if (field === 'leastLikedSubject') setPath('educationalBackground.leastSubject', value);
                break;

            case 'work':
                if (field === 'nameOfCompanyInstitution') setPath('workExperience.name', value);
                if (field === 'durationFromTo') setPath('workExperience.duration', value);
                if (field === 'jobDescription') setPath('workExperience.description', value);
                if (field === 'companyContactNo') setPath('workExperience.contactNo', value);
                if (field === 'companyEmailAddress') setPath('workExperience.email', value);
                break;

            case 'interests':
                if (field === 'sports') setPath('interests.sports', value);
                if (field === 'hobbies') setPath('interests.hobbies', value);
                if (field === 'talents') setPath('interests.talents', value);
                if (field === 'socioCivic') setPath('interests.socioCivic', value);
                if (field === 'organization') setPath('interests.organization', value);
                break;

            case 'health':
                if (field === 'hospitalized') setPath('health.hospitalized', value);
                if (field === 'reason') setPath('health.reason', value);
                if (field === 'operation') setPath('health.operation', value);
                if (field === 'illness') setPath('health.illness', value);
                if (field === 'medicalCert') setPath('health.medicalCert', value);
                if (field === 'takePrescribedDrugs') setPath('health.prescribedDrug', value);
                if (field === 'hereditary') setPath('health.hereditary', value);
                if (field === 'doctorLastSeen') setPath('health.doctorLastSeen', value);
                break;

            case 'life':
                if (field === 'recentLoss') setPath('lifeCircumstances.recentLoss', value);
                if (field === 'currentConcern') setPath('lifeCircumstances.currentConcern', value);
                break;

            default:
                break;
        }
    } catch (err) {
        console.error('updateRawField error:', err);
    }

    return next;
};
