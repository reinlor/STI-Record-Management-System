export const fieldDefinitions = {
    basic: [
        { key: "fullName", label: "Full Name", type: "text" },
        { key: "studentId", label: "Student ID", type: "text", readOnly: true },
        { key: "emailAddress", label: "Email", type: "email", readOnly: true },
        { key: "mobilePhoneNumber", label: "Contact No", type: "text" },
        { key: "academicLevel", label: "Academic Level", type: "text", readOnly: true },
        { key: "programYearSection", label: "Program and Year/Section", type: "text", multiline: true, readOnly: true },
        { key: "program", label: "Program", type: "text", readOnly: true},
        { key: "section", label: "Section", type: "text", readOnly: true},
        { key: "gender", label: "Gender", type: "radio", options: ["Male", "Female"] },
        { key: "birthDate", label: "Birth Date", type: "date" },
        { key: "address", label: "Address", type: "textarea" },
        { key: "emergencyContact", label: "Emergency Contact", type: "text" },
        { key: "healthCondition", label: "Health Condition/s", type: "array" },
    ],
    personal: [
        { key: "fullName", label: "Full Name", type: "text" },
        { key: "nickname", label: "Nickname", type: "text" },
        { key: "studentId", label: "Student ID", type: "text", readOnly: true },
        { key: "gradeYearLevel", label: "Grade/Year Level", type: "text", readOnly: true },
        { key: "tertiaryCollegeProgram", label: "Tertiary College Program", type: "text", readOnly: true },
        { key: "section", label: "Section", type: "text", readOnly: true },
        { key: "birthDate", label: "Birth Date", type: "date" },
        { key: "nationality", label: "Nationality", type: "text" },
        { key: "gender", label: "Gender", type: "radio", options: ["Male", "Female", "Others"] },
        { key: "religion", label: "Religion", type: "text" },
        { key: "status", label: "Status", type: "text" },
    ],
    contact: [
        { key: "mobilePhoneNumber", label: "Mobile Phone Number", type: "tel" },
        { key: "emailAddress", label: "Email Address", type: "email", readOnly: true},
        { key: "homeNumber", label: "Home Number", type: "tel" },
        { key: "presentAddress", label: "Present Address", type: "textarea" },
        { key: "permanentAddress", label: "Permanent Address", type: "textarea" },
        { key: "working", label: "Working", type: "text" },
        { key: "emergencyContact", label: "Emergency Contact", type: "text" },
    ],
    family: [
        { key: "fatherName", label: "Father's Name", type: "text" },
        { key: "fatherBirthDate", label: "Father's Birth Date", type: "date" },
        { key: "fatherNationality", label: "Father's Nationality", type: "text" },
        { key: "fatherReligion", label: "Father's Religion", type: "text" },
        { key: "fatherEducationalAttainment", label: "Father's Educational Attainment", type: "text" },
        { key: "fatherOccupation", label: "Father's Occupation", type: "text" },
        { key: "fatherContactNumber", label: "Father's Contact No", type: "tel" },
        { key: "fatherEmailAddress", label: "Father's Email", type: "email" },

        { key: "motherName", label: "Mother's Name", type: "text" },
        { key: "motherBirthDate", label: "Mother's Birth Date", type: "date" },
        { key: "motherNationality", label: "Mother's Nationality", type: "text" },
        { key: "motherReligion", label: "Mother's Religion", type: "text" },
        { key: "motherEducationalAttainment", label: "Mother's Educational Attainment", type: "text" },
        { key: "motherOccupation", label: "Mother's Occupation", type: "text" },
        { key: "motherContactNumber", label: "Mother's Contact No", type: "tel" },
        { key: "motherEmailAddress", label: "Mother's Email", type: "email" },

        { key: "statusOfParents", label: "Status of Parents", type: "text" },
        { key: "nameOfGuardian", label: "Name of Guardian", type: "text" },
        { key: "typeOfRelationWithGuardian", label: "Relation with Guardian", type: "text" },
        { key: "guardianContactNumber", label: "Guardian Contact No", type: "tel" },
        { key: "guardianEmailAddress", label: "Guardian Email", type: "email" },
        { key: "parentGuardianAddress", label: "Parent/Guardian Address", type: "text" },
        { key: "siblings", label: "Siblings", type: "array" },
        { key: "birthOrder", label: "Birth Order", type: "text" },
    ],
    educational: [
        { key: "nameOfGradeSchool", label: "Elementary School", type: "text" },
        { key: "yearsAttendedGradeSchool", label: "Elementary Year Graduated", type: "text" },
        { key: "nameOfJuniorHighSchool", label: "Junior High School", type: "text" },
        { key: "yearsAttendedJuniorHighSchool", label: "Junior High Year Graduated", type: "text" },
        { key: "nameOfSeniorHighSchool", label: "Senior High School", type: "text" },
        { key: "yearsAttendedSeniorHighSchool", label: "Senior High Year Graduated", type: "text" },
        { key: "nameOfCollege", label: "College School", type: "text" },
        { key: "yearsAttendedCollege", label: "College Year Graduated", type: "text" },
        { key: "extraCurricularActivities", label: "Extra Curricular Activities", type: "array" },
        { key: "awards", label: "Awards", type: "array" },
        { key: "mostLikedSubject", label: "Most Liked Subject", type: "text" },
        { key: "leastLikedSubject", label: "Least Liked Subject", type: "text" },
    ],
    work: [
        { key: "nameOfCompanyInstitution", label: "Name of Company/Institution", type: "text" },
        { key: "durationFromTo", label: "Duration (From-To)", type: "text" },
        { key: "jobDescription", label: "Job Description", type: "textarea" },
        { key: "companyContactNo", label: "Company Contact No", type: "tel" },
        { key: "companyEmailAddress", label: "Company Email Address", type: "email" },
    ],
    interests: [
        { key: "sports", label: "Sports", type: "array" },
        { key: "hobbies", label: "Hobbies", type: "array" },
        { key: "talents", label: "Talents", type: "array" },
        { key: "socioCivic", label: "Socio Civic", type: "array" },
        { key: "organization", label: "Organizations Involved", type: "array" },
    ],
    health: [
        { key: "hospitalized", label: "Hospitalized", type: "array" },
        { key: "reason", label: "Reason", type: "array" },
        { key: "operation", label: "Operation", type: "array" },
        { key: "illness", label: "Illness/Condition", type: "array" },
        { key: "medicalCert", label: "Medical Certificate", type: "array" },
        { key: "prescribedDrug", label: "Take Prescribed Drugs", type: "array" },
        { key: "hereditary", label: "Hereditary Illness", type: "array" },
        { key: "doctorLastSeen", label: "Last Saw Doctor", type: "array" },
    ],
    life: [
        { key: "recentLoss", label: "Recent Loss", type: "text" },
        { key: "currentConcern", label: "Current Concern", type: "textarea" },
    ],
    violation: [{ key: "violations", label: "Violations", type: "custom" }],
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
            fullName: profile.name ?? "N/A",
            studentId: raw.sid ?? raw.id ?? "N/A",
            emailAddress: contact.email ?? "N/A",
            mobilePhoneNumber: contact.contactNo ?? "N/A",
            academicLevel: profile.academicLevel ?? "N/A",
            programYearSection: `${profile.program || ""} ${profile.section || ""}`.trim() || "N/A",
            program: profile.program ?? "N/A",
            section: profile.section ?? "N/A",
            gender: profile.gender ?? "N/A",
            birthDate: profile.birthday ?? "N/A",
            address: contact.address?.currentAddress ?? contact.address?.permanentAddress ?? "N/A",
            emergencyContact: family?.emergency?.contactNo ?? "N/A",
            healthCondition: Array.isArray(health?.illness) ? health.illness : (health?.illness ?? []),
        },
        personal: {
            fullName: profile.name ?? "N/A",
            nickname: profile.nickname ?? "N/A",
            studentId: raw.sid ?? raw.id ?? "N/A",
            gradeYearLevel: profile.academicLevel ?? "N/A",
            tertiaryCollegeProgram: profile.program ?? "N/A",
            section: profile.section ?? "N/A",
            birthDate: profile.birthday ?? "N/A",
            nationality: profile.nationality ?? "N/A",
            gender: profile.gender ?? "N/A",
            religion: profile.religion ?? "N/A",
            status: profile.status ?? "N/A",
        },
        contact: {
            mobilePhoneNumber: contact.contactNo ?? "N/A",
            emailAddress: contact.email ?? "N/A",
            homeNumber: contact.homeNo ?? "N/A",
            presentAddress: contact.address?.currentAddress ?? "N/A",
            permanentAddress: contact.address?.permanentAddress ?? "N/A",
            working: contact.workNo ?? "N/A",
            emergencyContact: family?.emergency?.contactNo ?? "N/A",
        },
        family: {
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

            statusOfParents: family?.statusOfParent ?? "N/A",
            nameOfGuardian: family?.guardian?.name ?? "N/A",
            typeOfRelationWithGuardian: family?.guardian?.relation ?? "N/A",
            guardianContactNumber: family?.guardian?.contactNo ?? "N/A",
            guardianEmailAddress: family?.guardian?.email ?? "N/A",
            parentGuardianAddress: family?.address ?? "N/A",

            siblings: Array.isArray(family?.siblings) ? family.siblings : (family?.siblings ?? []),
            siblingsCount: Array.isArray(family?.siblings) ? family.siblings.length : (family?.siblings ? 1 : 0),
            birthOrder: family?.birthOrder ?? "N/A",
        },
        educational: {
            nameOfGradeSchool: edu?.elementary?.schoolName ?? "N/A",
            yearsAttendedGradeSchool: edu?.elementary?.dateEnrolled ?? "N/A",
            nameOfJuniorHighSchool: edu?.juniorHighSchool?.schoolName ?? "N/A",
            yearsAttendedJuniorHighSchool: edu?.juniorHighSchool?.dateEnrolled ?? "N/A",
            nameOfSeniorHighSchool: edu?.seniorHighSchool?.schoolName ?? "N/A",
            yearsAttendedSeniorHighSchool: edu?.seniorHighSchool?.dateEnrolled ?? "N/A",
            nameOfCollege: edu?.college?.schoolName ?? "N/A",
            yearsAttendedCollege: edu?.college?.dateEnrolled ?? "N/A",
            extraCurricularActivities: Array.isArray(edu?.extraCurricular) ? edu.extraCurricular : (edu?.extraCurricular ?? "N/A"),
            awards: Array.isArray(edu?.awards) ? edu.awards : (edu?.awards ?? "N/A"),
            mostLikedSubject: edu?.likedSubject ?? "N/A",
            leastLikedSubject: edu?.leastSubject ?? "N/A",
        },
        work: {
            nameOfCompanyInstitution: work?.name ?? "N/A",
            durationFromTo: work?.duration ?? "N/A",
            jobDescription: work?.description ?? "N/A",
            companyContactNo: work?.contactNo ?? "N/A",
            companyEmailAddress: work?.email ?? "N/A",
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
                fullName: "studentProfile.name",
                studentId: ["sid", "id"],
                emailAddress: "contactInfo.email",
                mobilePhoneNumber: "contactInfo.contactNo",
                academicLevel: "studentProfile.academicLevel",
                program: "studentProfile.program",
                section: "studentProfile.section",
                gender: "studentProfile.gender",
                birthDate: "studentProfile.birthday",
                address: "contactInfo.address.currentAddress",
                emergencyContact: "familyBackground.emergency.contactNo",
                healthCondition: "health.illness",
            },
            personal: {
                fullName: "studentProfile.name",
                nickname: "studentProfile.nickname",
                studentId: ["sid", "id"],
                gradeYearLevel: "studentProfile.academicLevel",
                tertiaryCollegeProgram: "studentProfile.program",
                section: "studentProfile.section",
                birthDate: "studentProfile.birthday",
                nationality: "studentProfile.nationality",
                gender: "studentProfile.gender",
                religion: "studentProfile.religion",
                status: "studentProfile.status",
            },
            contact: {
                mobilePhoneNumber: "contactInfo.contactNo",
                emailAddress: "contactInfo.email",
                homeNumber: "contactInfo.homeNo",
                presentAddress: "contactInfo.address.currentAddress",
                permanentAddress: "contactInfo.address.permanentAddress",
                working: "contactInfo.workNo",
                emergencyContact: "familyBackground.emergency.contactNo",
            },
            family: {
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

                statusOfParents: "familyBackground.statusOfParent",
                nameOfGuardian: "familyBackground.guardian.name",
                typeOfRelationWithGuardian: "familyBackground.guardian.relation",
                guardianContactNumber: "familyBackground.guardian.contactNo",
                guardianEmailAddress: "familyBackground.guardian.email",
                parentGuardianAddress: "familyBackground.address",
                siblings: "familyBackground.siblings",
                birthOrder: "familyBackground.birthOrder",
            },
            educational: {
                nameOfGradeSchool: "educationalBackground.elementary.schoolName",
                yearsAttendedGradeSchool: "educationalBackground.elementary.dateEnrolled",
                nameOfJuniorHighSchool: "educationalBackground.juniorHighSchool.schoolName",
                yearsAttendedJuniorHighSchool: "educationalBackground.juniorHighSchool.dateEnrolled",
                nameOfSeniorHighSchool: "educationalBackground.seniorHighSchool.schoolName",
                yearsAttendedSeniorHighSchool: "educationalBackground.seniorHighSchool.dateEnrolled",
                nameOfCollege: "educationalBackground.college.schoolName",
                yearsAttendedCollege: "educationalBackground.college.dateEnrolled",
                extraCurricularActivities: "educationalBackground.extraCurricular",
                awards: "educationalBackground.awards",
                mostLikedSubject: "educationalBackground.likedSubject",
                leastLikedSubject: "educationalBackground.leastSubject",
            },
            work: {
                nameOfCompanyInstitution: "workExperience.name",
                durationFromTo: "workExperience.duration",
                jobDescription: "workExperience.description",
                companyContactNo: "workExperience.contactNo",
                companyEmailAddress: "workExperience.email",
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
