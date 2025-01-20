d3.json("/montreal_bikes_ussage/data/chart_data_SH.json", function(data) {
    graphData = data;
    var graphData2;
    d3.json("/montreal_bikes_ussage/data/chart_data2_SH.json", function(data) {
        graphData2 = data;

// dataset: graphData
var data = [];
for (var i = 0; i < 24; i++) {
    for (var j = 0; j < 7; j++) {
        data[j+7*i] = {day: j +1, hour: i, value:graphData[i][j], mean_duration:graphData2[i][j]/60}
    }
}

var margin = { top: 50, right: 0, bottom: 100, left: 30 },
    width = 960 - margin.left - margin.right,
    height = 430 - margin.top - margin.bottom,
    padding_left = 90,
    padding_top = 60,
    gridSize = Math.floor((width - padding_left)/ 24),
    legendElementWidth = gridSize*2,
    buckets = 9,
    colors = ['#f7fcf0','#e0f3db','#ccebc5','#a8ddb5','#7bccc4','#4eb3d3','#2b8cbe','#0868ac','#084081'], // alternatively colorbrewer.YlGnBu[9]
    days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
    times = ["0h","1h", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "10h", "11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h", "19h", "20h", "21h", "22h", "23h"];

var svg = d3.selectAll("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

svg.append('text')
    .attr("class", 'nombre')
    .text("Número de usos")
    .attr("x", 30)
    .attr("y", 20)


var dayLabels = svg.selectAll(".dayLabel")
    .data(days)
    .enter().append("text")
    .attr("class", 'mono')
    .text(function (d) { return d; })
    .attr("x", padding_left)
    .attr("y", function (d, i) { return i * gridSize + padding_top; })
    .style("text-anchor", "end")
    .attr("transform", "translate(-6," + gridSize / 1.5 + ")");



var timeLabels = svg.selectAll(".timeLabel")
    .data(times)
    .enter().append("text")
    .text(function(d) { return d; })
    .attr("class", 'mono')
    .attr("x", function(d, i) { return i * gridSize + padding_left; })
    .attr("y", padding_top)
    .style("text-anchor", "middle")
    .attr("transform", "translate(" + gridSize / 2 + ", -6)");


// dominio de la escala de color
var limites = d3.extent(data, function (d) { return d.value; });
var step = (limites[1]-limites[0])/buckets;
dominio = d3.range(limites[0],limites[1],step)
var colorScale = d3.scaleLinear().domain(dominio).range(colors)


var cards = svg.selectAll(".hour")
              .data(data);

cards.append("title");

info = 'value';
cards.enter().append("rect")
    .attr("x", function(d) { return (d.hour ) * gridSize + padding_left; })
    .attr("y", function(d) { return (d.day - 1) * gridSize + padding_top; })
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("class", "hour bordered tooltip")
    .attr("width", gridSize)
    .attr("height", gridSize)
    .style("fill", function(d) { return colorScale(d.value); })
    .on('mouseover',
    // esto se ejecuta cuando pasamos el ratón por el punto
        function(d,i)
        {
            d3.select('.tooltiptext')
                .datum(d)
                .attr('x',function(d){return (d.hour) * gridSize + 10;})
                .attr('y',function(d){return (d.day - 1) * gridSize + padding_top; })
                .attr('visibility', 'visible')
                .text(function(d){
                    if(info == 'value') return d[info] + ' viajes';
                    else return d[info].toFixed(1) + ' minutos';
                })

            d3.select('.tooltiprect')
                .datum(d)
                .attr('x',function(d){return (d.hour) * gridSize;})
                .attr('y',function(d){return (d.day - 1) * gridSize + padding_top - 20; })
                .attr('visibility', 'visible')
        })
    .on("mouseout",
        function(d,i)
        {
            d3.select('.tooltiptext')
                .datum(d)
                .attr('visibility', 'hidden')

            d3.select('.tooltiprect')
                .datum(d)
                .attr('visibility', 'hidden')
        })

cards.select("title").text(function(d) { return d.value; });

cards.exit().remove();



var legend = svg.selectAll(".legend")
    .data(colors);

legend.enter().append("rect")
    .attr("class", "legend")
    .attr("x", function(d, i) { return legendElementWidth * i + padding_left; })
    .attr("y", height + padding_top)
    .attr("width", legendElementWidth)
    .attr("height", gridSize / 2)
    .style("fill", function(d, i) { return colors[i]; });

svg.selectAll(".textoLeyenda").data(dominio)
    .enter()
    .append("text")
    .attr("class", "mono textoLeyenda")
    .text(function(d) { return "≥ " + d.toFixed(1); })
    .attr("x", function(d, i) { return legendElementWidth * i + legendElementWidth/8 + padding_left;})
    .attr("y", height + gridSize + padding_top);

legend.exit().remove();

 // Etiqueta con información de los puntos (tooltip)
var etiqueta= svg.append('g')
    .attr('class','tooltip')

etiqueta.append('rect')
    .attr('class', 'tooltiprect')
    .attr('fill', '#222')
    .attr('rx', '7')
    .attr('ry', '7')
    .attr("width", 100)
    .attr("height", 30)
    .attr('visibility', 'hidden');

etiqueta.append('text')
    .attr('class', 'tooltiptext')
    .attr('fill','#EEE')
    .attr('visibility', 'hidden');


// Botón seleccionar duración media o número de viajes

selector = d3.select('#chart')
    .append('select')
    .on('change',function(d){
    	if (selector.property('selectedIndex') == 0){
            info = 'value';
            update_graph('value');
        }
        else {
            info = 'mean_duration';
            update_graph('mean_duration');
        }
    })

// añadimos las opciones (nombres de las variables) al comboX
selector_opt = selector.selectAll('option')
    .data(['Número de viajes', 'Duración media'])
    .enter()
    .append('option')
    .text(function(d){return d})


function update_graph(variable)
{
    // Actualizar la escala de color
    var limites = d3.extent(data, function (d) { return d[variable]; });
    var step = (limites[1]-limites[0])/buckets;
    dominio = d3.range(limites[0],limites[1],step)

    var colorScale = d3.scaleLinear().domain(dominio).range(colors)

    // Actualizar colores
    svg.selectAll(".hour")
        .data(data)
        .transition()
        .duration(1000)
        .style("fill", function(d) {return colorScale(d[variable]); })

    // Actualizar leyenda
    svg.selectAll(".textoLeyenda")
        .data(dominio)
        .text(function(d) { return "≥ " + d.toFixed(1);; })

    svg.selectAll('.nombre')
        .text(function(){if (variable=='value') return "Número de usos";
                         else return "Duración media del trayecto en minutos"})

}
})
})
