// ********************
// charts here using chart.js (not currently in use)
// ********************

function drawSummaryCharts(){
	var ctx = document.getElementById('summaryTempChart').getContext('2d');
	var chart = new Chart(ctx, {
    
	// The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: 
	{
        labels: obsSummary['TIMESTAMP'],
	
		datasets: [{
			label: 'Min',
            backgroundColor: cssvar('--temp-min-colour'),
			fill: false,
			pointRadius: 1,
            borderColor: cssvar('--temp-min-colour'),
			data: obsSummary['TEMP_LOW'],
        },
		{
            label: 'Ave',
			pointRadius: 0,
            backgroundColor: cssvar('--temp-min-colour'),
			fill: "-1",
            borderColor: cssvar('--temp-colour'),
			data: obsSummary['TEMP'],
        },
		{
            label: 'Max',
            backgroundColor: cssvar('--temp-max-colour'),
			fill: "-1",
			pointRadius: 1,
            borderColor: cssvar('--temp-max-colour'),
			data: obsSummary['TEMP_HIGH'],
        }]
    },

    // Configuration options go here
    options: {
		tooltips: {
			mode: 'index',
			intersect: false,
			displayColors: false,
		},
		legend:{
			display:false},
		scales: {
            xAxes: [{
                ticks: {
					display: false //this will remove only the label
				},
				gridLines: {
					drawOnChartArea: false
				}
            }],
			yAxes: [{
                gridLines: {
					drawOnChartArea: false
				}
            }]
        }
	}
	});	
}

function drawTodayCharts(){
	var ctx = document.getElementById('todayTempChart').getContext('2d');
	var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: 
	{
        labels: fifteenMinuteEpoch,		
		
		datasets: [{
            label: 'Temp',
			pointRadius: 1,
            backgroundColor: cssvar('--temp-colour'),
			fill: false,
            borderColor: cssvar('--temp-colour'),
			data: fifteenMinuteTemp,
		}]
    },

    // Configuration options go here
    options: {
		tooltips: {
			mode: 'index',
			intersect: false,
			displayColors: false,
		},
		legend:{
			display:false},
		scales: {
            xAxes: [{
                ticks: {
                    display: false //this will remove only the label
                },
				gridLines: {
					drawOnChartArea: false
				}
				}],
			yAxes: [{
                gridLines: {
					drawOnChartArea: false
				}
            }]
        }
	}
	});	
}