import React, { useState, Fragment, useEffect } from 'react';
import studentIcon from '../../../assets/student.png';
import dropdown from '../../../assets/dropdown.png'
import back from '../../../assets/back.png'
import user from '../../../assets/user.png'
import next from '../../../assets/next.png'
import cases from '../../../assets/cases.png'
import archive from '../../../assets/archive.png'
import edit from '../../../assets/edit.png'
import upload from '../../../assets/upload.png'
import check from '../../../assets/check.png'
import close from '../../../assets/close.png'
import closeB from '../../../assets/closeblack.png'

import { User, Folder, Search, Plus, ArrowLeft, ChevronRight, Pencil, Archive, X, Check, ChevronLeft } from 'lucide-react';

// Mock data for student list to populate the left panel
const initialStudents = [
    { id: '02000293896', name: 'de Pedro, Dionne Jeus D.', type: 'Enrolled', yearLevel: '4th Year College', program: 'BSIT' },
    { id: '02000293897', name: 'Garcia, Maria A.', type: 'Enrolled', yearLevel: '3rd Year College', program: 'BSCS' },
    { id: '02000293898', name: 'Cruz, Juan B.', type: 'Enrolled', yearLevel: '2nd Year College', program: 'BSBA' },
    { id: '02000293899', name: 'Reyes, Anna C.', type: 'Enrolled', yearLevel: '1st Year College', program: 'BSECE' },
    { id: '02000293900', name: 'Santos, Mark D.', type: 'Archived', yearLevel: 'Graduated', program: 'BSIT' },
    { id: '02000293901', name: 'Lim, Sarah E.', type: 'Enrolled', yearLevel: 'Grade 12', program: 'BSIT' },
    { id: '02000293902', name: 'Tan, Kevin F.', type: 'Enrolled', yearLevel: 'Grade 11', program: 'BSCS' },
    { id: '02000293903', name: 'Gomez, Liza G.', type: 'Enrolled', yearLevel: '2nd Year College', program: 'BSBA' },
    { id: '02000293904', name: 'Santiago, Paolo H.', type: 'Archived', yearLevel: 'Left', program: 'BSECE' },
    { id: '02000293905', name: 'Diaz, Nicole I.', type: 'Enrolled', yearLevel: '1st Year College', program: 'BSIT' },
    { id: '02000293906', name: 'Gonzales, Patricia J.', type: 'Enrolled', yearLevel: '4th Year College', program: 'BSCS' },
    { id: '02000293907', name: 'Rodriguez, Oscar K.', type: 'Enrolled', yearLevel: '3rd Year College', program: 'BSIT' },
    { id: '02000293908', name: 'Flores, Christine L.', type: 'Archived', yearLevel: 'Graduated', program: 'BSBA' },
    { id: '02000293909', name: 'Martinez, Daniel M.', type: 'Enrolled', yearLevel: '2nd Year College', program: 'BSECE' },
    { id: '02000293910', name: 'Hernandez, Sophia N.', type: 'Enrolled', yearLevel: '1st Year College', program: 'BSCS' },
];

