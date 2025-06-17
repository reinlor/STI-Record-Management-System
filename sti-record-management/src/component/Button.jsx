import { useNavigate } from "react-router-dom";

function Button({ 
    nav = '',
    classname = ''
    }){
    const navigate = useNavigate();

    return(
        <button
            className={classname}
            onClick={() => {
                navigate(nav);
            }}>
            Go to {nav}
        </button>
    )
}

export default Button;