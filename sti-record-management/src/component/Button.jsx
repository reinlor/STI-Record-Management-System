import { useNavigate } from "react-router-dom";

export default function Button({ 
    to = '',
    onClick = null,
    className = '',
    type = 'button',
    children
    }){

    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
        else if (to) {
            navigate(to);
        }
    }

    return(
        <button
            type={type}
            onClick={handleClick}
            className={`btn ${className}`}
        >
            
            {children}
        </button>
    );
}