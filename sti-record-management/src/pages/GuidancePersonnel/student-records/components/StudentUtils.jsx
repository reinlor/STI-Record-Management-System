export const fieldDefinitions = {
    basic: {
        title: "Basic Information",
        columns: 3,
        subsections: [
            {
                title: "Student Information",
                fields: [
                    { key: "fullName", label: "Full Name", type: "text", readOnly: true },
                    { key: "lastName", label: "Last Name", type: "text", editOnly: true },
                    { key: "firstName", label: "First Name", type: "text", editOnly: true },
                    { key: "middleName", label: "Middle Name", type: "text", editOnly: true },
                    { key: "suffix", label: "Suffix", type: "text", editOnly: true },
                    { key: "studentId", label: "Student Number", type: "text", readOnly: true },
                    { key: "emailAddress", label: "Email", type: "email", readOnly: true },
                    { key: "contactNumber", label: "Contact Number", type: "text" },
                    { key: "academicLevel", label: "Academic Level", type: "text", readOnly: true },
                    { key: "programYearSection", label: "Program and Year/Section", type: "text", readOnly: true },
                    { key: "gender", label: "Gender", type: "radio", options: ["Male", "Female"] },
                    { key: "birthDate", label: "Birth Date", type: "date" },
                    { key: "address", label: "Address", type: "textarea" },
                ],
            },
            {
                title: "Guardian Information",
                fields: [
                    { key: "guardianName", label: "Name", type: "text" },
                    { key: "guardianRelation", label: "Relation", type: "text" },
                    { key: "guardianContactNumber", label: "Contact Number", type: "tel" },
                    { key: "guardianEmailAddress", label: "Email Address", type: "email" },
                ],
            },
            {
                title: "Emergency Contact",
                fields: [
                    { key: "emergencyContactName", label: "Name", type: "text" },
                    { key: "emergencyContactNumber", label: "Contact Number", type: "tel" },
                ],
            },
            {
                title: "Health Conditions",
                fields: [
                    { key: "healthCondition", label: "Health Condition/s", type: "array" },
                ],
            },
        ],
    },
    personal: {
        title: "Personal Information",
        columns: 3,
        fields: [
            { key: "fullName", label: "Full Name", type: "text", readOnly: true },
            { key: "lastName", label: "Last Name", type: "text", editOnly: true },
            { key: "firstName", label: "First Name", type: "text", editOnly: true },
            { key: "middleName", label: "Middle Name", type: "text", editOnly: true },
            { key: "suffix", label: "Suffix", type: "text", editOnly: true },
            { key: "nickname", label: "Nickname", type: "text" },
            { key: "studentId", label: "Student Number", type: "text", readOnly: true },
            { key: "academicLevel", label: "Academic Level", type: "text", readOnly: true },
            { key: "programYearSection", label: "Program and Year/Section", type: "text", readOnly: true },
            { key: "gender", label: "Gender", type: "radio", options: ["Male", "Female", "Others"] },
            { key: "birthDate", label: "Date of Birth", type: "date" },
            { key: "nationality", label: "Nationality", type: "text" },
            { key: "religion", label: "Religion", type: "text" },
            { key: "status", label: "Status", type: "text" },
        ],
    },
    contact: {
        title: "Contact Information",
        columns: 3,
        fields: [
            { key: "mobilePhoneNumber", label: "Mobile Number", type: "tel" },
            { key: "emailAddress", label: "Email", type: "email", readOnly: true },
            { key: "homeNumber", label: "Home Number", type: "tel" },
            { key: "presentAddress", label: "Current Address", type: "textarea" },
            { key: "permanentAddress", label: "Permanent Address", type: "textarea" },
            { key: "provincialAddress", label: "Provincial Address", type: "textarea" },
            { key: "workNumber", label: "Work Number", type: "text" },
            { key: "emergencyContactName", label: "Emergency Contact Name", type: "text" },
            { key: "emergencyContactNumber", label: "Emergency Contact Number", type: "tel" },
        ],
    },
    family: {
        title: "Family Background",
        columns: 3,
        fields: [
            { key: "parentsStatus", label: "Parents' Status", type: "text" },
            { key: "parentGuardianAddress", label: "Parents'/Guardian's Address", type: "text" },
            { key: "birthOrder", label: "Birth Order", type: "text" },
            { key: "siblings", label: "Siblings", type: "array" },
        ],
        subsections: [
            {
                title: "Father's Information",
                fields: [
                    { key: "fatherName", label: "Name", type: "text" },
                    { key: "fatherBirthDate", label: "Date of Birth", type: "date" },
                    { key: "fatherNationality", label: "Nationality", type: "text" },
                    { key: "fatherReligion", label: "Religion", type: "text" },
                    { key: "fatherEducationalAttainment", label: "Educational Attainment", type: "text" },
                    { key: "fatherOccupation", label: "Occupation", type: "text" },
                    { key: "fatherContactNumber", label: "Contact Number", type: "tel" },
                    { key: "fatherEmailAddress", label: "Email Address", type: "email" },
                ],
            },
            {
                title: "Mother's Information",
                fields: [
                    { key: "motherName", label: "Name", type: "text" },
                    { key: "motherBirthDate", label: "Date of Birth", type: "date" },
                    { key: "motherNationality", label: "Nationality", type: "text" },
                    { key: "motherReligion", label: "Religion", type: "text" },
                    { key: "motherEducationalAttainment", label: "Educational Attainment", type: "text" },
                    { key: "motherOccupation", label: "Occupation", type: "text" },
                    { key: "motherContactNumber", label: "Contact Number", type: "tel" },
                    { key: "motherEmailAddress", label: "Email Address", type: "email" },
                ],
            },
            {
                title: "Guardian's Information",
                fields: [
                    { key: "guardianName", label: "Name", type: "text" },
                    { key: "guardianRelation", label: "Relation", type: "text" },
                    { key: "guardianContactNumber", label: "Contact Number", type: "tel" },
                    { key: "guardianEmailAddress", label: "Email Address", type: "email" },
                ],
            },
        ],
    },
    educational: {
        title: "Educational Background",
        columns: 3,
        fields: [
            { key: "favoriteSubject", label: "Favorite Subject", type: "text" },
            { key: "leastFavoriteSubject", label: "Least Favorite Subject", type: "text" },
            { key: "extraCurricularActivities", label: "Extra Curricular Activities", type: "array" },
            { key: "awards", label: "Awards", type: "array" },
        ],
        subsections: [
            {
                title: "Elementary",
                fields: [
                    { key: "elementarySchoolName", label: "School Name", type: "text" },
                    { key: "elementaryYearEnrolled", label: "Year Enrolled", type: "text" },
                ],
            },
            {
                title: "Junior High School",
                fields: [
                    { key: "juniorHighSchoolName", label: "School Name", type: "text" },
                    { key: "juniorHighYearEnrolled", label: "Year Enrolled", type: "text" },
                ],
            },
            {
                title: "Senior High School",
                fields: [
                    { key: "seniorHighSchoolName", label: "School Name", type: "text" },
                    { key: "seniorHighYearEnrolled", label: "Year Enrolled", type: "text" },
                ],
            },
            {
                title: "College (for Transferees)",
                fields: [
                    { key: "collegeSchoolName", label: "School Name", type: "text" },
                    { key: "collegeYearEnrolled", label: "Year Enrolled", type: "text" },
                ],
            },
        ],
    },
    work: {
        title: "Work Experience",
        columns: 3,
        fields: [
            { key: "companyInstitution", label: "Company/Institution", type: "text" },
            { key: "duration", label: "Duration", type: "text" },
            { key: "jobDescription", label: "Job Description", type: "textarea" },
            { key: "companyContactNumber", label: "Company Contact Number", type: "tel" },
            { key: "companyEmail", label: "Company Email", type: "email" },
        ],
    },
    interests: {
        title: "Interests and Hobbies",
        columns: 3,
        fields: [
            { key: "sports", label: "Sports", type: "array" },
            { key: "hobbies", label: "Hobbies", type: "array" },
            { key: "talents", label: "Talents", type: "array" },
            { key: "socioCivic", label: "Socio-civic Involvement", type: "array" },
            { key: "organization", label: "Organizations (Affiliations)", type: "array" },
        ],
    },
    health: {
        title: "Health",
        columns: 3,
        fields: [
            { key: "hospitalized", label: "Hospitalization Records", type: "array" },
            { key: "operation", label: "Operation Records", type: "array" },
            { key: "illness", label: "Current Illnesses, Allergies, or Conditions", type: "array" },
            { key: "prescribedDrug", label: "Regular Prescribed Drugs", type: "array" },
            { key: "hereditary", label: "Hereditary Illness in Family", type: "array" },
            { key: "doctorLastSeen", label: "Last Doctor's Visit Details", type: "array" },
            { key: "medicalCert", label: "Medical Certificates", type: "array" },
        ],
    },
    life: {
        title: "Current Circumstances",
        columns: 3,
        fields: [
            { key: "recentLoss", label: "Recent Loss or Major Life Change", type: "text" },
            { key: "currentConcern", label: "Current Concern or Challenge", type: "textarea" },
        ],
    },
    violation: {
        title: "Violations",
        columns: 3,
        fields: [
            { key: "violations", label: "Violations", type: "custom" },
        ],
    },
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

    const fullName = [
        profile.lastName,
        profile.firstName ? `, ${profile.firstName}` : "",
        profile.middleName ? ` ${profile.middleName}` : "",
        profile.suffix ? ` ${profile.suffix}` : "",
    ]
        .filter(Boolean)
        .join("");

    return {
        basic: {
            fullName: fullName || "N/A",
            firstName: profile.firstName ?? "",
            lastName: profile.lastName ?? "",
            middleName: profile.middleName ?? "",
            suffix: profile.suffix ?? "",
            studentId: raw.sid ?? raw.id ?? "N/A",
            emailAddress: contact.email ?? "N/A",
            contactNumber: contact.contactNo ?? "N/A", // Changed from mobilePhoneNumber
            academicLevel: profile.academicLevel ?? "N/A",
            programYearSection: `${profile.program || ""} ${profile.section || ""}`.trim() || "N/A",
            program: profile.program ?? "N/A",
            section: profile.section ?? "N/A",
            gender: profile.gender ?? "N/A",
            birthDate: profile.birthday ?? "N/A",
            address: contact.address?.currentAddress ?? contact.address?.permanentAddress ?? "N/A",
            emergencyContact: family?.emergency?.contactNo ?? "N/A",
            healthCondition: Array.isArray(health?.illness) ? health.illness : (health?.illness ?? []),
            guardianName: family?.guardian?.name ?? "N/A",
            guardianRelation: family?.guardian?.relation ?? "N/A",
            guardianContactNumber: family?.guardian?.contactNo ?? "N/A",
            guardianEmailAddress: family?.guardian?.email ?? "N/A",
            emergencyContactName: family?.emergency?.name ?? "N/A",
        },
        personal: {
            fullName: fullName || "N/A",
            firstName: profile.firstName ?? "",
            lastName: profile.lastName ?? "",
            middleName: profile.middleName ?? "",
            suffix: profile.suffix ?? "",
            nickname: profile.nickname ?? "N/A",
            studentId: raw.sid ?? raw.id ?? "N/A",
            academicLevel: profile.academicLevel ?? "N/A",
            programYearSection: `${profile.program || ""} ${profile.section || ""}`.trim() || "N/A",
            gender: profile.gender ?? "N/A",
            birthDate: profile.birthday ?? "N/A",
            nationality: profile.nationality ?? "N/A",
            religion: profile.religion ?? "N/A",
            status: profile.status ?? "N/A",
        },
        contact: {
            mobilePhoneNumber: contact.contactNo ?? "N/A",
            emailAddress: contact.email ?? "N/A",
            homeNumber: contact.homeNo ?? "N/A",
            presentAddress: contact.address?.currentAddress ?? "N/A",
            permanentAddress: contact.address?.permanentAddress ?? "N/A",
            provincialAddress: contact.address?.provincialAddress ?? "N/A",
            workNumber: contact.workNo ?? "N/A",
            emergencyContactName: family?.emergency?.name ?? "N/A",
            emergencyContactNumber: family?.emergency?.contactNo ?? "N/A",
        },
        family: {
            parentsStatus: family?.statusOfParent ?? "N/A",
            parentGuardianAddress: family?.address ?? "N/A",
            birthOrder: family?.birthOrder ?? "N/A",
            siblings: Array.isArray(family?.siblings) ? family.siblings : (family?.siblings ?? []),
            
            fatherName: family?.fatherInfo?.name ?? "N/A",
            fatherBirthDate: family?.fatherInfo?.birthday ?? "N/A",
            fatherNationality: family?.fatherInfo?.nationality ?? "N/A",
            fatherReligion: family?.fatherInfo?.religion ?? "N/A",
            fatherEducationalAttainment: family?.fatherInfo?.educationalAttainment ?? "N/A",
            fatherOccupation: family?.fatherInfo?.occupation ?? "N/A",
            fatherContactNumber: family?.fatherInfo?.contactNo ?? "N/A",
            fatherEmailAddress: family?.fatherInfo?.email ?? "N/A",

            motherName: family?.motherInfo?.name ?? "N/A",
            motherBirthDate: family?.motherInfo?.birthday ?? "N/A",
            motherNationality: family?.motherInfo?.nationality ?? "N/A",
            motherReligion: family?.motherInfo?.religion ?? "N/A",
            motherEducationalAttainment: family?.motherInfo?.educationalAttainment ?? "N/A",
            motherOccupation: family?.motherInfo?.occupation ?? "N/A",
            motherContactNumber: family?.motherInfo?.contactNo ?? "N/A",
            motherEmailAddress: family?.motherInfo?.email ?? "N/A",

            guardianName: family?.guardian?.name ?? "N/A",
            guardianRelation: family?.guardian?.relation ?? "N/A",
            guardianContactNumber: family?.guardian?.contactNo ?? "N/A",
            guardianEmailAddress: family?.guardian?.email ?? "N/A",
        },
        educational: {
            favoriteSubject: edu?.likedSubject ?? "N/A",
            leastFavoriteSubject: edu?.leastSubject ?? "N/A",
            extraCurricularActivities: Array.isArray(edu?.extraCurricular) ? edu.extraCurricular : (edu?.extraCurricular ?? []),
            awards: Array.isArray(edu?.awards) ? edu.awards : (edu?.awards ?? []),
            
            elementarySchoolName: edu?.elementary?.schoolName ?? "N/A",
            elementaryYearEnrolled: edu?.elementary?.dateEnrolled ?? "N/A",
            
            juniorHighSchoolName: edu?.juniorHighSchool?.schoolName ?? "N/A",
            juniorHighYearEnrolled: edu?.juniorHighSchool?.dateEnrolled ?? "N/A",
            
            seniorHighSchoolName: edu?.seniorHighSchool?.schoolName ?? "N/A",
            seniorHighYearEnrolled: edu?.seniorHighSchool?.dateEnrolled ?? "N/A",
            
            collegeSchoolName: edu?.college?.schoolName ?? "N/A",
            collegeYearEnrolled: edu?.college?.dateEnrolled ?? "N/A",
        },
        work: {
            companyInstitution: work?.name ?? "N/A",
            duration: work?.duration ?? "N/A",
            jobDescription: work?.description ?? "N/A",
            companyContactNumber: work?.contactNo ?? "N/A",
            companyEmail: work?.email ?? "N/A",
        },
        interests: {
            sports: Array.isArray(interests?.sports) ? interests.sports : (interests?.sports ?? []),
            hobbies: Array.isArray(interests?.hobbies) ? interests.hobbies : (interests?.hobbies ?? []),
            talents: Array.isArray(interests?.talents) ? interests.talents : (interests?.talents ?? []),
            socioCivic: Array.isArray(interests?.socioCivic) ? interests.socioCivic : (interests?.socioCivic ?? []),
            organization: Array.isArray(interests?.organization) ? interests.organization : (interests?.organization ?? []),
        },
        health: {
            hospitalized: Array.isArray(health?.hospitalized) ? health.hospitalized : (health?.hospitalized ?? []),
            reason: Array.isArray(health?.reason) ? health.reason : (health?.reason ?? []),
            operation: Array.isArray(health?.operation) ? health.operation : (health?.operation ?? []),
            illness: Array.isArray(health?.illness) ? health.illness : (health?.illness ?? []),
            medicalCert: Array.isArray(health?.medicalCert) ? health.medicalCert : (health?.medicalCert ?? []),
            prescribedDrug: Array.isArray(health?.prescribedDrug) ? health.prescribedDrug : (health?.prescribedDrug ?? []),
            hereditary: Array.isArray(health?.hereditary) ? health.hereditary : (health?.hereditary ?? []),
            doctorLastSeen: Array.isArray(health?.doctorLastSeen) ? health.doctorLastSeen : (health?.doctorLastSeen ?? []),
        },
        life: {
            recentLoss: life?.recentLoss ?? "N/A",
            currentConcern: life?.currentConcern ?? "N/A",
        },
        violations: raw?.violations ?? {},
    };
};

