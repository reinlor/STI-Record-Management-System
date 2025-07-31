import Card from '../../../component/Card.jsx';

function Dashboard() {
    return (
        <div>
            <h1>Dashboard</h1>

            <div>
                <Card title="Violation Frequency" icon="🚨">
                    <p>Graph na papakita mga pinaka frequent na Violations</p>
                </Card>

                <Card title="Leaderboard" icon="🏆">
                    <p>Mga Top Student Violators</p>
                </Card>

                <Card title="Request Type Frequency" icon="📬">
                    <p>Request Graph</p>
                </Card>

                <Card title="Graph" icon="📈">
                    <p>Graph or Kung ano man</p>
                </Card>
            </div>
        </div>
    )
}

export default Dashboard;