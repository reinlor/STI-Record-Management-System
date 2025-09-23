import { Bar } from "react-chartjs-2";

function WellnessSummary({onBack}){

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
    };

    return(
        <div>
            <button onClick={onBack}>{'<'}</button>
            <Bar 
                data={{
                    labels: ['1st Question', '2nd Question', '3rd Question', '4th Question', '5th Question', '6th Question', '7th Question', '8th Question'],
                    datasets: [{
                        label: "Revenue",
                        data: [100, 200, 100, 200,100, 200,100, 200]
                    },{
                        label: "Loss",
                        data: [122, 31, 31, 41, 52, 32, 78, 21]
                    }]
                }}
                options={chartOptions}/>

            
        </div>
    )
}

export default WellnessSummary