import react, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

function RefferalForm() {
    const [display, setDisplay] = useState(false);
    const [status, setStatus] = useState();
    const navigate = useNavigate();

    // Papatangal pag may axios na
    const sampleData = [{
        name: 'Alcantara, Venice Angelica',
        employeeNo: '02000000000',
        violation: 'Disrespectful Behavior',
        referredStudent: 'Colinco, Jordan',
        date: '07/31/2025',
        status: 'In progress',
    }, {
        name: 'Alcantara, Venice Angelica',
        employeeNo: '02000000000',
        violation: 'Disrespectful Behavior',
        referredStudent: 'De Pedro, Dionne',
        date: '07/31/2025',
        status: 'In progress',
    }]

    // Papalit pag may axios na
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
                }>
                Open
            </button>
        </tr>
    )

    const displayReferralData = () => {
        if (display) {
            return <>
                <h3>Referral Form</h3>
                <div>
                    <p>Status
                        <select>
                            <option value="">On Going</option>
                            <option value="Resolved">Resolved</option>
                            {/* Add more option - Eneil */}
                        </select>
                    </p>
                    <hr />

                    <p>School Year: </p>
                    <p>Tertiary (semester): </p>
                    <p>Senior High (quarter): </p>
                    <p>Student Number: </p>
                    <p>Student Name: </p>
                    <p>Program and Section: </p>
                    <p>Gender:  </p>
                    <p>Age: </p>
                    <p>Referred By: </p>
                    <p>Areas of Concern: </p>
                    <p>Action Required: </p>
                    <p>Level of Priority: </p>
                    <p>Action Taken Before Referral: </p>
                    <input type='text'/>
                    <p>Reason for Referral/Comments: </p>
                    <input type='text'/>
                </div>

                <div>
                    <p>Conselor's Initial Action: </p>
                    <p>Counselor's Note: </p>
                    <input type='text'/>
                    <p>Counselor's Note: </p>
                    <input type='text'/>
                    <p>Send Email To: </p>
                    <input type='text'/>
                    <p>Subject:</p>
                    <input type='text'/>
                    <p>Body:</p>
                    <input type='text'/>

                    <button>Update</button>
                    <button>Solved</button>
                </div>
            </>
        }
        return
    }

    return (
        <div>
            <h1>Referral Form Processing</h1>
            <div>
                <button
                    onClick={()=>
                        navigate("/disciplinary/referral-form-history")
                    }
                >History</button>
                <input
                    type="text"
                    placeholder="Name/ID" />
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
                <tbody>
                    {displayReferralTable}
                </tbody>
            </table>
            
            {displayReferralData()}
        </div>
    )
}

export default RefferalForm;