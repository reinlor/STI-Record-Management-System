import react, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

function requestSlipHistory() {
    const navigate = useNavigate()
    const [display, setDisplay] = useState(false);

    // Papalit pag may axios requet na
    const sampleData = [{
        name: 'Lor, Rehneil',
        studentNo: '02000000000',
        typeOfSlip: 'Absent Slip',
        date: '07/31/2025',
        status: 'Denied',
        reason: 'LBM',
        daysAbsent: '2'
    }, {
        name: 'Tugna, Sean',
        studentNo: '02000000000',
        typeOfSlip: 'Late Slip',
        date: '07/31/2025',
        status: 'Approved',
        reason: 'Traffic',
        daysAbsent: '0'
    }]

    // Papalit ng logic kung may maisip na maayos
    const colorStatusIndicator = (status) => {
        if (status === 'Approved') {
            return <td style={{ color: "green" }}>{status}</td>
        }
        else {
            return <td style={{ color: "red" }}>{status}</td>
        }
    }

    const displayRequestSlipForm = () => {
        if (display) {
            return (
                <div>
                    <h4>Request Slip Form</h4>
                    <p>Name: </p> <br />
                    <p>Program: </p> <br />
                    <p>Years and Section: </p> <br />
                    <p>Email: </p> <br />
                    <p>Status: </p> <br />
                    <p>Reason: </p> <br />
                    <p>Days Absent: </p> <br />
                    <b>Excuse Letter/Medical Certificate</b>
                    <b>Photo of parent's/Guardian's ID</b>
                </div>
            )
        }
        return
    }

    const displaySlipHistoryTable = sampleData.map(
        (slips) =>
            <tr>
                <td>{slips.name}</td>
                <td>{slips.studentNo}</td>
                <td>{slips.typeOfSlip}</td>
                <td>{slips.date}</td>
                {colorStatusIndicator(slips.status)}
                <td>{slips.reason}</td>
                <td>{slips.daysAbsent}</td>
                <td>
                    <button
                        onClick={() => 
                            setDisplay(!display)}
                    >
                        Open
                    </button>
                </td>
            </tr>
    )

    return (
        <div>
            <h1 onClick={() =>
                navigate('/disciplinary/request-slip')}
                style={{cursor:'pointer'}}>⬅️</h1>
            <h1>Request Slip History</h1>

            <table>
                <thead>
                    <tr>
                        <td>Name</td>
                        <td>Student No.</td>
                        <td>Type of Slip</td>
                        <td>Date</td>
                        <td>Status</td>
                        <td>Reason</td>
                        <td>Days Absent</td>
                    </tr>
                </thead>
                <tbody>
                    {displaySlipHistoryTable}
                </tbody>
            </table>
            {displayRequestSlipForm()}
        </div>
    );
}

export default requestSlipHistory;