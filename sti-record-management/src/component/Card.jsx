import styles from './components-css/Card.module.css';

export default function Card({ title, icon, children }) {
    return (
        <>
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>
                        {icon && <span className={styles.cardIcon}>{icon}</span>}
                        <span className={styles.cardTitle}>{title}</span>
                    </h3>
                </div>

                <div className={styles.cardContent}>
                    {children}
                </div>
            </div>
        </>
    );
}