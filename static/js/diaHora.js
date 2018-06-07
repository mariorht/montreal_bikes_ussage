d3.json("/data/chart_data_DH.json", function(data) {
    graphData = data;
    var graphData2;
    d3.json("/data/chart_data2_DH.json", function(data) {
        graphData2 = data;

// dataset: graphData
var data = [];
for (var i = 0; i < 24; i++) {
    for (var j = 0; j < 100; j++) {
        data[j+100*i] = {day: j +1, hour: i, value:graphData[i][j+105], mean_duration:graphData2[i][j+105]/60}
    }
}

var margin = { top: 0, right: 0, bottom: 0, left: 0 },
    width = 900 ,
    height = 800,
    padding_left = 10,
    padding_top = 60,
    gridSize = 40,
    legendElementWidth = gridSize*2,
    buckets = 9,
    mul_rad = 1,
    colors = ['#f7fcf0','#e0f3db','#ccebc5','#a8ddb5','#7bccc4','#4eb3d3','#2b8cbe','#0868ac','#084081']; // alternatively colorbrewer.YlGnBu[9]

var zoom = d3.zoom()
    .scaleExtent([0.3, 32])
    .on("zoom", zoomed);

var svg = d3.selectAll("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .call(zoom)



// dominio de la escala de color
var limites = d3.extent(data, function (d) { return d.value; });
var step = (limites[1]-limites[0])/buckets;
dominio = d3.range(limites[0],limites[1],step)

var colorScale = d3.scaleLinear().domain(dominio).range(colors)


var escala = d3.scaleLinear().domain([0,1]).range([0,  25])
var escala_x = escala, escala_y = escala;

var cards = svg.selectAll(".hour")
    .data(data);

cards.append("title");



info = 'value';
cards.enter().append("circle")
    .attr("cx", function(d) { rad = day2week(d.day); ang=((day2weekday(d.day,104)-1) * 360/7 +(d.hour) * 360/7/24) * Math.PI /180;
        return escala(polar2cartesiano(rad, ang)[0]); })
    .attr("cy", function(d) { rad = day2week(d.day); ang=((day2weekday(d.day,104)-1) * 360/7 +(d.hour) * 360/7/24) * Math.PI /180;
            return escala(polar2cartesiano(rad, ang)[1]); })
    .attr("transform", "translate(" + width/2 + "," + height/2 +")")
    .attr("r", function(d) { if(d.value/200>3) return d.value/200; return 3;})
    .attr('opacity',0.9)
    .attr("class", "hour bordered tooltip")
    .style("fill", function(d) { return colorScale(d.value); })
    .on('mouseover',
        // esto se ejecuta cuando pasamos el ratón por el punto
        function(d,i)
        {
            d3.select(this)
            .attr('stroke', 'black')

            d3.select('.tooltiptext')
            .datum(d)
            .attr("x", function(d) { rad = day2week(d.day); ang=((day2weekday(d.day,104)-1) * 360/7 +(d.hour) * 360/7/24) * Math.PI /180;
                return escala_x(polar2cartesiano(rad, ang)[0])-100;
             })
            .attr("y", function(d) { rad = day2week(d.day); ang=((day2weekday(d.day,104)-1) * 360/7 +(d.hour) * 360/7/24) * Math.PI /180;
                return escala_y(polar2cartesiano(rad, ang)[1]);
             })
            .attr("transform", "translate(" + width/2 + "," + (height/2-30) +")")
            .attr('visibility', 'visible')
            .text(function(d){
                if(info == 'value') return d[info] + ' viajes. Día: ' + dayYear2Date(d.day, d.hour, 104) + 'h';
                else return d[info].toFixed(1) + ' minutos. Día: ' + dayYear2Date(d.day, d.hour, 104) + 'h';
            })

            d3.select('.tooltiprect')
            .datum(d)
            .attr("x", function(d) { rad = day2week(d.day); ang=((day2weekday(d.day,104)-1) * 360/7 +(d.hour) * 360/7/24) * Math.PI /180;
                return escala_x(polar2cartesiano(rad, ang)[0])-100; })
                .attr("y", function(d) { rad = day2week(d.day); ang=((day2weekday(d.day,104)-1) * 360/7 +(d.hour) * 360/7/24) * Math.PI /180;
                    return escala_y(polar2cartesiano(rad, ang)[1]); })
                    .attr("transform", "translate(" + (width/2 -10) + "," + (height/2 -50) +")")
                    .attr('visibility', 'visible')
        })
    .on("mouseout",
    function(d,i)
    {
        d3.select(this)
        .attr('stroke', 'none')
        d3.select('.tooltiptext')
        .attr('visibility', 'hidden')

        d3.select('.tooltiprect')
        .attr('visibility', 'hidden')
    })


//Líneas
lineas = svg.selectAll('.lineas')
   .data(d3.range(7).map(function(i){return (-1+i*360/7) * Math.PI /180;}))
   .enter()
   .append("line")
   .attr("class", "axis")
   .attr("x1", 0)
   .attr("y1", 0)
   .attr("x2", function(d){ return escala(polar2cartesiano(15.5, d)[0])})
   .attr("y2", function(d){ return escala(polar2cartesiano(15.5, d)[1])})
   .attr("transform", "translate(" + width/2 + "," + height/2 +")")
   .attr("class", "axis")
   .style("stroke", "grey")
   .style("stroke-width", "2px")
   .style("stroke-opacity",'0.3')

// nombres
nombres=svg.selectAll('nombres')
    .data(["Lunes","Martes","Miercoles","Jueves","Viernes","Sábado","Domingo"])

nombres.enter()
    .append("text")
    .attr("class", "legend")
    .style("font-size", "18px")
    .style("fill","black")
    .style("font-weight","bold")
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .attr("x", function(d,i){ if(i==6)rad = 17;else rad=16;
                              ang = (360/14 + i * 360/7) * Math.PI/180 ;
                              return escala(polar2cartesiano(rad, ang)[0])
                          })
    .attr("y", function(d,i){ if(i==6)rad = 17;else rad=16;
                              ang = (360/14 + i * 360/7) * Math.PI/180 ;
                              return escala(polar2cartesiano(rad, ang)[1])
                          })
    .attr("transform", function(d,i){return "translate(" + width/2 + "," + height/2 +")"})
    .text(function(d){return d;})



var svg2 = d3.selectAll("#chart")
    .append("svg")
    .attr("width",1000)
    .attr("height", 100)

var legend = svg2.selectAll(".legend").data(colors);

legend.enter().append("rect")
    .attr("class", "legend")
    .attr("x", function(d, i) { return legendElementWidth * i  })
    .attr("y", 30)
    .attr("width", legendElementWidth)
    .attr("height", gridSize / 2)
    .style("fill", function(d, i) { return colors[i]; });

svg2.selectAll(".textoLeyenda").data(dominio)
    .enter()
    .append("text")
    .attr("class", "mono textoLeyenda")
    .text(function(d) { return "≥ " + d.toFixed(1); })
    .attr("x", function(d, i) { return legendElementWidth * i + legendElementWidth/8})
    .attr("y", 70);

legend.exit().remove();


 // Etiqueta con información de los puntos (tooltip)
var etiqueta= svg.append('g')
    .attr('class','tooltip')

etiqueta.append('rect')
    .attr('class', 'tooltiprect')
    .attr('fill', '#222')
    .attr('rx', '7')
    .attr('ry', '7')
    .attr("width", 270)
    .attr("height", 30)
    .attr('visibility', 'hidden');

etiqueta.append('text')
    .attr('class', 'tooltiptext')
    .attr('fill','#EEE')
    .attr('visibility', 'hidden');


// Botón seleccionar duración media o número de viajes
selector = d3.select('#chart')
	.append('select')
	.on('change',function(d)
    {
		if (selector.property('selectedIndex') == 0){
	        info = 'value'; update_graph('value')}
        else {
            info = 'mean_duration' ;update_graph('mean_duration');
        }
	})

// añadimos las opciones (nombres de las variables) al comboX
selector_opt = selector
	.selectAll('option').data(['Número de viajes', 'Duración media'])
	.enter()
	.append('option')
	.text(function(d){return d})

//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
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
        .attr("r", function(d) {if (variable == 'value')
                                {
                                    if(d[variable]/200>3)
                                        return d[variable]/200;
                                    return 3;
                                }
                                if(d[variable]*d[variable]/33>3)
                                    return d[variable]*d[variable]/33;
                                return 3;})
        .style("fill", function(d) {return colorScale(d[variable]); })


    // Actualizar leyenda
    svg2.selectAll(".textoLeyenda")
        .data(dominio)
        .text(function(d) { return "≥ " + d.toFixed(1); })

    svg.selectAll('.nombre')
        .text(function(){if (variable=='value')
                            return "Número de usos";
                        else
                            return "Duración media del trayecto en minutos"})
}
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
function polar2cartesiano(radio, angulo)
{
    var x = (radio) * Math.cos(angulo);
    var y = (radio) * Math.sin(angulo);
    return [x,y];
}

//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
function zoomed()
{
	escala_x = d3.event.transform.rescaleX(escala)
    escala_y = d3.event.transform.rescaleY(escala)
// actualizamos la gráfica con las escalas nuevas
	update(escala_x, escala_y);
}
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
function update(escalaX, escalaY)
{
	svg.selectAll('circle')
    	.data(data)	// vinculamos los datos a la selección de círculos
        .attr("cx", function(d) { rad = day2week(d.day);
                                  ang=((day2weekday(d.day,104)-1) * 360/7 +(d.hour) * 360/7/24) * Math.PI /180;
                                  return escalaX(polar2cartesiano(rad, ang)[0]); })
        .attr("cy", function(d) { rad = day2week(d.day);
                                  ang=((day2weekday(d.day,104)-1) * 360/7 +(d.hour) * 360/7/24) * Math.PI /180;
                                  return escalaY(polar2cartesiano(rad, ang)[1]); })

    svg.selectAll('line')
       .data(d3.range(7).map(function(i){return (-1+i*360/7) * Math.PI /180;}))
       .attr("x1", escalaX(0))
       .attr("y1", escalaY(0))
       .attr("x2", function(d){ return escalaX(polar2cartesiano(15.5, d)[0])})
       .attr("y2", function(d){ return escalaY(polar2cartesiano(15.5, d)[1])})


    svg.selectAll('text')
       .data(["Lunes","Martes","Miercoles","Jueves","Viernes","Sabado","Domingo"])
       .attr("x", function(d,i){ if(i==6)rad = 17;else rad=16;
                                 ang = (360/14 + i * 360/7) * Math.PI/180 ;
                                 return escalaX(polar2cartesiano(rad, ang)[0])})
       .attr("y", function(d,i){ if(i==6)rad = 17;else rad=16;
                                 ang = (360/14 + i * 360/7) * Math.PI/180 ;
                                 return escalaY(polar2cartesiano(rad, ang)[1])})

}
////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
function dayYear2Date(day,hour,offset)
{
    return d3.timeFormat("%a %d/%m/%Y %H")(d3.timeParse("%j %Y %H")('' +(offset+day)+' 2017 '+ hour));
}
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
function day2week(day)
{
    return d3.timeFormat("%V")(d3.timeParse("%j")(day))
}
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
function day2weekday(day,offset)
{
    return d3.timeFormat("%u")(d3.timeParse("%j %Y")((day+offset)+ ' 2017'))
}

//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
});
});
