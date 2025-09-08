import axios from "axios"
import { useState, useEffect } from "react"

function StudentList({ onBack }) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [displayAcadLevel, setDisplayAcadLevel] = useState("Senior High School")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/student/');
                setStudents(response.data || []);
            } catch (err) {
                console.error("Error fetching students:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <p>Loading students...</p>;
    if (error) return <p>Error loading students.</p>;
    return (
        <div>
            <button onClick={onBack}>Go Back</button>
            <button onClick={() => {setDisplayAcadLevel("Senior High School")}}>College</button>
            <button onClick={() => {setDisplayAcadLevel("Tertiary")}}>Senior High School</button>
            <table>
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Program & Section</th>
                        <th>Gender</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {students
                        .filter(student => student?.studentProfile?.academicLevel !== displayAcadLevel)
                        .map(student => (
                            <tr key={student.sid}>
                                <td>{student.sid}</td>
                                <td>{student.studentProfile?.name}</td>
                                <td>{student.studentProfile?.program} {student.studentProfile?.section}</td>
                                <td>{student.studentProfile?.gender}</td>
                                <td>{student.isArchived ? 'Inactive' : 'Active'}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    )
}

export default StudentList;
