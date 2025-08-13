import Button from '../component/Button.jsx';
import styles from './Login.module.css';

export default function Login() {
    return (
        <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
            <h1 className={styles.title}>Placeholder Login</h1>
            <p className={styles.subtitle}>Please click below to continue.</p>
            <Button to="/admin" className={styles.loginBtn}>
                Go to Admin Page
            </Button>
            <Button to="/disciplinary" className={styles.loginBtn}>
                Go to Disciplinary Officer Page
            </Button>
            <Button to="/student" className={styles.loginBtn}>
                Go to Student Page
            </Button>
            <Button to="/signup" className={styles.userManagerBtn}>
                Go to Student Sign Up Initial Page
            </Button>
            <Button to="/Teacher" className={styles.userManagerBtn}>
                Go to Teacher Page
            </Button>
            <Button to="/userManager" className={styles.userManagerBtn}>
                Go to User Manager
            </Button>

        </div>
        </div>
    );
}