// Mock data for student details (will be dynamically loaded based on selected student)
// IMPORTANT: This object is modified directly to simulate a database. In a real app,
// you would typically fetch/update this from a backend.
const mockStudentDetails = {
    '02000293896': {
        basic: {
            fullName: 'de Pedro, Dionne Jeus D.', // Added for consistent display
            studentId: '02000293896',
            emailAddress: 'depedrodionne@dasmarinas.sti.edu.ph',
            mobilePhoneNumber: '09937103347', // Mapped to Contact No
            academicLevel: 'College', // Derived from gradeYearLevel
            programYearSection: 'BSIT, 4.1A', // Combined from program and section
            gender: 'Male',
            birthDate: '2003-12-16',
            address: 'B4 L37 Garden Grove, Salitran 4, Dasmarinas City, Cavite',
            emergencyContact: 'Geriline D. de Pedro',
            healthCondition: 'None', // Changed from NA for better display
        },
        personal: {
            fullName: 'de Pedro, Dionne Jeus D.',
            nickname: 'Dionne',
            studentId: '02000293896',
            gradeYearLevel: '4th Year College',
            tertiaryCollegeProgram: 'Bachelor of Science in Information Technology',
            section: 'A',
            birthDate: '2003-12-16',
            nationality: 'Filipino',
            gender: 'Male',
            religion: 'Roman Catholic',
            status: 'Single',
        },
        contact: {
            mobilePhoneNumber: '09937103347',
            emailAddress: 'depedrodionne@gmail.com',
            homeNumber: '(02) 8888 8171',
            presentAddress: 'B4 L37 Garden Grove, Salitran 4, Dasmarinas City, Cavite',
            permanentAddress: 'B4 L37 Garden Grove, Salitran 4, Dasmarinas City, Cavite',
            working: 'No',
            emergencyContact: 'Geriline D. de Pedro',
            contactNumber: '09176767808',
        },
        family: {
            fatherName: 'Sandro V. de Pedro',
            fatherAge: 53,
            fatherBirthDate: '1972-05-08',
            fatherNationality: 'Filipino',
            fatherReligion: 'Roman Catholic',
            fatherEducationalAttainment: 'College Undergraduate',
            fatherOccupation: 'Executive Pastry Chef',
            fatherContactNumber: '0999215570',
            fatherEmailAddress: 'sandrodepedro@gmail.com',
            motherName: 'Geriline D. de Pedro',
            motherAge: 54,
            motherBirthDate: '1971-08-31',
            motherNationality: 'Filipino',
            motherReligion: 'Roman Catholic',
            motherEducationalAttainment: 'Master\'s Degree',
            motherOccupation: 'Teacher',
            motherContactNumber: '09176767808',
            motherEmailAddress: 'geridelapaz@gmail.com',
            statusOfParents: 'Married',
            nameOfGuardian: 'Dionnyell Julia D. Aquino',
            typeOfRelationWithGuardian: 'Sibling',
            guardianContactNumber: '09179288368',
            guardianEmailAddress: 'dionnyelljulia@gmail.com',
            parentGuardianAddress: 'Dasmarinas City Cavite',
            siblings: 'Yes',
            siblingsCount: 2,
            birthOrder: 'Youngest',
        },
        educational: {
            nameOfGradeSchool: 'Beaulah Land Integrated System School',
            yearsAttendedGradeSchool: '2010 - 2016',
            nameOfJuniorHighSchool: 'General Licerio Topacio National Highschool',
            yearsAttendedJuniorHighSchool: '2016 - 2019',
            nameOfSeniorHighSchool: 'Emilio Aguinaldo College - Cavite',
            yearsAttendedSeniorHighSchool: '2019 - 2021',
            nameOfCollege: 'NA',
            yearsAttendedCollege: 'NA',
            extraCurricularActivities: 'NA',
            awardsCitationsReceived: 'NA',
            mostLikedSubject: 'Math',
            leastLikedSubject: 'English',
        },
        work: {
            nameOfCompanyInstitution: 'NA',
            durationFromTo: 'NA',
            jobDescription: 'NA',
            companyContactNo: 'NA',
            companyEmailAddress: 'NA',
        },
        interests: {
            sports: 'NA',
            hobbies: 'NA',
            talents: 'NA',
            socioCivic: 'NA',
            organizationsInvolved: 'NA',
        },
        health: {
            hospitalized: 'Yes',
            reason: 'Pneumonia',
            operation: 'Yes',
            illnessCondition: 'No',
            medicalCertificate: 'NA',
            takePrescribedDrugs: 'No',
            hereditaryIllness: 'NA',
            lastSawDoctor: 'NA',
        },
        life: {
            recentLoss: 'Aunt',
            currentConcern: 'Academic Performance, Career',
        },
    },
    '02000293897': {
        basic: {
            fullName: 'Garcia, Maria A.',
            studentId: '02000293897',
            emailAddress: 'mariagarcia@dasmarinas.sti.edu.ph',
            mobilePhoneNumber: '09171234567',
            academicLevel: 'College',
            programYearSection: 'BSCS, 3.1B',
            gender: 'Female',
            birthDate: '2004-01-10',
            address: '123 Main St, Dasmarinas City, Cavite',
            emergencyContact: 'Juan Garcia',
            healthCondition: 'None',
        },
        personal: { fullName: 'Garcia, Maria A.', nickname: 'Maria', studentId: '02000293897', gradeYearLevel: '3rd Year College', tertiaryCollegeProgram: 'Bachelor of Science in Computer Science', section: 'B', birthDate: '2004-01-10', nationality: 'Filipino', gender: 'Female', religion: 'Roman Catholic', status: 'Single' },
        contact: { mobilePhoneNumber: '09171234567', emailAddress: 'mariagarcia@gmail.com', homeNumber: '(02) 1234 5678', presentAddress: '123 Main St, Dasmarinas City, Cavite', permanentAddress: '123 Main St, Dasmarinas City, Cavite', working: 'No', emergencyContact: 'Juan Garcia', contactNumber: '09171234568' },
        family: {}, educational: {}, work: {}, interests: {}, health: {}, life: {},
    },
    '02000293898': {
        basic: {
            fullName: 'Cruz, Juan B.',
            studentId: '02000293898',
            emailAddress: 'juan.cruz@dasmarinas.sti.edu.ph',
            mobilePhoneNumber: '09209876543',
            academicLevel: 'College',
            programYearSection: 'BSBA, 2.1C',
            gender: 'Male',
            birthDate: '2005-02-20',
            address: '456 Elm St, Cavite City, Cavite',
            emergencyContact: 'Maria Cruz',
            healthCondition: 'Asthma',
        },
        personal: { fullName: 'Cruz, Juan B.', nickname: 'Juan', studentId: '02000293898', gradeYearLevel: '2nd Year College', tertiaryCollegeProgram: 'Bachelor of Science in Business Administration', section: 'C', birthDate: '2005-02-20', nationality: 'Filipino', gender: 'Male', religion: 'Roman Catholic', status: 'Single' },
        contact: { mobilePhoneNumber: '09209876543', emailAddress: 'juan.cruz@gmail.com', homeNumber: '(02) 8765 4321', presentAddress: '456 Elm St, Cavite City, Cavite', permanentAddress: '456 Elm St, Cavite City, Cavite', working: 'No', emergencyContact: 'Maria Cruz', contactNumber: '09209876544' },
        family: {}, educational: {}, work: {}, interests: {}, health: {}, life: {},
    },
    '02000293899': {
        basic: {
            fullName: 'Reyes, Anna C.',
            studentId: '02000293899',
            emailAddress: 'anna.reyes@dasmarinas.sti.edu.ph',
            mobilePhoneNumber: '09391122334',
            academicLevel: 'College',
            programYearSection: 'BSECE, 1.1D',
            gender: 'Female',
            birthDate: '2006-03-15',
            address: '789 Oak Ave, Imus, Cavite',
            emergencyContact: 'Pedro Reyes',
            healthCondition: 'None',
        },
        personal: { fullName: 'Reyes, Anna C.', nickname: 'Anna', studentId: '02000293899', gradeYearLevel: '1st Year College', tertiaryCollegeProgram: 'Bachelor of Science in Electronics Engineering', section: 'D', birthDate: '2006-03-15', nationality: 'Filipino', gender: 'Female', religion: 'Roman Catholic', status: 'Single' },
        contact: { mobilePhoneNumber: '09391122334', emailAddress: 'anna.reyes@gmail.com', homeNumber: '(02) 9876 5432', presentAddress: '789 Oak Ave, Imus, Cavite', permanentAddress: '789 Oak Ave, Imus, Cavite', working: 'No', emergencyContact: 'Pedro Reyes', contactNumber: '09391122335' },
        family: {}, educational: {}, work: {}, interests: {}, health: {}, life: {},
    },
    '02000293900': {
        basic: {
            fullName: 'Santos, Mark D.',
            studentId: '02000293900',
            emailAddress: 'mark.santos@dasmarinas.sti.edu.ph',
            mobilePhoneNumber: '09087654321',
            academicLevel: 'Graduated',
            programYearSection: 'BSIT, Graduated',
            gender: 'Male',
            birthDate: '2000-04-02',
            address: '101 Pine St, Bacoor, Cavite',
            emergencyContact: 'Fe Santos',
            healthCondition: 'None',
        },
        personal: { fullName: 'Santos, Mark D.', nickname: 'Mark', studentId: '02000293900', gradeYearLevel: 'Graduated', tertiaryCollegeProgram: 'Bachelor of Science in Information Technology', section: 'A', birthDate: '2000-04-02', nationality: 'Filipino', gender: 'Male', religion: 'Roman Catholic', status: 'Single' },
        contact: { mobilePhoneNumber: '09087654321', emailAddress: 'mark.santos@gmail.com', homeNumber: '(02) 2345 6789', presentAddress: '101 Pine St, Bacoor, Cavite', permanentAddress: '101 Pine St, Bacoor, Cavite', working: 'No', emergencyContact: 'Fe Santos', contactNumber: '09087654322' },
        family: {}, educational: {}, work: {}, interests: {}, health: {}, life: {},
    },
    '02000293901': {
        basic: {
            fullName: 'Lim, Sarah E.',
            studentId: '02000293901',
            emailAddress: 'sarah.lim@dasmarinas.sti.edu.ph',
            mobilePhoneNumber: '09998765432',
            academicLevel: 'Grade 12',
            programYearSection: 'BSIT, Grade 12',
            gender: 'Female',
            birthDate: '2006-07-01',
            address: '567 Oak Ave, Quezon City, Metro Manila',
            emergencyContact: 'David Lim',
            healthCondition: 'None',
        },
        personal: { fullName: 'Lim, Sarah E.', nickname: 'Sarah', studentId: '02000293901', gradeYearLevel: 'Grade 12', tertiaryCollegeProgram: 'Bachelor of Science in Information Technology', section: 'A', birthDate: '2006-07-01', nationality: 'Filipino', gender: 'Female', religion: 'Roman Catholic', status: 'Single' },
        contact: { mobilePhoneNumber: '09998765432', emailAddress: 'sarah.lim@gmail.com', homeNumber: '(02) 3456 7890', presentAddress: '567 Oak Ave, Quezon City, Metro Manila', permanentAddress: '567 Oak Ave, Quezon City, Metro Manila', working: 'No', emergencyContact: 'David Lim', contactNumber: '09998765433' },
        family: {}, educational: {}, work: {}, interests: {}, health: {}, life: {},
    },
    '02000293902': {
        basic: {
            fullName: 'Tan, Kevin F.',
            studentId: '02000293902',
            emailAddress: 'kevin.tan@dasmarinas.sti.edu.ph',
            mobilePhoneNumber: '09123456789',
            academicLevel: 'Grade 11',
            programYearSection: 'BSCS, Grade 11',
            gender: 'Male',
            birthDate: '2007-08-12',
            address: '890 Maple St, Mandaluyong City, Metro Manila',
            emergencyContact: 'Lily Tan',
            healthCondition: 'Allergies',
        },
        personal: { fullName: 'Tan, Kevin F.', nickname: 'Kevin', studentId: '02000293902', gradeYearLevel: 'Grade 11', tertiaryCollegeProgram: 'Bachelor of Science in Computer Science', section: 'B', birthDate: '2007-08-12', nationality: 'Filipino', gender: 'Male', religion: 'Roman Catholic', status: 'Single' },
        contact: { mobilePhoneNumber: '09123456789', emailAddress: 'kevin.tan@gmail.com', homeNumber: '(02) 4567 8901', presentAddress: '890 Maple St, Mandaluyong City, Metro Manila', permanentAddress: '890 Maple St, Mandaluyong City, Metro Manila', working: 'No', emergencyContact: 'Lily Tan', contactNumber: '09123456790' },
        family: {}, educational: {}, work: {}, interests: {}, health: {}, life: {},
    },
    '02000293903': {
        basic: {
            fullName: 'Gomez, Liza G.',
            studentId: '02000293903',
            emailAddress: 'liza.gomez@dasmarinas.sti.edu.ph',
            mobilePhoneNumber: '09776543210',
            academicLevel: 'College',
            programYearSection: 'BSBA, 2.1A',
            gender: 'Female',
            birthDate: '2004-09-05',
            address: '111 Oakwood Ave, Makati City, Metro Manila',
            emergencyContact: 'Robert Gomez',
            healthCondition: 'None',
        },
        personal: { fullName: 'Gomez, Liza G.', nickname: 'Liza', studentId: '02000293903', gradeYearLevel: '2nd Year College', tertiaryCollegeProgram: 'Bachelor of Science in Business Administration', section: 'A', birthDate: '2004-09-05', nationality: 'Filipino', gender: 'Female', religion: 'Roman Catholic', status: 'Single' },
        contact: { mobilePhoneNumber: '09776543210', emailAddress: 'liza.gomez@gmail.com', homeNumber: '(02) 5678 9012', presentAddress: '111 Oakwood Ave, Makati City, Metro Manila', permanentAddress: '111 Oakwood Ave, Makati City, Metro Manila', working: 'No', emergencyContact: 'Robert Gomez', contactNumber: '09776543211' },
        family: {}, educational: {}, work: {}, interests: {}, health: {}, life: {},
    },
    '02000293904': {
        basic: {
            fullName: 'Santiago, Paolo H.',
            studentId: '02000293904',
            emailAddress: 'paolo.santiago@dasmarinas.sti.edu.ph',
            mobilePhoneNumber: '09665432109',
            academicLevel: 'N/A',
            programYearSection: 'BSECE, N/A',
            gender: 'Male',
            birthDate: '2001-10-20',
            address: '222 Pinecone Rd, Pasig City, Metro Manila',
            emergencyContact: 'Sofia Santiago',
            healthCondition: 'None',
        },
        personal: { fullName: 'Santiago, Paolo H.', nickname: 'Paolo', studentId: '02000293904', gradeYearLevel: 'Left', tertiaryCollegeProgram: 'Bachelor of Science in Electronics Engineering', section: 'D', birthDate: '2001-10-20', nationality: 'Filipino', gender: 'Male', religion: 'Roman Catholic', status: 'Single' },
        contact: { mobilePhoneNumber: '09665432109', emailAddress: 'paolo.santiago@gmail.com', homeNumber: '(02) 6789 0123', presentAddress: '222 Pinecone Rd, Pasig City, Metro Manila', permanentAddress: '222 Pinecone Rd, Pasig City, Metro Manila', working: 'No', emergencyContact: 'Sofia Santiago', contactNumber: '09665432110' },
        family: {}, educational: {}, work: {}, interests: {}, health: {}, life: {},
    },
    '02000293905': {
        basic: {
            fullName: 'Diaz, Nicole I.',
            studentId: '02000293905',
            emailAddress: 'nicole.diaz@dasmarinas.sti.edu.ph',
            mobilePhoneNumber: '09554321098',
            academicLevel: 'College',
            programYearSection: 'BSIT, 1.1C',
            gender: 'Female',
            birthDate: '2006-11-01',
            address: '333 Cedar St, Taguig City, Metro Manila',
            emergencyContact: 'Carlo Diaz',
            healthCondition: 'None',
        },
        personal: { fullName: 'Diaz, Nicole I.', nickname: 'Nicole', studentId: '02000293905', gradeYearLevel: '1st Year College', tertiaryCollegeProgram: 'Bachelor of Science in Information Technology', section: 'C', birthDate: '2006-11-01', nationality: 'Filipino', gender: 'Female', religion: 'Roman Catholic', status: 'Single' },
        contact: { mobilePhoneNumber: '09554321098', emailAddress: 'nicole.diaz@gmail.com', homeNumber: '(02) 7890 1234', presentAddress: '333 Cedar St, Taguig City, Metro Manila', permanentAddress: '333 Cedar St, Taguig City, Metro Manila', working: 'No', emergencyContact: 'Carlo Diaz', contactNumber: '09554321099' },
        family: {}, educational: {}, work: {}, interests: {}, health: {}, life: {},
    },
    '02000293906': {
        basic: {
            fullName: 'Gonzales, Patricia J.',
            studentId: '02000293906',
            emailAddress: 'patricia.gonzales@dasmarinas.sti.edu.ph',
            mobilePhoneNumber: '09443210987',
            academicLevel: 'College',
            programYearSection: 'BSCS, 4.1B',
            gender: 'Female',
            birthDate: '2003-12-01',
            address: '444 Birch Ave, Quezon City, Metro Manila',
            emergencyContact: 'Daniel Gonzales',
            healthCondition: 'Asthma',
        },
        personal: { fullName: 'Gonzales, Patricia J.', nickname: 'Patty', studentId: '02000293906', gradeYearLevel: '4th Year College', tertiaryCollegeProgram: 'Bachelor of Science in Computer Science', section: 'B', birthDate: '2003-12-01', nationality: 'Filipino', gender: 'Female', religion: 'Roman Catholic', status: 'Single' },
        contact: { mobilePhoneNumber: '09443210987', emailAddress: 'patty.gonzales@gmail.com', homeNumber: '(02) 8901 2345', presentAddress: '444 Birch Ave, Quezon City, Metro Manila', permanentAddress: '444 Birch Ave, Quezon City, Metro Manila', working: 'No', emergencyContact: 'Daniel Gonzales', contactNumber: '09443210988' },
        family: {}, educational: {}, work: {}, interests: {}, health: {}, life: {},
    },
    '02000293907': {
        basic: {
            fullName: 'Rodriguez, Oscar K.',
            studentId: '02000293907',
            emailAddress: 'oscar.rodriguez@dasmarinas.sti.edu.ph',
            mobilePhoneNumber: '09332109876',
            academicLevel: 'College',
            programYearSection: 'BSIT, 3.1A',
            gender: 'Male',
            birthDate: '2004-01-10',
            address: '555 Willow St, San Juan City, Metro Manila',
            emergencyContact: 'Elena Rodriguez',
            healthCondition: 'None',
        },
        personal: { fullName: 'Rodriguez, Oscar K.', nickname: 'Oscar', studentId: '02000293907', gradeYearLevel: '3rd Year College', tertiaryCollegeProgram: 'Bachelor of Science in Information Technology', section: 'A', birthDate: '2004-01-10', nationality: 'Filipino', gender: 'Male', religion: 'Roman Catholic', status: 'Single' },
        contact: { mobilePhoneNumber: '09332109876', emailAddress: 'oscar.rodriguez@gmail.com', homeNumber: '(02) 9012 3456', presentAddress: '555 Willow St, San Juan City, Metro Manila', permanentAddress: '555 Willow St, San Juan City, Metro Manila', working: 'No', emergencyContact: 'Elena Rodriguez', contactNumber: '09332109877' },
        family: {}, educational: {}, work: {}, interests: {}, health: {}, life: {},
    },
    '02000293908': {
        basic: {
            fullName: 'Flores, Christine L.',
            studentId: '02000293908',
            emailAddress: 'christine.flores@dasmarinas.sti.edu.ph',
            mobilePhoneNumber: '09221098765',
            academicLevel: 'Graduated',
            programYearSection: 'BSBA, Graduated',
            gender: 'Female',
            birthDate: '2001-02-15',
            address: '666 Poplar Ln, Caloocan City, Metro Manila',
            emergencyContact: 'Antonio Flores',
            healthCondition: 'None',
        },
        personal: { fullName: 'Flores, Christine L.', nickname: 'Chris', studentId: '02000293908', gradeYearLevel: 'Graduated', tertiaryCollegeProgram: 'Bachelor of Science in Business Administration', section: 'B', birthDate: '2001-02-15', nationality: 'Filipino', gender: 'Female', religion: 'Roman Catholic', status: 'Single' },
        contact: { mobilePhoneNumber: '09221098765', emailAddress: 'chris.flores@gmail.com', homeNumber: '(02) 0123 4567', presentAddress: '666 Poplar Ln, Caloocan City, Metro Manila', permanentAddress: '666 Poplar Ln, Caloocan City, Metro Manila', working: 'No', emergencyContact: 'Antonio Flores', contactNumber: '09221098766' },
        family: {}, educational: {}, work: {}, interests: {}, health: {}, life: {},
    },
    '02000293909': {
        basic: {
            fullName: 'Martinez, Daniel M.',
            studentId: '02000293909',
            emailAddress: 'daniel.martinez@dasmarinas.sti.edu.ph',
            mobilePhoneNumber: '09110987654',
            academicLevel: 'College',
            programYearSection: 'BSECE, 2.1C',
            gender: 'Male',
            birthDate: '2005-03-20',
            address: '777 Sycamore St, Paranaque City, Metro Manila',
            emergencyContact: 'Laura Martinez',
            healthCondition: 'None',
        },
        personal: { fullName: 'Martinez, Daniel M.', nickname: 'Dan', studentId: '02000293909', gradeYearLevel: '2nd Year College', tertiaryCollegeProgram: 'Bachelor of Science in Electronics Engineering', section: 'C', birthDate: '2005-03-20', nationality: 'Filipino', gender: 'Male', religion: 'Roman Catholic', status: 'Single' },
        contact: { mobilePhoneNumber: '09110987654', emailAddress: 'dan.martinez@gmail.com', homeNumber: '(02) 1234 5678', presentAddress: '777 Sycamore St, Paranaque City, Metro Manila', permanentAddress: '777 Sycamore St, Paranaque City, Metro Manila', working: 'No', emergencyContact: 'Laura Martinez', contactNumber: '09110987655' },
        family: {}, educational: {}, work: {}, interests: {}, health: {}, life: {},
    },
    '02000293910': {
        basic: {
            fullName: 'Hernandez, Sophia N.',
            studentId: '02000293910',
            emailAddress: 'sophia.hernandez@dasmarinas.sti.edu.ph',
            mobilePhoneNumber: '09009876543',
            academicLevel: 'College',
            programYearSection: 'BSCS, 1.1D',
            gender: 'Female',
            birthDate: '2006-04-25',
            address: '888 Redwood Rd, Muntinlupa City, Metro Manila',
            emergencyContact: 'Jose Hernandez',
            healthCondition: 'None',
        },
        personal: { fullName: 'Hernandez, Sophia N.', nickname: 'Soph', studentId: '02000293910', gradeYearLevel: '1st Year College', tertiaryCollegeProgram: 'Bachelor of Science in Computer Science', section: 'D', birthDate: '2006-04-25', nationality: 'Filipino', gender: 'Female', religion: 'Roman Catholic', status: 'Single' },
        contact: { mobilePhoneNumber: '09009876543', emailAddress: 'soph.hernandez@gmail.edu', homeNumber: '(02) 2345 6789', presentAddress: '888 Redwood Rd, Muntinlupa City, Metro Manila', permanentAddress: '888 Redwood Rd, Muntinlupa City, Metro Manila', working: 'No', emergencyContact: 'Jose Hernandez', contactNumber: '09009876544' },
        family: {}, educational: {}, work: {}, interests: {}, health: {}, life: {},
    },
};

// Define the fields for each information section and their display properties
const fieldDefinitions = {
    basic: [
        { key: 'fullName', label: 'Full Name', type: 'text' },
        { key: 'studentId', label: 'Student ID', type: 'text' },
        { key: 'emailAddress', label: 'Email', type: 'email' },
        { key: 'mobilePhoneNumber', label: 'Contact No', type: 'tel' },
        { key: 'academicLevel', label: 'Academic Level', type: 'text' },
        { key: 'programYearSection', label: 'Program and Year/Section', type: 'text', multiline: true }, // Added multiline for potential long text
        { key: 'gender', label: 'Gender', type: 'radio', options: ['Male', 'Female', 'Others'] }, // Added options for radio
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

    // Map infoType to corresponding title for display
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
        <div className="space-y-6"> {/* Increased spacing between sections */}
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
                {infoTypeTitles[infoType]}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"> {/* Two-column layout for fields */}
                {fieldsToDisplay.map((fieldDef) => {
                    const value = student && student[fieldDef.key] !== undefined ? student[fieldDef.key] : 'N/A';
                    const inputId = `${infoType}-${fieldDef.key}`; // Unique ID for input fields

                    return (
                        <div key={fieldDef.key} className="flex flex-col">
                            <label htmlFor={inputId} className="text-sm text-gray-600 font-medium mb-1">
                                {fieldDef.label}:
                            </label>
                            {isEditing ? (
                                // Render input field based on type
                                fieldDef.type === 'textarea' ? (
                                    <textarea
                                        id={inputId}
                                        value={value === 'N/A' ? '' : value}
                                        onChange={(e) => onFieldChange(infoType, fieldDef.key, e.target.value)}
                                        rows={fieldDef.multiline ? 3 : 1} // Adjust rows for multiline
                                        className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                                    />
                                ) : fieldDef.type === 'radio' ? (
                                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                                        {fieldDef.options.map(option => (
                                            <label key={option} className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`${infoType}-${fieldDef.key}-${student?.studentId}`} // Unique name for radio group
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
                                        className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                                    />
                                )
                            ) : (
                                // Display value in read-only mode with new styling
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


function StudentRecords() {
    const [students, setStudents] = useState(initialStudents);
    const [activeTab, setActiveTab] = useState('Enrolled');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [showArchiveConfirmModal, setShowArchiveConfirmModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [infoType, setInfoType] = useState('basic');
    const [selectedYearLevel, setSelectedYearLevel] = useState('none');
    const [selectedProgram, setSelectedProgram] = useState('none');
    const [editedStudentData, setEditedStudentData] = useState(null);


    useEffect(() => {
        if (selectedStudentId) {
            setEditedStudentData(JSON.parse(JSON.stringify(mockStudentDetails[selectedStudentId])));
        } else {
            setEditedStudentData(null);
            setIsEditing(false);
        }
    }, [selectedStudentId]);


    const [newStudentForm, setNewStudentForm] = useState({
        firstName: '', lastName: '', studentNumber: '', emailAddress: '',
        gradeYearLevel: '', programStrand: '', section: '', birthDate: '', age: '',
        gender: '', mobileNo: '', address: '', emergencyContact: '', contactNo: '',
        healthCondition: '', profileImage: null,
    });

    const handleNewStudentFormChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setNewStudentForm(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setNewStudentForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddStudent = () => {
        if (!newStudentForm.firstName || !newStudentForm.lastName || !newStudentForm.studentNumber) {
            alert('Please fill in First Name, Last Name, and Student Number.');
            return;
        }

        const newStudentId = `0200029${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
        const fullName = `${newStudentForm.lastName}, ${newStudentForm.firstName} ${newStudentForm.middleName ? newStudentForm.middleName.charAt(0) + '.' : ''}`;
        const academicLevel = newStudentForm.gradeYearLevel.includes('Grade') ? newStudentForm.gradeYearLevel : 'College';
        const programYearSection = `${newStudentForm.programStrand}, ${newStudentForm.section}`;


        const newStudentToList = {
            id: newStudentId,
            name: fullName,
            type: 'Enrolled',
            yearLevel: newStudentForm.gradeYearLevel,
            program: newStudentForm.programStrand,
        };

        const newStudentDetails = {
            basic: {
                fullName: fullName,
                studentId: newStudentId,
                emailAddress: newStudentForm.emailAddress,
                mobilePhoneNumber: newStudentForm.mobileNo,
                academicLevel: academicLevel,
                programYearSection: programYearSection,
                gender: newStudentForm.gender,
                birthDate: newStudentForm.birthDate,
                address: newStudentForm.address,
                emergencyContact: newStudentForm.emergencyContact,
                healthCondition: newStudentForm.healthCondition,
            },
            personal: { // Ensure personal fields are aligned with the new form
                fullName: fullName,
                nickname: newStudentForm.firstName, // Simple default
                studentId: newStudentId,
                gradeYearLevel: newStudentForm.gradeYearLevel,
                tertiaryCollegeProgram: newStudentForm.programStrand,
                section: newStudentForm.section,
                birthDate: newStudentForm.birthDate,
                nationality: 'Filipino', // Default
                gender: newStudentForm.gender,
                religion: 'N/A', // Default
                status: 'N/A', // Default
            },
            contact: {
                mobilePhoneNumber: newStudentForm.mobileNo,
                emailAddress: newStudentForm.emailAddress,
                homeNumber: '',
                presentAddress: newStudentForm.address,
                permanentAddress: newStudentForm.address,
                working: 'No',
                emergencyContact: newStudentForm.emergencyContact,
                contactNumber: newStudentForm.contactNo,
            },
            family: {}, educational: {}, work: {}, interests: {}, health: {}, life: {},
        };

        setStudents(prevStudents => [...prevStudents, newStudentToList]);
        mockStudentDetails[newStudentId] = newStudentDetails;

        setNewStudentForm({
            firstName: '', middleName: '', lastName: '', studentNumber: '', emailAddress: '',
            gradeYearLevel: '', programStrand: '', section: '', birthDate: '', age: '',
            gender: '', mobileNo: '', address: '', emergencyContact: '', contactNo: '',
            healthCondition: '', profileImage: null,
        });
        setShowAddStudentModal(false);
        alert('Student Added Successfully!');
    };

    const handleArchiveStudent = () => {
        if (selectedStudentId) {
            setStudents(prevStudents =>
                prevStudents.map(student =>
                    student.id === selectedStudentId ? { ...student, type: 'Archived' } : student
                )
            );
            setSelectedStudentId(null);
            setShowArchiveConfirmModal(false);
            alert('Student Archived Successfully!');
        }
    };

    const handleSaveEdits = () => {
        if (editedStudentData && selectedStudentId) {
            mockStudentDetails[selectedStudentId] = editedStudentData;

            // Update main students list for any changes in display fields
            setStudents(prevStudents =>
                prevStudents.map(student =>
                    student.id === selectedStudentId
                        ? {
                            ...student,
                            name: editedStudentData.basic?.fullName || student.name,
                            yearLevel: editedStudentData.basic?.gradeYearLevel || editedStudentData.basic?.academicLevel || student.yearLevel, // Prioritize gradeYearLevel if available, else academicLevel
                            program: editedStudentData.basic?.tertiaryCollegeProgram || student.program,
                        }
                        : student
                )
            );

            setIsEditing(false);
            alert('Changes saved successfully!');
        }
    };

    const handleInfoFieldChange = (category, field, value) => {
        setEditedStudentData(prevData => {
            if (!prevData) return prevData;

            const newData = JSON.parse(JSON.stringify(prevData));

            if (!newData[category]) {
                newData[category] = {};
            }
            newData[category][field] = value;
            return newData;
        });
    };

    const filteredStudents = students.filter(student => {
        const matchesTab = (activeTab === 'All' && (student.type === 'Enrolled' || student.type === 'Archived')) || student.type === activeTab;
        const matchesSearch = searchTerm === '' || student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              student.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesYearLevel = selectedYearLevel === 'none' || student.yearLevel === selectedYearLevel;
        const matchesProgram = selectedProgram === 'none' || student.program === selectedProgram;

        return matchesTab && matchesSearch && matchesYearLevel && matchesProgram;
    }).sort((a, b) => {
        const yearOrder = {
            'Grade 11': 1, 'Grade 12': 2,
            '1st Year College': 3, '2nd Year College': 4,
            '3rd Year College': 5, '4th Year College': 6,
            'Graduated': 7, 'Left': 8, 'NA': 9, '': 10
        };
        const yearA = yearOrder[a.yearLevel] || 99;
        const yearB = yearOrder[b.yearLevel] || 99;

        if (selectedYearLevel !== 'none') {
            if (yearA !== yearB) return yearA - yearB;
        }

        if (selectedProgram !== 'none') {
            if (a.program !== b.program) return a.program.localeCompare(b.program);
        }

        return 0;
    });

    const displayStudentData = isEditing && editedStudentData ? editedStudentData : (selectedStudentId ? mockStudentDetails[selectedStudentId] : null);

    // Map infoType to corresponding title for the InfoSection component
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


    const yearLevelOptions = [
        "none", "Grade 11", "Grade 12", "1st Year College",
        "2nd Year College", "3rd Year College", "4th Year College",
    ];

    const programOptions = [
        "none", "BSIT", "BSCS", "BSBA", "BSECE", "BMMA",
    ];

    return (
        // Main container for the entire student records interface
        // Uses flexbox to create the left and right panel layout
        <div className="flex bg-gray-100 min-h-screen">

            {/* Left Panel: Student List */}
            <div className={`w-96 bg-white border-r border-gray-200 shadow-lg flex flex-col`}>

                {/* Header Section of Left Panel */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                        {/* Student List Icon */}
                        <p className="text-3xl font-bold text-gray-800">Student List</p>
                    </div>

                    {/* Filter Tabs: Archive / Enrolled */}
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

                    {/* Search Bar for Name/ID */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Name/ ID"
                            className="w-full pl-2 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out hover:bg-gray-100"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {/* Search Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>

                    {/* Filter Dropdowns - Now side by side using flexbox */}
                    <div className="flex space-x-2 mb-4"> {/* Added flex and space-x-2 for side-by-side layout */}
                        {/* Year Level Dropdown */}
                        <div className="relative flex-1"> {/* flex-1 ensures it takes equal space */}
                            <select
                                className="text-sm block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0a1220] focus:border-transparent transition duration-150 ease-in-out appearance-none bg-white pr-8 cursor-pointer"
                                value={selectedYearLevel}
                                onChange={(e) => setSelectedYearLevel(e.target.value)}
                            >
                                <option value="none">Year Level</option> {/* Changed placeholder text */}
                                {yearLevelOptions.filter(opt => opt !== "none").map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <img src={dropdown} alt="dropdownIcon" className="w-2.5 h-2.5 object-cover mr-2" />
                            </div>
                        </div>

                        {/* Program/Course Dropdown */}
                        <div className="relative flex-1"> {/* flex-1 ensures it takes equal space */}
                            <select
                                className="text-sm block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0a1220] focus:border-transparent transition duration-150 ease-in-out appearance-none bg-white pr-8 cursor-pointer"
                                value={selectedProgram}
                                onChange={(e) => setSelectedProgram(e.target.value)}
                            >
                                <option value="none">Program/Course</option> {/* Changed placeholder text */}
                                {programOptions.filter(opt => opt !== "none").map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <img src={dropdown} alt="dropdownIcon" className="w-2.5 h-2.5 object-cover mr-2" />
                            </div>
                        </div>
                    </div>

                    {/* Add Student Button */}
                    <button
                        className="w-full bg-[#0a1220] hover:bg-[#003d54] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out shadow-md hover:shadow-lg"
                        onClick={() => setShowAddStudentModal(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Add Student
                    </button>
                </div>

                {/* Student List - Scrollable Area */}
                <div className="flex-1 overflow-y-auto pb-4">
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                            <div
                                key={student.id}
                                className={`flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer transition duration-150 ease-in-out
                                            ${selectedStudentId === student.id ? 'bg-blue-100 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
                                onClick={() => setSelectedStudentId(student.id)}
                            >
                                <div className="flex items-center">
                                    {/* User Icon for student list item */}
                                    <img src={user} alt="User" className="w-5 h-5 object-cover mr-5" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{student.name}</p>
                                        <p className="text-sm text-gray-600">{student.id}</p>
                                    </div>
                                </div>
                                {/* Arrow Icon for student list item */}
                                <img src={next} alt="nextIcon" className="w-3 h-3 object-cover mr-2" />
                            </div>
                        ))
                    ) : (
                        <p className="p-4 text-gray-500 text-center">No students found.</p>
                    )}
                </div>
            </div>


            {/* Right Panel: Student Information Details */}
            <div className={`flex-1 bg-white flex flex-col`}>
                <Fragment>
                    {/* Right Panel Header with action buttons and info type dropdown */}
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            {/* Back Button - Always visible on desktop. */}
                            <button
                                className="p-2 rounded-full hover:bg-gray-200 transition duration-150 ease-in-out cursor-pointer"
                                onClick={() => setSelectedStudentId(null)}
                            >
                                <img src={back} alt="backIcon" className="w-5 h-5 object-cover" />
                            </button>
                            {/* Info Type Dropdown */}
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

                        {/* Action Buttons: Edit, Archive, Cases */}
                        <div className="flex items-center space-x-2 sm:space-x-3 mt-2 sm:mt-0">
                            <button
                                className={`px-3 sm:px-4 py-2 rounded-lg flex items-center transition duration-150 ease-in-out text-sm sm:text-base font-medium cursor-pointer
                                            ${isEditing ? 'bg-gray-500 text-white shadow-md' : 'bg-gray-800 hover:bg-gray-700 text-white shadow-md hover:shadow-lg'}`}
                                onClick={() => {
                                    if (isEditing) {
                                        handleSaveEdits();
                                    }
                                    setIsEditing(!isEditing);
                                }}
                            >
                                {/* Edit/Save Icon */}
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14.25v4.5a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V7.5A2.25 2.25 0 015.25 5.25h4.5" />
                                {isEditing ? 'Save' : 'Edit Student'}
                                <img src={edit} alt="editIcon" className="w-4 h-4 sm:w-5 sm:h-5 ml-3" />
                            </button>

                            <button
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 sm:px-4 rounded-lg flex items-center transition duration-150 ease-in-out shadow-md hover:shadow-lg cursor-pointer **justify-between**"
                                onClick={() => setShowArchiveConfirmModal(true)}
                            >
                                Archive
                                <img src={archive} alt="archiveIcon" className="w-4 h-4 sm:w-5 sm:h-5 ml-3" />
                            </button>

                            {/* Cases Button - always visible as it's a desktop view */}
                            <button className="bg-[#0a1220] hover:bg-[#003d54] text-white font-bold py-2 px-3 sm:px-4 rounded-lg flex items-center transition duration-150 ease-in-out shadow-md hover:shadow-lg cursor-pointer">
                                Case
                            <img src={cases} alt="caseIcon" className="w-4 h-4 sm:w-5 sm:h-5 ml-3" />
                            </button>
                        </div>
                    </div>

                    {/* Student Information Content - Scrollable */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {displayStudentData ? (
                            /* Render the selected information panel dynamically */
                            <InfoSection
                                infoType={infoType}
                                student={displayStudentData[infoType]}
                                isEditing={isEditing}
                                onFieldChange={handleInfoFieldChange}
                            />
                        ) : (
                            /* Message when no student is selected in the right panel */
                            <div className="flex-1 flex items-center justify-center text-gray-500 text-xl p-4 text-center">
                                Select a student from the list to view their information.
                            </div>
                        )}
                    </div>
                </Fragment>
            </div>

            {/* Add Student Modal */}
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
                            {/* Left Column */}
                            <div className="space-y-4">
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

                            {/* Right Column */}
                            <div className="space-y-4">
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
                                <X className="w-8 h-8 ml-2" /> {/* X Icon from Lucide */}                                
                            </button>
                            {/* "Continue" button from screenshot is omitted as it implies multi-step form */}
                            <button
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150 ease-in-out cursor-pointer"
                                onClick={handleAddStudent}
                            >
                                Save
                                <Check className="w-8 h-8 ml-2" /> {/* Check Icon from Lucide */}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Archive Confirmation Modal Placeholder */}
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
