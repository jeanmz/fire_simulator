// https://stackoverflow.com/questions/48719873/how-to-get-median-and-quartiles-percentiles-of-an-array-in-javascript-or-php
// sort array ascending
const asc = arr => arr.sort((a, b) => a - b);

const sum = arr => arr.reduce((a, b) => a + b, 0);

const mean = arr => sum(arr) / arr.length;

// sample standard deviation
const std = (arr) => {
    const mu = mean(arr);
    const diffArr = arr.map(a => (a - mu) ** 2);
    return Math.sqrt(sum(diffArr) / (arr.length - 1));
};

const quantile = (arr, q) => {
    const sorted = asc(arr);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
};

function numberWithCommas(x) {
    return x.toLocaleString("en-US");
}


var the_data = $.csv.toObjects(RETURNS_DATA);

var max_elements = the_data.length - 1;

var STOCK_MAX = 0.4;
var INFLATION_MAX = 0.15;
var BOND_MAX = 0.1;
var INFLATION_MIN = 0.005;


stocks_full = Array.from(the_data, x => x.return_sp500);
bonds_full = Array.from(the_data, x => x.return_treasury);
inf_full = Array.from(the_data, x => x.inflation);

// stocks

var trace = {
    x: stocks_full,
    type: 'histogram',
    nbins: 50,
    histnorm: 'percent',
    marker: {color: 'rgb(50,50,50)'}
  };
var data = [trace];

var layout = {
  bargap: 0.01, 
  barmode: "overlay", 
  title: "Stocks Returns", 
  xaxis: {title: "Return (%)"}, 
  yaxis: {title: "Pct. of Years"}
};
Plotly.newPlot('stock_dist', data,layout);

// bonds

var trace = {
    x: bonds_full,
    type: 'histogram',
    nbins: 50,
    histnorm: 'percent',
    marker: {color: 'rgb(100,100,100)'}
  };
var data = [trace];

var layout = {
  bargap: 0.01, 
  barmode: "overlay", 
  title: "Bonds Returns", 
  xaxis: {title: "Return (%)"}, 
  yaxis: {title: "Pct. of Years"},
};
Plotly.newPlot('bonds_dist', data,layout);

// inflation

var trace = {
    x: inf_full,
    type: 'histogram',
    nbins: 50,
    histnorm: 'percent',
    marker: {color: 'rgb(150,150,150)'}
  };
var data = [trace];

var layout = {
  bargap: 0.01, 
  barmode: "overlay", 
  title: "Inflation Rates", 
  xaxis: {title: "Rate (%)"}, 
  yaxis: {title: "Pct. of Years"},
};
Plotly.newPlot('inf_dist', data,layout);

function run_sim() {

    var num_runs = 50000;
    // var num_runs = 1;
    var total = document.getElementById("starting").value * 1.0;
    var annual = document.getElementById("annual").value * 1.0;
    var pct_bonds = document.getElementById("pct_bonds").value / 100.0;
    // var age = document.getElementById("age").value * 1.0;
    var retire_amount = document.getElementById("retire_amount").value * 1.0;
    console.log(`num_runs: ${num_runs}`);
    console.log(`total: ${total}`);
    console.log(`annual: ${annual}`);
    console.log(`pct_bonds: ${pct_bonds}`);
    // console.log(`age: ${age}`);
    console.log(`retire_amount: ${retire_amount}`);

    var stock_value = total * (1 - pct_bonds);
    var stock_value_inflation = stock_value;
    var bond_value = total * pct_bonds;
    var bond_value_inflation = bond_value;

    var total_inflation = total;

    console.log(`total stock: ${stock_value}`);
    console.log(`total bonds: ${bond_value}`);

    const total_values = [];
    const total_values_inflation = [];

    for (run = 0; run < num_runs; run++){

        i = 0;
        while (i <= 99 && total < retire_amount) {

            random_year = Math.floor(Math.random() * (max_elements - 0 + 1) + 0);

            stock_return = the_data[random_year].return_sp500 / 100.0;
            bond_return =  the_data[random_year].return_treasury / 100.0;
            inflation =  the_data[random_year].inflation / 100.0;

            if (stock_return > STOCK_MAX)
                stock_return = STOCK_MAX;
            if (bond_return > BOND_MAX)
                bond_return = BOND_MAX;
            if (inflation < INFLATION_MIN)
                inflation = INFLATION_MIN;
            if (inflation > INFLATION_MAX)
                inflation = INFLATION_MAX;


            stock_value = stock_value * (1 + stock_return);
            stock_value_inflation = stock_value_inflation * (1 + stock_return) * (1 - inflation);

            bond_value = bond_value * (1 + bond_return);
            bond_value_inflation = bond_value_inflation * (1 + bond_return) * (1 - inflation);

            total = stock_value + bond_value + annual;
            total_inflation = stock_value_inflation + bond_value_inflation + annual * (1 - inflation);

            stock_value = total * (1 - pct_bonds);
            bond_value = total * pct_bonds;

            stock_value_inflation = total_inflation * (1 - pct_bonds);
            bond_value_inflation = total_inflation * pct_bonds;       

            i++;

            // console.log(`i: ${i} ; inflation: ${inflation} ; total_inflation: ${total_inflation} ; total: ${total}`);
            // console.log(`total: ${total}`);                          

        }

        total_values.push(i);

        total = document.getElementById("starting").value * 1.0;
        stock_value = total * (1 - pct_bonds);
        bond_value = total * pct_bonds;
        stock_value_inflation = stock_value;
        bond_value_inflation = bond_value;
        total_inflation = total;

    }

    total_values_min = Math.min(...total_values);
    total_values_p25 = quantile(total_values, 0.25);
    total_values_p50 = quantile(total_values, 0.5);
    total_values_p75 = quantile(total_values, 0.75);
    total_values_max = Math.max(...total_values);

    console.log(`median: ${total_values_p50}`);

    html_results = '<h1 align="center">Results</h1><table align="center">';
    html_results += `<tr><td>Min:</td><td>${numberWithCommas(Math.round(total_values_min))}</td></tr>`;
    html_results += `<tr><td>P25:</td><td>${numberWithCommas(Math.round(total_values_p25))}</td></tr>`;
    html_results += `<tr><td>Median:</td><td>${numberWithCommas(Math.round(total_values_p50))}</td></tr>`;
    html_results += `<tr><td>P75:</td><td>${numberWithCommas(Math.round(total_values_p75))}</td></tr>`;
    html_results += `<tr><td>Max:</td><td>${numberWithCommas(Math.round(total_values_max))}</td></tr>`;
    html_results += '</table>'

    var node = document.getElementById('total');
    node.innerHTML = html_results;



    var trace = {
        x: total_values,
        type: 'histogram',
        // cumulative: {enabled: true},
        nbins: 100,
        histnorm: 'percent',
      };
    var data = [trace];

    var layout = {
      bargap: 0.01, 
      barmode: "overlay", 
      //title: "Total Returns", 
      xaxis: {title: "Years to Target"}, 
      yaxis: {title: "Pct. of Simulations"},
      margin:{t: 50},
    };
    Plotly.newPlot('total_div', data,layout);

    var trace = {
        x: total_values,
        type: 'histogram',
        cumulative: {enabled: true},
        nbins: 100,
        histnorm: 'percent',
      };
    var data = [trace];

    var layout = {
      bargap: 0.01, 
      barmode: "overlay", 
      title: "Cumulative", 
      xaxis: {title: "Years to Target"}, 
      yaxis: {title: "Cumulative Pct. of Simulations"},
      margin:{t: 50},
    };
    Plotly.newPlot('total_div_cumu', data,layout);  




}
