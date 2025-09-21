function WellnessCardModal(display) {

    return (
        <div>
            <form>
                {/* Survey Name */}
                <label>Survey name:</label>
                <input type="text"/>

                {/* Description */}
                <label>Description:</label>
                <input type="text"/>

                {/* Buttons */}
                <button>Delete</button>
                <button>Release</button>
                <button>Modify</button>
            </form>
        </div>
    )
}

export default WellnessCardModal