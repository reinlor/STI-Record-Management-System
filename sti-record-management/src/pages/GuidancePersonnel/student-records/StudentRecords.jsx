import React, { useState, Fragment, useEffect, useContext } from 'react';
import { AuthContext } from '../../../AuthProvider.jsx';
import axios from 'axios';

import studentIcon from '../../../assets/student.png';
import dropdown from '../../../assets/dropdown.png';
import back from '../../../assets/back.png';
import user from '../../../assets/user.png';
import next from '../../../assets/next.png';
import cases from '../../../assets/cases.png';
import archive from '../../../assets/archive.png';
import edit from '../../../assets/edit.png';
import upload from '../../../assets/upload.png';
import check from '../../../assets/check.png';
import close from '../../../assets/close.png';
import closeB from '../../../assets/closeblack.png';

import { User, Folder, Search, Plus, ArrowLeft, ChevronRight, Pencil, Archive, X, Check, ChevronLeft } from 'lucide-react';

// Define the fields for each information section and their display properties
const fieldDefinitions = {
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
        { key: 'healthCondition', label: 'Health Condition/s', type: 'textarea' },
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
        { key: 'fatherName', label: 'Father\'s Name', type: 'text' },
        { key: 'fatherAge', label: 'Father\'s Age', type: 'number' },
        { key: 'fatherBirthDate', label: 'Father\'s Birth Date', type: 'date' },
        { key: 'fatherNationality', label: 'Father\'s Nationality', type: 'text' },
        { key: 'fatherReligion', label: 'Father\'s Religion', type: 'text' },
        { key: 'fatherEducationalAttainment', label: 'Father\'s Educational Attainment', type: 'text' },
        { key: 'fatherOccupation', label: 'Father\'s Occupation', type: 'text' },
        { key: 'fatherContactNumber', label: 'Father\'s Contact Number', type: 'tel' },
        { key: 'fatherEmailAddress', label: 'Father\'s Email Address', type: 'email' },
        { key: 'motherName', label: 'Mother\'s Name', type: 'text' },
        { key: 'motherAge', label: 'Mother\'s Age', type: 'number' },
        { key: 'motherBirthDate', label: 'Mother\'s Birth Date', type: 'date' },
        { key: 'motherNationality', label: 'Mother\'s Nationality', type: 'text' },
        { key: 'motherReligion', label: 'Mother\'s Religion', type: 'text' },
        { key: 'motherEducationalAttainment', label: 'Mother\'s Educational Attainment', type: 'text' },
        { key: 'motherOccupation', label: 'Mother\'s Occupation', type: 'text' },
        { key: 'motherContactNumber', label: 'Mother\'s Contact Number', type: 'tel' },
        { key: 'motherEmailAddress', label: 'Mother\'s Email Address', type: 'email' },
        { key: 'statusOfParents', label: 'Status of Parents', type: 'text' },
        { key: 'nameOfGuardian', label: 'Name of Guardian', type: 'text' },
        { key: 'typeOfRelationWithGuardian', label: 'Relation with Guardian', type: 'text' },
        { key: 'guardianContactNumber', label: 'Guardian Contact Number', type: 'tel' },
        { key: 'guardianEmailAddress', label: 'Guardian Email Address', type: 'email' },
        { key: 'parentGuardianAddress', label: 'Parent/Guardian Address', type: 'textarea' },
        { key: 'siblings', label: 'Siblings', type: 'text' },
        { key: 'siblingsCount', label: 'Number of Siblings', type: 'number' },
        { key: 'birthOrder', label: 'Birth Order', type: 'text' },
    ],
    educational: [
        { key: 'nameOfGradeSchool', label: 'Name of Grade School', type: 'text' },
        { key: 'yearsAttendedGradeSchool', label: 'Years Attended Grade School', type: 'text' },
        { key: 'nameOfJuniorHighSchool', label: 'Name of Junior High School', type: 'text' },
        { key: 'yearsAttendedJuniorHighSchool', label: 'Years Attended Junior High School', type: 'text' },
        { key: 'nameOfSeniorHighSchool', label: 'Name of Senior High School', type: 'text' },
        { key: 'yearsAttendedSeniorHighSchool', label: 'Years Attended Senior High School', type: 'text' },
        { key: 'nameOfCollege', label: 'Name of College', type: 'text' },
        { key: 'yearsAttendedCollege', label: 'Years Attended College', type: 'text' },
        { key: 'extraCurricularActivities', label: 'Extra Curricular Activities', type: 'textarea' },
        { key: 'awardsCitationsReceived', label: 'Awards/Citations Received', type: 'textarea' },
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
    interests: [
        { key: 'sports', label: 'Sports', type: 'text' },
        { key: 'hobbies', label: 'Hobbies', type: 'text' },
        { key: 'talents', label: 'Talents', type: 'text' },
        { key: 'socioCivic', label: 'Socio Civic', type: 'text' },
        { key: 'organizationsInvolved', label: 'Organizations Involved', type: 'text' },
    ],
    health: [
        { key: 'hospitalized', label: 'Hospitalized', type: 'text' },
        { key: 'reason', label: 'Reason', type: 'textarea' },
        { key: 'operation', label: 'Operation', type: 'text' },
        { key: 'illnessCondition', label: 'Illness/Condition', type: 'textarea' },
        { key: 'medicalCertificate', label: 'Medical Certificate', type: 'text' },
        { key: 'takePrescribedDrugs', label: 'Take Prescribed Drugs', type: 'text' },
        { key: 'hereditaryIllness', label: 'Hereditary Illness', type: 'textarea' },
        { key: 'lastSawDoctor', label: 'Last Saw Doctor', type: 'date' },
    ],
    life: [
        { key: 'recentLoss', label: 'Recent Loss', type: 'text' },
        { key: 'currentConcern', label: 'Current Concern', type: 'textarea' },
    ],
};



