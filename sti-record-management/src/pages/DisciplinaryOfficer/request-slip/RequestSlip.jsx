import react, { useState } from 'react'
import { useNavigate } from 'react-router'
import RequestSlipHistory from './RequestSlipHistory.jsx'

// palagyan ng CSS
function RequestSlip() {
    const [display, setDisplay] = useState(false);
    const navigate = useNavigate();

    // sample data (pa remove if may axios request na)
    const sampleTable = [{
        name: 'De Pedro, Dionne',
        studentNo: '02000000000',
        typeOfSlip: 'Absent Slip',
        Date: '07/31/2025',
        status: 'Pending',
        reason: 'LBM',
        attachment: '2'
    }, {
        name: 'Colinco, Jordan',
        studentNo: '02000000000',
        typeOfSlip: 'Late Slip',
        Date: '07/31/2025',
        status: 'Pending',
        reason: 'Puyat',
        attachment: '3'
    },]

    const displaySlipForm = (id) => {

        if (display) {
            return (
                <>
                    {/* Palagyan ng data */}
                    <div>
                        <h2>Request Slip Form</h2> <br />
                        <label>Name: </label> <br />
                        <label>program: </label> <br />
                        <label>Year and Section: </label> <br />
                        <label>Email: </label> <br />
                        <label>Status: </label> <br />
                        <label>Reason: </label> <br />
                        <label>Days Absent: </label> <br />

                        <b>Excuse Letter/Medical Certificate</b> <br />
                        <b>Photo of Parent's/Guardian ID</b> <br />
                    </div>

                    <div>
                        <label>
                            Send Email to
                            <input type="text" />
                        </label> <br />
                        <label>
                            subject
                            <input type="text" />
                        </label> <br />
                        <label>
                            Body
                            <input type="text" />
                        </label> <br />

                        <button>Deny</button>
                        <button>Approve</button>
                    </div>
                </>
            )
        }
        return
    }

    // data na iloload sa table
    const requestTable = sampleTable.map((slips) =>
        <tr>
            <td>{slips.name}</td>
            <td>{slips.studentNo}</td>
            <td>{slips.typeOfSlip}</td>
            <td>{slips.Date}</td>
            <td>{slips.status}</td>
            <td>{slips.reason}</td>
            <td>{slips.attachment}</td>
            <td>
                <button
                    onClick={() => setDisplay(!display)}
                >
                    Open
                </button>
            </td>
        </tr>
    );

    // Palagyan ng CSS papalit din ng html kung kinakailangan
    return (
        <div>
            <h1>Request Slip Processing</h1>

            <button
                onClick={() => 
                    navigate(
                        '/disciplinary/request-slip-history'
                    )
                }
            >History</button>
            <input type="text" placeholder="Name ID" />

            <div>
                <table>
                    <thead>
                        <tr>
                            <td>Name</td>
                            <td>Student No.</td>
                            <td>Type of Slip</td>
                            <td>Date</td>
                            <td>Status</td>
                            <td>Reason</td>
                            <td>Attachment</td>
                        </tr>
                    </thead>
                    <tbody>
                        {requestTable}
                    </tbody>
                </table>
            </div>

            <div>{displaySlipForm()}</div>
        </div>
    )
}

export default RequestSlip;