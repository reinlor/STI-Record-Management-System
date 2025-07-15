import Button from './Button.jsx';
import styles from'./components-css/Header.module.css';


export default function Header({ userName, className, onLogout }) {
  return (
    <header className={className}>
      <div className={styles.headerContent}>
        <h2 className={styles.welcomeMessage}>
          Welcome, <span className={styles.username}>{userName}</span>
        </h2>

        <Button onClick={onLogout} className={styles.logoutBtn}>
          Logout
        </Button>
      </div>
    </header>
  );
}
