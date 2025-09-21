function Card({ name,
    description, ranks, 
    }) {
    function cardColor() {
        const rank = ranks;

        if (rank === "addNew") {
            return "hsl(51, 83%, 65%)"
        }
        else {
            return "white"
        }
    }

    const styles = {
        border: "1px solid hsl(0, 0%, 80%)",
        borderRadius: "10px",
        boxShadow: "5px 5px 5px hsla(0, 0%, 0%, 0.1)",
        padding: "20px",
        margin: "10px",
        textAlign: "center",
        minHeight: "200px",
        minWidth: "400px",
        display: "inline-block",
        backgroundColor: cardColor()
    };

    return (<>
        <div className="card" style={styles}>
            <h2 className="card-title">{name}</h2>
            <p className="card-text">{description}</p>
        </div>
    </>
    );
}

export default Card;