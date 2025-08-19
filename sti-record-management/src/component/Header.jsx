import Button from './Button.jsx';
import styles from './components-css/Header.module.css';
import { useContext } from 'react';
import { AuthContext } from '../AuthProvider.jsx';


export default function Header({  className }) {
  const { authData, logout } = useContext(AuthContext);

  return (
    <header className={className}>
      <div className={styles.headerContent}>
        <h2 className={styles.welcomeMessage}>
          Welcome, <span className={styles.username}>{authData.displayName}</span>
        </h2>

        <Button onClick={() => {
          logout();
          }} 
          className={styles.logoutBtn}>
          Logout
        </Button>
      </div>
    </header>
  );
}
