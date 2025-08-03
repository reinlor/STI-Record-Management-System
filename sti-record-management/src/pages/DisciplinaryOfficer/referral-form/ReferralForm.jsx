import react, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RefferalForm() {
  const [display, setDisplay] = useState(false);
  const [status, setStatus] = useState();
  const [referralData, setReferralData] = useState([]);
  const [referralFormData, setReferralFormData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/referral/");
        setReferralData(res.data);
        console.log(res.data);
      } catch (error) {
        console.error("Error fetching referral data:", error.message);
      }
    };

    fetchData();
  }, []);

  const getReferralData = async (referralID) => {
      try {
        const res = await axios.get(`/referral/${referralID}`);

        setReferralFormData(res.data);

        setStatus(res.data.status);

      } catch (error) {
        console.error(error);
      }
    };

  const displayReferralTable = referralData.map((referrals) => (
    <tr key={referrals.id}>
      <td>{referrals.referredBy}</td>
      <td>{referrals.employeeID}</td>
      <td>{referrals.reasonForReferral}</td>
      <td>{referrals.studentName}</td>
      <td>{referrals.date}</td>
      <td>{referrals.status}</td>
      <td>
        <button
          onClick={() => {
            setDisplay(!display);
            getReferralData(referrals.id);
          }}
        >
          Open
        </button>
      </td>
    </tr>
  ));

  const displayReferralData = () => {
    if (display) {
      return (
        <>
          <h3>Referral Form</h3>
          <div>
            <p>
              Status
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Ongoing">Ongoing</option>
                <option value="Resolved">Resolved</option>
                {/* Add more option - Eneil */}
              </select>
            </p>
            <hr />
            <p>Referral ID: {referralFormData.id} </p>
            <p>School Year: {referralFormData.schoolYear}</p>
            <p>Tertiary (semester): </p>
            <p>Senior High (quarter): </p>
            <p>Student Number: {referralFormData.sid} </p>
            <p>Student Name: {referralFormData.studentName}</p>
            <p>Program and Section: {referralFormData.program} {referralFormData.section}</p>
            <p>Gender: {referralFormData.gender}</p>
            <p>Age: {referralFormData.age}</p>
            <p>Referred By: {referralFormData.referredBy}</p>
            <p>Areas of Concern: {referralFormData.areasOfConcern}</p>
            <p>Action Required: {referralFormData.actionRequired}</p>
            <p>Level of Priority: {referralFormData.levelOfPriority}</p>
            <p>Action Taken Before Referral:</p>
            <input type="text" value={referralFormData.actionTaken} />
            <p>Reason for Referral/Comments: </p>
            <input type="text" value={referralFormData.reasonForReferral}/>
          </div>

          <div>
            <p>Conselor's Initial Action: {referralFormData.initialAction}</p>
            <p>Counselor's Note: </p>
            <input type="text" />
            <p>Counselor's Note: </p>
            <input type="text" />
            <p>Send Email To: </p>
            <input type="text" />
            <p>Subject:</p>
            <input type="text" />
            <p>Body:</p>
            <input type="text" />

            <button>Update</button>
            <button>Solved</button>
          </div>
        </>
      );
    }
    return;
  };

  return (
    <div>
      <h1>Referral Form Processing</h1>
      <div>
        <button onClick={() => navigate("/disciplinary/referral-form-history")}>
          History
        </button>
        <input type="text" placeholder="Name/ID" />
      </div>
      <table>
        <thead>
          <tr>
            <td>Name</td>
            <td>Employee No.</td>
            <td>Violation</td>
            <td>Reffered Student</td>
            <td>Date</td>
            <td>Status</td>
          </tr>
        </thead>
        <tbody>{displayReferralTable}</tbody>
      </table>

      {displayReferralData()}
    </div>
  );
}

export default RefferalForm;