// Generic Component for rendering information sections
const InfoSection = ({ infoType, student, isEditing, onFieldChange }) => {
    const fieldsToDisplay = fieldDefinitions[infoType] || [];
    

    const infoTypeTitles = {
        basic: "Basic Information",
        personal: "Personal Information",
        contact: "Contact Information",
        family: "Family Background",
        educational: "Educational Background",
        work: "Work Experience (Optional)",
        interests: "Interests and Recreational Activities",
        health: "Health",
        life: "Life Circumstances",
    };

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
                {infoTypeTitles[infoType]}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {fieldsToDisplay.map((fieldDef) => {
                    const value = student && student[fieldDef.key] !== undefined && student[fieldDef.key] !== null
                        ? student[fieldDef.key]
                        : 'N/A';
                    const inputId = `${infoType}-${fieldDef.key}`;

                    return (
                        <div key={fieldDef.key} className="flex flex-col">
                            <label htmlFor={inputId} className="text-sm text-gray-600 font-medium mb-1">
                                {fieldDef.label}:
                            </label>
                            {isEditing ? (
                                fieldDef.type === 'textarea' ? (
                                    <textarea
                                        id={inputId}
                                        value={value === 'N/A' ? '' : value}
                                        onChange={(e) => onFieldChange(infoType, fieldDef.key, e.target.value)}
                                        rows={fieldDef.multiline ? 3 : 1}
                                        className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : fieldDef.type === 'radio' ? (
                                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                                        {fieldDef.options.map(option => (
                                            <label key={option} className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`${infoType}-${fieldDef.key}`}
                                                    value={option}
                                                    checked={value === option}
                                                    onChange={(e) => onFieldChange(infoType, fieldDef.key, e.target.value)}
                                                    className="form-radio text-blue-600 h-4 w-4"
                                                />
                                                <span className="ml-2 text-gray-700">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <input
                                        id={inputId}
                                        type={fieldDef.type}
                                        value={value === 'N/A' ? '' : value}
                                        onChange={(e) => onFieldChange(infoType, fieldDef.key, e.target.value)}
                                        className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                )
                            ) : (
                                <span className="text-lg font-semibold text-gray-900 break-words">
                                    {value}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


// Helper: normalize raw student object -> UI-friendly grouped object
const normalizeForUI = (raw) => {
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
            fullName: profile.name || `${profile.lastName || ''}` || 'N/A',
            studentId: raw.sid ?? raw.id ?? 'N/A',
            emailAddress: contact.email ?? 'N/A',
            mobilePhoneNumber: contact.contactNo ?? 'N/A',
            academicLevel: profile.academicLevel ?? 'N/A',
            programYearSection: `${profile.program ?? ''} ${profile.section ?? ''}`.trim() || 'N/A',
            gender: profile.gender ?? 'N/A',
            birthDate: profile.birthday ?? 'N/A',
            address: (contact.address && (contact.address.currentAddress || contact.address.permanentAddress)) || 'N/A',
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
            siblings: Array.isArray(family?.siblings) ? family.siblings.join(', ') : (family?.siblings ?? 'N/A'),
            siblingsCount: Array.isArray(family?.siblings) ? family.siblings.length : 'N/A',
            birthOrder: family?.birthOrder ?? 'N/A',
        },
        educational: {
            nameOfGradeSchool: edu?.elementary?.schoolName ?? 'N/A',
            yearsAttendedGradeSchool: edu?.elementary?.dateEnrolled ?? 'N/A',
            nameOfJuniorHighSchool: edu?.juniorHighSchool?.schoolName ?? 'N/A',
            yearsAttendedJuniorHighSchool: edu?.juniorHighSchool?.dateEnrolled ?? 'N/A',
            nameOfSeniorHighSchool: edu?.seniorHighSchool?.schoolName ?? 'N/A',
            yearsAttendedSeniorHighSchool: edu?.seniorHighSchool?.dateEnrolled ?? 'N/A',
            nameOfCollege: edu?.college?.schoolName ?? 'N/A',
            yearsAttendedCollege: edu?.college?.dateEnrolled ?? 'N/A',
            extraCurricularActivities: edu?.extraCurricular ?? 'N/A',
            awardsCitationsReceived: edu?.awards ?? 'N/A',
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
            organizationsInvolved: interests?.organization ?? 'N/A',
        },
        health: {
            hospitalized: health?.hospitalized ?? 'N/A',
            reason: health?.reason ?? 'N/A',
            operation: health?.operation ?? 'N/A',
            illnessCondition: health?.illness ?? 'N/A',
            medicalCertificate: health?.medicalCert ?? 'N/A',
            takePrescribedDrugs: health?.prescribedDrug ?? 'N/A',
            hereditaryIllness: health?.hereditary ?? 'N/A',
            lastSawDoctor: health?.doctorLastSeen ?? 'N/A',
        },
        life: {
            recentLoss: life?.recentLoss ?? 'N/A',
            currentConcern: life?.currentConcern ?? 'N/A',
        },
    };
};

// Helper to update raw structure when editing UI grouped fields
const updateRawField = (raw, category, field, value) => {
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
                if (field === 'studentId') { next.sid = value; next.id = value; }
                if (field === 'emailAddress') setPath('contactInfo.email', value);
                if (field === 'mobilePhoneNumber') setPath('contactInfo.contactNo', value);
                if (field === 'academicLevel') setPath('studentProfile.academicLevel', value);
                if (field === 'programYearSection') {
                    // keep simple: write whole string to studentProfile.program
                    setPath('studentProfile.program', value);
                }
                if (field === 'gender') setPath('studentProfile.gender', value);
                if (field === 'birthDate') setPath('studentProfile.birthday', value);
                if (field === 'address') {
                    if (!next.contactInfo) next.contactInfo = {};
                    if (!next.contactInfo.address) next.contactInfo.address = {};
                    next.contactInfo.address.currentAddress = value;
                }
                if (field === 'emergencyContact') {
                    if (!next.familyBackground) next.familyBackground = {};
                    if (!next.familyBackground.emergency) next.familyBackground.emergency = {};
                    next.familyBackground.emergency.contactNo = value;
                }
                if (field === 'healthCondition') setPath('health.illness', value);
                break;
            case 'personal':
                if (field === 'nickname') setPath('studentProfile.nickname', value);
                if (field === 'gradeYearLevel') setPath('studentProfile.academicLevel', value);
                if (field === 'tertiaryCollegeProgram') setPath('studentProfile.program', value);
                if (field === 'section') setPath('studentProfile.section', value);
                if (field === 'nationality') setPath('studentProfile.nationality', value);
                if (field === 'religion') setPath('studentProfile.religion', value);
                if (field === 'status') setPath('studentProfile.status', value);
                break;
            case 'contact':
                if (field === 'mobilePhoneNumber') setPath('contactInfo.contactNo', value);
                if (field === 'emailAddress') setPath('contactInfo.email', value);
                if (field === 'homeNumber') setPath('contactInfo.homeNo', value);
                if (field === 'presentAddress') {
                    if (!next.contactInfo) next.contactInfo = {};
                    if (!next.contactInfo.address) next.contactInfo.address = {};
                    next.contactInfo.address.currentAddress = value;
                }
                if (field === 'permanentAddress') {
                    if (!next.contactInfo) next.contactInfo = {};
                    if (!next.contactInfo.address) next.contactInfo.address = {};
                    next.contactInfo.address.permanentAddress = value;
                }
                if (field === 'working') setPath('contactInfo.workNo', value);
                break;
            case 'family':
                if (field.startsWith('father')) {
                    const key = field.replace('father', '').replace(/^./, c => c.toLowerCase());
                    setPath(`familyBackground.fatherInfo.${key}`, value);
                }
                if (field.startsWith('mother')) {
                    const key = field.replace('mother', '').replace(/^./, c => c.toLowerCase());
                    setPath(`familyBackground.motherInfo.${key}`, value);
                }
                if (field === 'statusOfParents') setPath('familyBackground.statusOfParent', value);
                if (field === 'nameOfGuardian') setPath('familyBackground.guardian.name', value);
                if (field === 'guardianContactNumber') setPath('familyBackground.guardian.contactNo', value);
                if (field === 'parentGuardianAddress') setPath('familyBackground.address', value);
                if (field === 'siblings') setPath('familyBackground.siblings', Array.isArray(next.familyBackground?.siblings) ? value.split(',').map(s => s.trim()) : value);
                if (field === 'birthOrder') setPath('familyBackground.birthOrder', value);
                break;
            case 'educational':
                if (field === 'nameOfGradeSchool') setPath('educationalBackground.elementary.schoolName', value);
                if (field === 'yearsAttendedGradeSchool') setPath('educationalBackground.elementary.dateEnrolled', value);
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
                if (field === 'organizationsInvolved') setPath('interests.organization', value);
                break;
            case 'health':
                if (field === 'hospitalized') setPath('health.hospitalized', value);
                if (field === 'reason') setPath('health.reason', value);
                if (field === 'operation') setPath('health.operation', value);
                if (field === 'illnessCondition') setPath('health.illness', value);
                if (field === 'medicalCertificate') setPath('health.medicalCert', value);
                if (field === 'takePrescribedDrugs') setPath('health.prescribedDrug', value);
                if (field === 'hereditaryIllness') setPath('health.hereditary', value);
                if (field === 'lastSawDoctor') setPath('health.doctorLastSeen', value);
                break;
            case 'life':
                if (field === 'recentLoss') setPath('lifeCircumstances.recentLoss', value);
                if (field === 'currentConcern') setPath('lifeCircumstances.currentConcern', value);
                break;
            default:
                break;
        }
    } catch (e) {
        console.warn('Failed to map UI field to raw path', e);
    }

    return next;
};


function StudentRecords() {
    const { authData, logout } = useContext(AuthContext);
    console.log(authData)

    const [students, setStudents] = useState([]);
    const [activeTab, setActiveTab] = useState('Enrolled');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [selectedStudentDetails, setSelectedStudentDetails] = useState(null); // raw from server
    const [editedStudentData, setEditedStudentData] = useState(null); // raw copy for editing

    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [showArchiveConfirmModal, setShowArchiveConfirmModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [infoType, setInfoType] = useState('basic');
    const [selectedYearLevel, setSelectedYearLevel] = useState('none');
    const [selectedProgram, setSelectedProgram] = useState('none');

    /* NEW: Add Student form state */
    const [newStudentForm, setNewStudentForm] = useState({
        firstName: "", middleName: "", lastName: "", studentNumber: "",
        emailAddress: "", gradeYearLevel: "", programStrand: "", section: "",
        birthDate: "", age: "", gender: "", mobileNo: "", address: "",
        emergencyContact: "", contactNo: "", healthCondition: "",
        profileImage: null,
    });

    const handleNewStudentFormChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === "file") {
            setNewStudentForm((prev) => ({ ...prev, [name]: files[0] }));
        } else {
            setNewStudentForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    /* ---------------- API Calls ---------------- */

    useEffect(() => {
        axios.get('/student')
            .then(res => {
                // expect an array; set as-is
                if (Array.isArray(res.data)) {
                    setStudents(res.data);
                } else {
                    // If server returns object with data property
                    setStudents(res.data?.questions ?? res.data ?? []);
                }
            })
            .catch(err => {
                console.error('Error fetching student list', err);
                setStudents([]);
            });
    }, []);

    useEffect(() => {
        if (selectedStudentId) {
            axios.get(`/student/get/${selectedStudentId}`)
                .then(res => {
                    const raw = res.data;
                    setSelectedStudentDetails(raw);
                    setEditedStudentData(JSON.parse(JSON.stringify(raw)));
                    setIsEditing(false);
                })
                .catch(err => {
                    console.error('Error fetching student details', err);
                    setSelectedStudentDetails(null);
                    setEditedStudentData(null);
                });
        } else {
            setSelectedStudentDetails(null);
            setEditedStudentData(null);
            setIsEditing(false);
        }
    }, [selectedStudentId]);

    const handleAddStudent = async () => {
        try {
            const formData = new FormData();
            Object.entries(newStudentForm).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const res = await axios.post('/student/create', formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setStudents(prev => [...prev, res.data]);
            setShowAddStudentModal(false);
            alert('Student Added Successfully!');
        } catch (err) {
            console.error(err);
            alert('Error adding student.');
        }
    };

    const handleArchiveStudent = async () => {
        if (selectedStudentId) {
            try {
                await axios.patch(`/student/archive/${selectedStudentId}`);
                setStudents(prev =>
                    prev.map(student =>
                        (student.id === selectedStudentId || student.sid === selectedStudentId) ? { ...student, type: 'Archived' } : student
                    )
                );
                setSelectedStudentId(null);
                setShowArchiveConfirmModal(false);
                alert('Student Archived Successfully!');
            } catch (err) {
                console.error(err);
                alert('Error archiving student.');
            }
        }
    };

    const handleSaveEdits = async () => {
        if (editedStudentData && selectedStudentId) {
            try {
                const res = await axios.put(`/student/update/${selectedStudentId}`, editedStudentData);
                setStudents(prev =>
                    prev.map(student =>
                        (student.id === selectedStudentId || student.sid === selectedStudentId) ? res.data : student
                    )
                );
                setSelectedStudentDetails(res.data);
                setEditedStudentData(JSON.parse(JSON.stringify(res.data)));
                setIsEditing(false);
                alert('Changes saved successfully!');
            } catch (err) {
                console.error(err);
                alert('Error saving changes.');
            }
        }
    };

    const handleInfoFieldChange = (category, field, value) => {
        // update the raw editedStudentData so save PUT sends proper shape
        setEditedStudentData(prev => {
            if (!prev) return prev;
            return updateRawField(prev, category, field, value);
        });
    };

    const displayStudentRaw = isEditing && editedStudentData ? editedStudentData : selectedStudentDetails;
    const uiGroup = normalizeForUI(displayStudentRaw);
    const displayStudentData = uiGroup; // grouped by section (basic, personal, ...)

    const filteredStudents = students.filter(student => {
        const type = student.type ?? (student.studentProfile?.type) ?? 'Enrolled';
        const matchesTab = (activeTab === 'All' && (type === 'Enrolled' || type === 'Archived')) || type === activeTab;
        const nameStr = (student.studentProfile?.name ?? student.name ?? '').toString().toLowerCase();
        const idStr = (student.sid ?? student.id ?? '').toString().toLowerCase();
        const matchesSearch = searchTerm === '' ||
            nameStr.includes(searchTerm.toLowerCase()) ||
            idStr.includes(searchTerm.toLowerCase());
        const matchesYearLevel = selectedYearLevel === 'none' || (student.yearLevel ?? student.studentProfile?.academicLevel ?? 'none') === selectedYearLevel;
        const matchesProgram = selectedProgram === 'none' || (student.program ?? student.studentProfile?.program ?? 'none') === selectedProgram;

        return matchesTab && matchesSearch && matchesYearLevel && matchesProgram;
    }).sort((a, b) => {
        const yearOrder = {
            'Grade 11': 1, 'Grade 12': 2,
            '1st Year College': 3, '2nd Year College': 4,
            '3rd Year College': 5, '4th Year College': 6,
            'Graduated': 7, 'Left': 8, 'NA': 9, '': 10
        };
        const yearA = yearOrder[a.yearLevel ?? a.studentProfile?.academicLevel] || 99;
        const yearB = yearOrder[b.yearLevel ?? b.studentProfile?.academicLevel] || 99;

        if (selectedYearLevel !== 'none') {
            if (yearA !== yearB) return yearA - yearB;
        }

        if (selectedProgram !== 'none') {
            if ((a.program ?? a.studentProfile?.program) !== (b.program ?? b.studentProfile?.program)) {
                return (a.program ?? a.studentProfile?.program ?? '').localeCompare(b.program ?? b.studentProfile?.program ?? '');
            }
        }

        return 0;
    });

    const infoTypeTitles = {
        basic: "Basic Information",
        personal: "Personal Information",
        contact: "Contact Information",
        family: "Family Background",
        educational: "Educational Background",
        work: "Work Experience (Optional)",
        interests: "Interests and Activities",
        health: "Health",
        life: "Life Circumstances",
    };

    const yearLevelOptions = [
        "none", "Grade 11", "Grade 12", "1st Year College",
        "2nd Year College", "3rd Year College", "4th Year College",
    ];

    const programOptions = [
        "none", "BSIT", "BSCS", "BSBA", "BSECE", "BMMA",
    ];

    if (!authData?.user?.access?.studentRecords?.canView) {
        return <Navigate to="/error401" replace />
    }

    return (
        <div className="flex bg-gray-100 min-h-screen">

            <div className={`w-96 bg-white border-r border-gray-200 shadow-lg flex flex-col`}>

                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                        <p className="text-3xl font-bold text-gray-800">Student List</p>
                    </div>

                    <div className="flex justify-around bg-gray-200 p-1 rounded-lg mb-4">
                        <button
                            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out cursor-pointer hover:bg-[#003d54]
                                        ${activeTab === 'Archived' ? 'bg-[#0a1220] text-white shadow-sm' : 'text-gray-700 hover:bg-gray-300'}`}
                            onClick={() => setActiveTab('Archived')}
                        >
                            Archived
                        </button>
                        <button
                            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out cursor-pointer hover:bg-[#003d54]
                                        ${activeTab === 'Enrolled' ? 'bg-[#0a1220] text-white shadow-sm' : 'text-gray-700 hover:bg-gray-300'}`}
                            onClick={() => setActiveTab('Enrolled')}
                        >
                            Enrolled
                        </button>
                    </div>

                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Name/ ID"
                            className="w-full pl-2 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out hover:bg-gray-100"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>

                    <div className="flex space-x-2 mb-4">
                        <div className="relative flex-1">
                            <select
                                className="text-sm block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0a1220] focus:border-transparent transition duration-150 ease-in-out appearance-none bg-white pr-8 cursor-pointer"
                                value={selectedYearLevel}
                                onChange={(e) => setSelectedYearLevel(e.target.value)}
                            >
                                <option value="none">Year Level</option>
                                {yearLevelOptions.filter(opt => opt !== "none").map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <img src={dropdown} alt="dropdownIcon" className="w-2.5 h-2.5 object-cover mr-2" />
                            </div>
                        </div>

                        <div className="relative flex-1">
                            <select
                                className="text-sm block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0a1220] focus:border-transparent transition duration-150 ease-in-out appearance-none bg-white pr-8 cursor-pointer"
                                value={selectedProgram}
                                onChange={(e) => setSelectedProgram(e.target.value)}
                            >
                                <option value="none">Program/Course</option>
                                {programOptions.filter(opt => opt !== "none").map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <img src={dropdown} alt="dropdownIcon" className="w-2.5 h-2.5 object-cover mr-2" />
                            </div>
                        </div>
                    </div>

                    {authData?.user?.access?.studentRecords?.canEdit ? <button 
                        className="w-full bg-[#0a1220] hover:bg-[#003d54] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out shadow-md hover:shadow-lg"
                        onClick={() => setShowAddStudentModal(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Add Student
                    </button> : null}
                </div>

                <div className="flex-1 overflow-y-auto pb-4">
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => {
                            const sid = student.sid ?? student.id ?? 'N/A';
                            const name = student.studentProfile?.name ?? student.name ?? sid;
                            return (
                                <div
                                    key={sid}
                                    className={`flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer transition duration-150 ease-in-out
                                                ${selectedStudentId === sid ? 'bg-blue-100 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
                                    onClick={() => setSelectedStudentId(sid)}
                                >
                                    <div className="flex items-center">
                                        <img src={user} alt="User" className="w-5 h-5 object-cover mr-5" />
                                        <div>
                                            <p className="font-semibold text-gray-800">{name}</p>
                                            <p className="text-sm text-gray-600">{sid}</p>
                                        </div>
                                    </div>
                                    <img src={next} alt="nextIcon" className="w-3 h-3 object-cover mr-2" />
                                </div>
                            );
                        })
                    ) : (
                        <p className="p-4 text-gray-500 text-center">No students found.</p>
                    )}
                </div>
            </div>


            <div className={`flex-1 bg-white flex flex-col`}>
                <Fragment>
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <button
                                className="p-2 rounded-full hover:bg-gray-200 transition duration-150 ease-in-out cursor-pointer"
                                onClick={() => setSelectedStudentId(null)}
                            >
                                <img src={back} alt="backIcon" className="w-5 h-5 object-cover" />
                            </button>
                            <select
                                className="block px-3 sm:px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out appearance-none bg-white pr-8 text-sm sm:text-base cursor-pointer"
                                value={infoType}
                                onChange={(e) => setInfoType(e.target.value)}
                            >
                                <option value="basic">Basic Information</option>
                                <option value="personal">Personal Information</option>
                                <option value="contact">Contact Information</option>
                                <option value="family">Family Background</option>
                                <option value="educational">Educational Background</option>
                                <option value="work">Work Experience (Optional)</option>
                                <option value="interests">Interests and Activities</option>
                                <option value="health">Health</option>
                                <option value="life">Life Circumstances</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-3 mt-2 sm:mt-0">
                            {authData?.user?.access?.studentRecords?.canEdit ? <button
                                className={`px-3 sm:px-4 py-2 rounded-lg flex items-center transition duration-150 ease-in-out text-sm sm:text-base font-medium cursor-pointer
                                            ${isEditing ? 'bg-gray-500 text-white shadow-md' : 'bg-gray-800 hover:bg-gray-700 text-white shadow-md hover:shadow-lg'}`}
                                onClick={() => {
                                    if (isEditing) {
                                        handleSaveEdits();
                                    }
                                    setIsEditing(!isEditing);
                                }}
                            >
                                {isEditing ? 'Save' : 'Edit Student'}
                                <img src={edit} alt="editIcon" className="w-4 h-4 sm:w-5 sm:h-5 ml-3" />
                            </button> : null}

                            <button
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 sm:px-4 rounded-lg flex items-center transition duration-150 ease-in-out shadow-md hover:shadow-lg cursor-pointer"
                                onClick={() => setShowArchiveConfirmModal(true)}
                            >
                                Archive
                                <img src={archive} alt="archiveIcon" className="w-4 h-4 sm:w-5 sm:h-5 ml-3" />
                            </button>

                            <button className="bg-[#0a1220] hover:bg-[#003d54] text-white font-bold py-2 px-3 sm:px-4 rounded-lg flex items-center transition duration-150 ease-in-out shadow-md hover:shadow-lg cursor-pointer">
                                Case
                                <img src={cases} alt="caseIcon" className="w-4 h-4 sm:w-5 sm:h-5 ml-3" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto">
                        {selectedStudentDetails ? (
                            <InfoSection
                                infoType={infoType}
                                student={displayStudentData[infoType]}
                                isEditing={isEditing}
                                onFieldChange={handleInfoFieldChange}
                            />
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500 text-xl p-4 text-center">
                                Select a student from the list to view their information.
                            </div>
                        )}
                    </div>
                </Fragment>
            </div>

            {showAddStudentModal && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center border-b pb-3 mb-4">

                            <h3 className="text-2xl font-bold text-gray-800">Fill up Basic Information</h3>
                            <button
                                className="p-2 rounded-lg hover:bg-gray-200 cursor-pointer"
                                onClick={() => setShowAddStudentModal(false)}
                            >
                                <img src={closeB} alt="closeIcon" className="w-5 h-5 object-cover" />
                            </button>
                        </div>

                        <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div className="space-y-4">
                                {/* Left Column */}
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name:</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={newStudentForm.firstName}
                                        onChange={handleNewStudentFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">Middle Name:</label>
                                    <input
                                        type="text"
                                        id="middleName"
                                        name="middleName"
                                        value={newStudentForm.middleName}
                                        onChange={handleNewStudentFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name:</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={newStudentForm.lastName}
                                        onChange={handleNewStudentFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="studentNumber" className="block text-sm font-medium text-gray-700">Student Number:</label>
                                    <input
                                        type="text"
                                        id="studentNumber"
                                        name="studentNumber"
                                        value={newStudentForm.studentNumber}
                                        onChange={handleNewStudentFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700">Email Address:</label>
                                    <input
                                        type="email"
                                        id="emailAddress"
                                        name="emailAddress"
                                        value={newStudentForm.emailAddress}
                                        onChange={handleNewStudentFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gradeYearLevel" className="block text-sm font-medium text-gray-700">Grade/Year Level:</label>
                                    <input
                                        type="text"
                                        id="gradeYearLevel"
                                        name="gradeYearLevel"
                                        value={newStudentForm.gradeYearLevel}
                                        onChange={handleNewStudentFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="programStrand" className="block text-sm font-medium text-gray-700">Program/ Strand:</label>
                                    <input
                                        type="text"
                                        id="programStrand"
                                        name="programStrand"
                                        value={newStudentForm.programStrand}
                                        onChange={handleNewStudentFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="section" className="block text-sm font-medium text-gray-700">Section:</label>
                                    <input
                                        type="text"
                                        id="section"
                                        name="section"
                                        value={newStudentForm.section}
                                        onChange={handleNewStudentFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Birth Date:</label>
                                    <input
                                        type="date"
                                        id="birthDate"
                                        name="birthDate"
                                        value={newStudentForm.birthDate}
                                        onChange={handleNewStudentFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age:</label>
                                    <input
                                        type="number"
                                        id="age"
                                        name="age"
                                        value={newStudentForm.age}
                                        onChange={handleNewStudentFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender:</label>
                                    <div className="flex space-x-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="Male"
                                                checked={newStudentForm.gender === 'Male'}
                                                onChange={handleNewStudentFormChange}
                                                className="form-radio text-blue-600 h-4 w-4"
                                            />
                                            <span className="ml-2 text-gray-700">Male</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="Female"
                                                checked={newStudentForm.gender === 'Female'}
                                                onChange={handleNewStudentFormChange}
                                                className="form-radio text-blue-600 h-4 w-4"
                                            />
                                            <span className="ml-2 text-gray-700">Female</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="Others"
                                                checked={newStudentForm.gender === 'Others'}
                                                onChange={handleNewStudentFormChange}
                                                className="form-radio text-blue-600 h-4 w-4"
                                            />
                                            <span className="ml-2 text-gray-700">Others:</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="mobileNo" className="block text-sm font-medium text-gray-700">Mobile No.:</label>
                                    <input
                                        type="text"
                                        id="mobileNo"
                                        name="mobileNo"
                                        value={newStudentForm.mobileNo}
                                        onChange={handleNewStudentFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address:</label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={newStudentForm.address}
                                        onChange={handleNewStudentFormChange}
                                        rows="3"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-y"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Right Column */}
                                <div>
                                    <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">Emergency Contact:</label>
                                    <input
                                        type="text"
                                        id="emergencyContact"
                                        name="emergencyContact"
                                        value={newStudentForm.emergencyContact}
                                        onChange={handleNewStudentFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contactNo" className="block text-sm font-medium text-gray-700">Contact No.:</label>
                                    <input
                                        type="text"
                                        id="contactNo"
                                        name="contactNo"
                                        value={newStudentForm.contactNo}
                                        onChange={handleNewStudentFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="healthCondition" className="block text-sm font-medium text-gray-700">Health Condition:</label>
                                    <input
                                        type="text"
                                        id="healthCondition"
                                        name="healthCondition"
                                        value={newStudentForm.healthCondition}
                                        onChange={handleNewStudentFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700">Profile:</label>
                                    <div className="mt-1 flex justify-center items-center w-full h-40 border-2 border-gray-300 border-dashed rounded-md cursor-pointer relative group">
                                        {newStudentForm.profileImage ? (
                                            <img
                                                src={URL.createObjectURL(newStudentForm.profileImage)}
                                                alt="Profile Preview"
                                                className="max-h-full max-w-full object-contain rounded-md"
                                            />
                                        ) : (
                                            <img src={upload} alt="uploadIcon" className="w-10 h-10 object-cover" />
                                        )}
                                        <input
                                            id="profileImage"
                                            name="profileImage"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleNewStudentFormChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <span className="absolute bottom-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">Upload Image</span>
                                    </div>
                                </div>

                            </div>
                        </form>

                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150 ease-in-out cursor-pointer"
                                onClick={() => setShowAddStudentModal(false)}
                            >
                                Cancel
                                <X className="w-8 h-8 ml-2" />
                            </button>
                            <button
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150 ease-in-out cursor-pointer"
                                onClick={handleAddStudent}
                            >
                                Save
                                <Check className="w-8 h-8 ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showArchiveConfirmModal && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                        <h3 className="text-2xl font-bold mb-4 text-gray-800">Confirm Archive</h3>
                        <p className="text-gray-700 mb-6">Are you sure you want to archive this student?</p>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-150 ease-in-out cursor-pointer"
                                onClick={() => setShowArchiveConfirmModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150 ease-in-out cursor-pointer"
                                onClick={handleArchiveStudent}
                            >
                                Archive
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentRecords;