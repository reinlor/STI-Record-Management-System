import WellnessCard from './WellnessCard.jsx'

function AddWellness(){
    const data = {
        survey1: "This is survey 1",
        survey2: "This is survey 1",
        survey3: "This is survey 1",
        survey4: "This is survey 1",
    }

    const entries = Object.entries(data);
    
    return(
        <div>
            <WellnessCard/>
        </div>
    )
}

export default AddWellness