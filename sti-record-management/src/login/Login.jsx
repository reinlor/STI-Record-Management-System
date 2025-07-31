import Button from '../component/Button.jsx';
import styles from './Login.module.css';

export default function Login() {
    return (
        <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
            <h1 className={styles.title}>Welcome Back Nig</h1>
            <p className={styles.subtitle}>Please click below to continue.</p>
            <Button to="/admin" className={styles.loginBtn}>
                Go to Admin Dashboard
            </Button>
            <Button to="/userManager" className={styles.userManagerBtn}>
                Go to User Manager
            </Button>
        </div>
        </div>
    );
}