const { getUserCollection } = require("../models/userModel.js");
const admin = require("../firebase.js");

/**
 * GET all users from Firestore
 */
const getUsers = async (req, res) => {
  try {
    const snapshot = await getUserCollection().get();

    const users = snapshot.docs.map((doc) => ({
      ...doc.data(),
    }));

    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch users" });
  }
};

/**
 * UPDATE a user by ID
 */
const updateUser = async (req, res) => {
  const { id } = req.params;
  const {
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
    const userDocRef = getUserCollection().doc(id);
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    await userDocRef.update({
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

    res.status(200).json({ message: `User ${id} updated successfully.` });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

/**
 * DELETE a user by ID
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userDocRef = getUserCollection().doc(id);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(404).send({ error: "User not found" });
    }

    const { _id } = userDoc.data();

    if (!_id) {
      return res.status(400).send({ error: "UID missing in user document" });
    }

    try {
      await admin.auth().deleteUser(_id);
    } catch (authError) {
      if (authError.code !== "auth/user-not-found") {
        throw authError;
      }
    }

    await userDocRef.delete();

    res.status(200).send({ message: `User ${id} deleted successfully.` });
  } catch (error) {
    res.status(500).send({ error: "Failed to delete user" });
  }
};

module.exports = { getUsers, deleteUser, updateUser };
