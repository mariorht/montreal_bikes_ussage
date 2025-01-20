d3.json("/montreal_bikes_ussage/data/chart_data_HTM.json", function(data) {
    graphData = data;
    var graphData2;
    d3.json("/montreal_bikes_ussage/data/chart_data2_HTM.json", function(data) {
        graphData2 = data;


var baseLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    maxZoom: 18,
})

var estaciones_origen = {
    max : 1.5,
    data: []
};

var estaciones_destino = {
    max : 1.5,
    data: []
};

for (var i = 0; i < graphData.length; i++) {
    estaciones_origen.data[i] = {lat : graphData[i].latitude, lng : graphData[i].longitude, value:graphData[i].Origen}
    estaciones_destino.data[i] = {lat : graphData[i].latitude, lng : graphData[i].longitude, value:graphData[i].Destino}
}

var cfg = {
    "radius": 0.0025,
    "maxOpacity": 0.7,
    "scaleRadius": true,
    "useLocalExtrema": false,
};

var heatmapLayer = new HeatmapOverlay(cfg);
heatmapLayer.setData(estaciones_origen);

var markerGroup = L.layerGroup();
for (var i = 0; i < graphData.length; i++) {
    var marker = L.marker([graphData[i].latitude, graphData[i].longitude]).addTo(markerGroup);
    marker.bindPopup(graphData[i].name + '<br>Usos como estación de origen: '+graphData[i].Origen +
                        '<br>Usos como estación de Destino: '+graphData[i].Destino);
}

function borrarMarcas()
{
    marcadores_chord.clearLayers()
}

var marcadores_chord = L.layerGroup();

var map = new L.Map('map', {
    center: new L.LatLng(45.5, -73.58),
    zoom: 11.5,
    layers: [baseLayer, marcadores_chord]
});

var overlays = {
    "Marcadores": markerGroup,
    "Heatmap": heatmapLayer
};

L.control.layers(null, overlays).addTo(map);


////////////////////////////////////////////////////////////////////////////////////////////////
///
/// CHORD
///
////////////////////////////////////////////////////////////////////////////////////////////////

matrix = []
n_chords_iniciales = 25;
for (var i = 0; i < n_chords_iniciales; i++) {
    matrix.push(Object.values(Object.values(graphData2)[i]))
}



var color = d3.scale.ordinal()
    .domain(d3.range(0,n_chords_iniciales))
    .range(['#f7fcf0','#e0f3db','#ccebc5','#a8ddb5','#7bccc4','#4eb3d3','#2b8cbe','#0868ac','#084081']);

var width = 600,
    height = 600,
    outerRadius = Math.min(width, height) / 2 - 10-50,
    innerRadius = outerRadius - 24;

var formatPercent = d3.format(".1%");

var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);



var layout = d3.layout.chord()
    .padding(.01)
    .sortSubgroups(d3.descending)
    .sortChords(d3.ascending);

var path = d3.svg.chord()
    .radius(innerRadius);

var svg = d3.select("div #chord").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("id", "circle")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

svg.append("circle")
    .attr("r", outerRadius)
    .style('opacity',0);


// Compute the chord layout.
layout.matrix(matrix);

// Add a group per neighborhood.
var group = svg.selectAll(".group")
    .data(layout.groups)
    .enter()
    .append("g")
    .attr("class", "group")
    .on("mouseover", mouseover);

group.append("text")
    .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
    .attr("dy", ".35em")
    .attr("transform", function(d) {
        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
        + "translate(" + (innerRadius + 36) + ")"
        + (d.angle > Math.PI ? "rotate(180)" : "");
    })
    .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
    .text(function(d,i) { return Object.keys(graphData2)[i]; } );



// Add the group arc.
var groupPath = group.append("path")
    .attr("id", function(d, i) { return "group" + i; })
    .attr("d", arc)
    .style("fill", function(d) {return color(d.index); });


// Add the chords.
var chord = svg.selectAll(".chord")
    .data(layout.chords)
    .enter().append("path")
    .attr("class", "chord")
    .style("fill", function(d) {return color(d.source.index); })
    .attr("d", path);


////////////////////////////////////////////////////////////////////////////////////////////
function update(num)
{
    matrix = []
    for (var i = 0; i < num; i++) {
        matrix.push(Object.values(Object.values(graphData2)[i]))
    }

    layout.matrix(matrix);

    //Nueva escala de color
    color.domain(d3.range(0,num));

    //exit
    svg.selectAll(".group")
        .data(layout.groups)
        .exit()
        .remove()

    // Update
    svg.selectAll(".group path")
        .data(layout.groups)
        .attr("id", function(d, i) { return "group" + i; })
        .transition()
        .duration(2000)
        .attr("d", arc)
        .style("fill", function(d) { return color(d.index); });

    svg.selectAll("text")
        .data(layout.groups)
        .transition()
        .duration(2000)
        .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr("dy", ".35em")
        .attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
            + "translate(" + (innerRadius + 36) + ")"
            + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .text(function(d,i) { return Object.keys(graphData2)[i]; } );

    //Enter
    var group = svg.selectAll(".group")
        .data(layout.groups)
        .enter().append("g")
        .attr("class", "group")
        .on("mouseover", mouseover);

    group.append("text")
        .data(layout.groups)
        .transition()
        .duration(2000)
        .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr("dy", ".35em")
        .attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
            + "translate(" + (innerRadius + 36) + ")"
            + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .text(function(d,i) { return Object.keys(graphData2)[i]; } );

    var groupPath = group.append("path")
        .attr("id", function(d, i) { return "group" + i; })
        .attr("d", arc)
        .style("fill", function(d) {return color(d.index); });

    /////////////////////////////////////////////////////////////////////////

    svg.selectAll(".chord")
        .data(0)
        .exit()
        .remove()

    // Add the chords.
    chord = svg.selectAll(".chord")
        .data(layout.chords)
        .enter()
        .append("path")
        .style("fill", function(d) {return color(d.source.index); })
        .attr("class", "chord")
        .attr("d", path);

    svg.selectAll(".chord")
    .style("opacity", 0)
    .transition()
    .duration(4000)
    .style("opacity", 1)

}

function mouseover(d, i) {
    chord.classed("fade", function(p) {
        return p.source.index != i && p.target.index != i;
    });

    var estacion = graphData.find(function(element) {
            return element.code == Object.keys(graphData2)[i];
        });

    map.removeLayer(markerGroup)

    var marker = L.circle([estacion.latitude, estacion.longitude], {
        color: 'blue',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 150
        }).addTo(marcadores_chord);

    marker.bindPopup(estacion.name + '<br>Usos como estación de origen: '+estacion.Origen +
                        '<br>Usos como estación de Destino: '+estacion.Destino);

}


/////////////////////////////////////////////////////////////////////////////////////
//SLIDER
var posX=100, posY=50, ancho=400;

var x = d3.scale.linear()
    .domain([2, 40])
    .range([posX, posX+ancho])
    .clamp(true);

var slider = d3.select("#chord")
    .append("svg")
    .attr("width", 800)
    .attr("height", 100)
    .append("g")
    .attr("class", "slider")

slider.append("line")
    .attr("class", "track")
    .attr("x1", posX)
    .attr("x2", posX + ancho)
    .attr ("y1", posY)
    .attr ("y2", posY)
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.behavior.drag()
    .on("drag", dragged)
    .on("dragend", dragended));


slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data(x.ticks(10))
    .enter().append("text")
    .attr("x", 0)
    .attr("text-anchor", "middle")


var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9)
    .attr("cy",posY)
    .attr("cx",x(n_chords_iniciales))

// texto
texto=slider.append('text')
    .attr('x', posX + 20)
    .attr('y', 20)
    .text('Número de estaciones: '+ n_chords_iniciales)


var idn_B;
function dragged(d) {
    var pos

    if (d3.event.x<x.range()[0])
        pos= x.range()[0]
    else if (d3.event.x>x.range()[1])
        pos= x.range()[1]
    else
        pos= d3.event.x
    d3.select(".handle")
        .attr("cx", pos);

    idn_B=(x.invert(pos)).toFixed(0);

    texto.text('Número de estaciones: '+ idn_B)

}

function dragended(d) {
    marcadores_chord.clearLayers()
    update(idn_B);
}

})
})