export const updateRawField = (raw, category, field, value) => {
    if (!raw) return raw;
    const next = JSON.parse(JSON.stringify(raw));

    const setPath = (objPath, v) => {
        const parts = objPath.split(".");
        let cur = next;
        for (let i = 0; i < parts.length - 1; i++) {
            const p = parts[i];
            if (cur[p] === undefined || cur[p] === null) cur[p] = {};
            cur = cur[p];
        }
        cur[parts[parts.length - 1]] = v;
    };

    try {
        const mapping = {
            basic: {
                firstName: "studentProfile.firstName",
                lastName: "studentProfile.lastName",
                middleName: "studentProfile.middleName",
                suffix: "studentProfile.suffix",
                studentId: ["sid", "id"],
                emailAddress: "contactInfo.email",
                contactNumber: "contactInfo.contactNo", // Changed from mobilePhoneNumber
                academicLevel: "studentProfile.academicLevel",
                program: "studentProfile.program",
                section: "studentProfile.section",
                gender: "studentProfile.gender",
                birthDate: "studentProfile.birthday",
                address: "contactInfo.address.currentAddress",
                emergencyContact: "familyBackground.emergency.contactNo",
                healthCondition: "health.illness",
                guardianName: "familyBackground.guardian.name",
                guardianRelation: "familyBackground.guardian.relation",
                guardianContactNumber: "familyBackground.guardian.contactNo",
                guardianEmailAddress: "familyBackground.guardian.email",
                emergencyContactName: "familyBackground.emergency.name",
            },
            personal: {
                firstName: "studentProfile.firstName",
                lastName: "studentProfile.lastName",
                middleName: "studentProfile.middleName",
                suffix: "studentProfile.suffix",
                nickname: "studentProfile.nickname",
                studentId: ["sid", "id"],
                academicLevel: "studentProfile.academicLevel",
                programYearSection: "studentProfile.program",
                gender: "studentProfile.gender",
                birthDate: "studentProfile.birthday",
                nationality: "studentProfile.nationality",
                religion: "studentProfile.religion",
                status: "studentProfile.status",
            },
            contact: {
                mobilePhoneNumber: "contactInfo.contactNo",
                emailAddress: "contactInfo.email",
                homeNumber: "contactInfo.homeNo",
                presentAddress: "contactInfo.address.currentAddress",
                permanentAddress: "contactInfo.address.permanentAddress",
                provincialAddress: "contactInfo.address.provincialAddress",
                workNumber: "contactInfo.workNo",
                emergencyContactName: "familyBackground.emergency.name",
                emergencyContactNumber: "familyBackground.emergency.contactNo",
            },
            family: {
                parentsStatus: "familyBackground.statusOfParent",
                parentGuardianAddress: "familyBackground.address",
                birthOrder: "familyBackground.birthOrder",
                siblings: "familyBackground.siblings",

                fatherName: "familyBackground.fatherInfo.name",
                fatherBirthDate: "familyBackground.fatherInfo.birthday",
                fatherNationality: "familyBackground.fatherInfo.nationality",
                fatherReligion: "familyBackground.fatherInfo.religion",
                fatherEducationalAttainment: "familyBackground.fatherInfo.educationalAttainment",
                fatherOccupation: "familyBackground.fatherInfo.occupation",
                fatherContactNumber: "familyBackground.fatherInfo.contactNo",
                fatherEmailAddress: "familyBackground.fatherInfo.email",

                motherName: "familyBackground.motherInfo.name",
                motherBirthDate: "familyBackground.motherInfo.birthday",
                motherNationality: "familyBackground.motherInfo.nationality",
                motherReligion: "familyBackground.motherInfo.religion",
                motherEducationalAttainment: "familyBackground.motherInfo.educationalAttainment",
                motherOccupation: "familyBackground.motherInfo.occupation",
                motherContactNumber: "familyBackground.motherInfo.contactNo",
                motherEmailAddress: "familyBackground.motherInfo.email",

                guardianName: "familyBackground.guardian.name",
                guardianRelation: "familyBackground.guardian.relation",
                guardianContactNumber: "familyBackground.guardian.contactNo",
                guardianEmailAddress: "familyBackground.guardian.email",
            },
            educational: {
                favoriteSubject: "educationalBackground.likedSubject",
                leastFavoriteSubject: "educationalBackground.leastSubject",
                extraCurricularActivities: "educationalBackground.extraCurricular",
                awards: "educationalBackground.awards",

                elementarySchoolName: "educationalBackground.elementary.schoolName",
                elementaryYearEnrolled: "educationalBackground.elementary.dateEnrolled",

                juniorHighSchoolName: "educationalBackground.juniorHighSchool.schoolName",
                juniorHighYearEnrolled: "educationalBackground.juniorHighSchool.dateEnrolled",

                seniorHighSchoolName: "educationalBackground.seniorHighSchool.schoolName",
                seniorHighYearEnrolled: "educationalBackground.seniorHighSchool.dateEnrolled",

                collegeSchoolName: "educationalBackground.college.schoolName",
                collegeYearEnrolled: "educationalBackground.college.dateEnrolled",
            },
            work: {
                companyInstitution: "workExperience.name",
                duration: "workExperience.duration",
                jobDescription: "workExperience.description",
                companyContactNumber: "workExperience.contactNo",
                companyEmail: "workExperience.email",
            },
            interests: {
                sports: "interests.sports",
                hobbies: "interests.hobbies",
                talents: "interests.talents",
                socioCivic: "interests.socioCivic",
                organization: "interests.organization",
            },
            health: {
                hospitalized: "health.hospitalized",
                reason: "health.reason",
                operation: "health.operation",
                illness: "health.illness",
                medicalCert: "health.medicalCert",
                prescribedDrug: "health.prescribedDrug",
                hereditary: "health.hereditary",
                doctorLastSeen: "health.doctorLastSeen",
            },
            life: {
                recentLoss: "lifeCircumstances.recentLoss",
                currentConcern: "lifeCircumstances.currentConcern",
            },
        };

        const catMap = mapping[category];
        if (!catMap) return next;

        const mapped = catMap[field];
        if (!mapped) {
            if (!next[category]) next[category] = {};
            next[category][field] = value;
            return next;
        }

        if (Array.isArray(mapped)) {
            mapped.forEach((p) => setPath(p, value));
            return next;
        }

        const arrayTargets = [
            "health.hospitalized",
            "health.reason",
            "health.operation",
            "health.illness",
            "health.medicalCert",
            "health.prescribedDrug",
            "health.hereditary",
            "health.doctorLastSeen",
            "interests.sports",
            "interests.hobbies",
            "interests.talents",
            "interests.socioCivic",
            "interests.organization",
            "familyBackground.siblings",
            "educationalBackground.extraCurricular",
            "educationalBackground.awards",
        ];

        let finalValue = value;
        if (arrayTargets.includes(mapped)) {
            if (Array.isArray(value)) {
                finalValue = value;
            } else if (typeof value === "string") {
                finalValue = value
                    .split(/\r?\n|,/)
                    .map((s) => s.trim())
                    .filter(Boolean);
            } else if (value === null || value === undefined) {
                finalValue = [];
            } else {
                finalValue = [String(value)];
            }
        }

        setPath(mapped, finalValue);
    } catch (err) {
        console.error("updateRawField error:", err);
    }

    return next;
};
