import Card from '../../../component/Card.jsx';
import styles from './dashboard-module-css/Dashboard.module.css';

export default function AdminDashboard() {
    return(
        <>
            <div className={styles.dashboardContainer}>
                <h1 className={styles.dashboardHeader}>Dashboard</h1>

                <div className={styles.dashboardViolations}>
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
        </>
    );
}