const admin = require("../firebase");
const { getUserCollection } = require("../models/userModel.js");

// Controller function to handle registration
const registerUser = async (req, res) => {
  const {
    email,
    password,

    sid,

    name,
    section,
    age,
    nationality,
    gender,
    status,
    birthPlace,
    birthday,
    religion,
    contactNo,

    permanentAddress,
    currentAddress,
    provincialAddress,

    fName,
    fAge,
    fNationality,
    fReligion,
    fEducationalAttainment,
    fOccupation,
    fCompany,

    mName,
    mAge,
    mNationality,
    mReligion,
    mEducationalAttainment,
    mOccupation,
    mCompany,

    monthlyFamilyIncome,
    statusOfParent,
    siblingOrder,

    eName,
    eContact,

    dateEnrolled,

    shsSchoolName,
    shsDateEnrolled,
    shsWithHonors,

    jhsSchoolName,
    jhsDateEnrolled,
    jhsWithHonors,

    elemSchoolName,
    elemDateEnrolled,
    elemWithHonors,

    hobbies,

    currentConcerns,
    otherConcerns,

    lifeCircumstances,
  } = req.body;

  try {
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Store additional user data in Firestore
    await getUserCollection()
      .doc(sid)
      .set({
        sid,
        _id: userRecord.uid,
        StudentProfile: {
          name,
          section,
          age,
          nationality,
          gender,
          status,
          birthPlace,
          birthday,
          religion,
        },

        ContactInfo: {
          email,
          contactNo,
          address: { permanentAddress, currentAddress, provincialAddress },
        },

        FamilyBackground: {
          fatherInfo: {
            name: fName,
            age: fAge,
            nationality: fNationality,
            religion: fReligion,
            educationalAttainment: fEducationalAttainment,
            occupation: fOccupation,
            company: fCompany,
          },

          motherInfo: {
            name: mName,
            age: mAge,
            nationality: mNationality,
            religion: mReligion,
            educationalAttainment: mEducationalAttainment,
            occupation: mOccupation,
            company: mCompany,
          },

          monthlyFamilyIncome,
          statusOfParent,
          siblingOrder,

          emergency: {
            name: eName,
            contactNo: eContact,
          },
        },

        EducationalBackground: {
          dateEnrolled,

          seniorHighSchool: {
            schoolName: shsSchoolName,
            dateEnrolled: shsDateEnrolled,
            withHonors: shsWithHonors,
          },

          juniorHighSchool: {
            schoolName: jhsSchoolName,
            dateEnrolled: jhsDateEnrolled,
            withHonors: jhsWithHonors,
          },

          elementary: {
            schoolName: elemSchoolName,
            dateEnrolled: elemDateEnrolled,
            withHonors: elemWithHonors,
          },
        },

        hobbies,

        Health: {
          currentConcerns: currentConcerns,
          otherConcerns,
        },

        lifeCircumstances,
      });

    res.status(201).json({ message: "User registered", id: sid });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerUser };
