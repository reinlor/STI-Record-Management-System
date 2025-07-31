import react, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ReferralFormHistory() {
    const navigate = useNavigate();
    const [display, setDisplay] = useState(false);

    // Patangal pag may axios na
    const sampleData = [{
        name: 'Alcantara, Venice Angelica',
        employeeNo: '02000000000',
        violation: 'Disrespectful Behavior',
        referredStudent: 'Lor, Rehneil',
        date: '07/31/2025',
        status: 'Resolved'
    }, {
        name: 'Alcantara, Venice Angelica',
        employeeNo: '02000000000',
        violation: 'Disrespectful Behavior',
        referredStudent: 'Tugna, Sean',
        date: '07/31/2025',
        status: 'Resolved'
    }]

    // Papalitan pag may axios na
    const displayReferralTable = sampleData.map((referrals) =>
        <tr>
            <td>{referrals.name}</td>
            <td>{referrals.employeeNo}</td>
            <td>{referrals.violation}</td>
            <td>{referrals.referredStudent}</td>
            <td>{referrals.date}</td>
            <td>{referrals.status}</td>
            <button
                onClick={() =>
                    setDisplay(!display)
                }
            >
                Open
            </button>
        </tr>
    )

    // Papalit kung may naiisip na mas maayos na logic
    const displayReferralData = () => {
        if (display) {
            return <>
                <h3>Referral Form</h3> <hr/>

                <div>
                    <p>School Year: </p>
                    <p>Tertiary (Semester): </p>
                    <p>Senior High (Quarter): </p>
                    <p>Student Number: </p>
                    <p>Student Name: </p>
                    <p>Program and Section: </p>
                    <p>Gender: </p>
                    <p>Age: </p>
                    <p>Referred By: </p>
                    <p>Areas of Concern: </p>
                    <p>Action Required: </p>
                    <p>Level of priority: </p>
                    <p>Actions Taken before Referral: </p>
                    <input type='text'/>
                    <p>Reason for Referral/Comments: </p>
                    <input type='text'/>
                </div>

                <div>
                    <p>Counselor's Initial Action</p>
                    <p>Counselor's Note</p>
                    <input type='text'/>
                </div>
            </>
        }
        return
    }

    return (
        <div>
            <h1>Referral Form History</h1>
            <input type="text" placeholder="Name ID" />
            <table>
                <thead>
                    <tr>
                        <td>Name</td>
                        <td>Employee No.</td>
                        <td>Violation</td>
                        <td>Referred Student</td>
                        <td>Date</td>
                        <td>Status</td>
                    </tr>
                </thead>
                <tbody>
                    {displayReferralTable}
                </tbody>
            </table>
            {displayReferralData()}
        </div>
    )
}

export default ReferralFormHistory;