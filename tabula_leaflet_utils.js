
require('leaflet');

var MapRenderer = function(){

	this.circleOptions = {
		radius : 4,
		color : '#000',
		weight : 1,
		fillOpacity : 0
	}

	this.hover_style = {
		weight : 1,
		opacity : 1,
		color : '#FFFF00',
		fillColor : '#FFFF00',
		fillOpacity : 0.5
	}

	this.selected_style = {
		weight : 1,
		opacity : 1,
		color : '#FF00FF',
		fillColor : '#FF00FF',
		fillOpacity : 0.5
	}

	this.unselected_style = {
		weight : 1,
		opacity : 1,
		color : '#000000',
		fillColor : '#AAAAAA',
		fillOpacity : 0.5
	}
}

MapRenderer.prototype.renderAsCircles = function(params)
{
	var _this = this;
	var map = params.map;
	var json = params.json;
	var layer = L.geoJson(json, {
		pointToLayer : function(feature, latlng){
			return L.circleMarker(latlng, _this.circleOptions)
		},
		onEachFeature : function(feature, layer)
		{
			layer.on({
				mouseover : function(e)
				{
					if(params.mouseover)
						params.mouseover(e);
				},
				mouseout : function(e)
				{
					if(params.mouseout)
						params.mouseout(e);
				},
				click : function(e)
				{
					if(params.click)
						params.click(e);
				}
			})
		}
	});
	layer.addTo(map);
	return layer;
}

MapRenderer.prototype.renderPolygon = function(params)
{
	var _this = this;
	var map = params.map;
	var json = params.json;
	var layer = L.geoJson(json, {
		onEachFeature : function(feature, layer)
		{
			layer.on({
				mouseover : function(e)
				{
					if(params.mouseover)
						params.mouseover(e);
				},
				mouseout : function(e)
				{
					if(params.mouseout)
						params.mouseout(e);
				},
				click : function(e)
				{
					if(params.click)
						params.click(e);
				}
			})
		},
		style : _this.unselected_style
	});
	layer.addTo(map);
	return layer;
}

MapRenderer.prototype.updateStyleByProperties = function(params)
{
	var _this = this;
	var layer = params.layer;
	var update_func = params.update_func;

	for (each in layer._layers) {
		var l = layer._layers[each];
		var properties = l.feature.properties;
		var style = update_func(properties) 
		l.setStyle(style);
	}
}

MapRenderer.prototype.updateFeatureProperties = function(params)
{
	var _this = this;
	var layer = params.layer;
	var properties_map = params.properties_map;

	for (each in layer._layers) {
		var l = layer._layers[each];
		var index_value = l.feature.properties[params.index];
		if(index_value)
		{
			var new_values = properties_map[index_value];
			if(new_values)
			{
				for(new_val in new_values)	
				{
					l.feature.properties[new_val] = new_values[new_val];
				}
			}
			
		} 
	}
}

MapRenderer.prototype.getLayerPropertyList = function(params)
{
	var _this = this;
	var layer = params.layer;
	var prop = params.property;

	var list = [];

	for (each in layer._layers) {
		var l = layer._layers[each];
		var properties = l.feature.properties;
		if(properties[prop])
			list.push(properties[prop])
	}

	return list;
}


MapRenderer.prototype.addPropertiesInfoControl = function(params)
{
	var _this = this;
	var map = params.map;
	var labels = params.labels;
	var info = L.control();
	info.onAdd = function (map) {
	    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
	    this.update();
	    return this._div;
	};

	info.update = function (props) {
		if(props)
		{
			this._div.innerHTML = '<h4>' + (params.title ? params.title : 'Properites:') + '</h4>';
		    
			for(each in props)
		    {
		    	if(labels != undefined)
		    	{
		    		if(labels.indexOf(each) != -1)
						this._div.innerHTML += "<b>" + each + ": </b>" + props[each] + "<br>"
		    	}
		    	else
		    	{
		    		this._div.innerHTML += "<b>" + each + ": </b>" + props[each] + "<br>";	
		    	}
		    	
		    }			     	
		}
		else
		{
			this._div.innerHTML = null;
		}
	    
	};
	info.addTo(map);
	return info;
}

MapRenderer.prototype.addLegend = function(params)
{
	var _this = this;
	var map = params.map;

	var legend = L.control({position: 'bottomright'});
	legend.onAdd = function (map) {
	    this._div = L.DomUtil.create('div', 'info legend');
	    return this._div;
	}

	legend.update = function(params)
	{
		if(params)
		{
			var title = params.title;
		    var values = params.values;
		    var scale = params.scale;

		    this._div.innerHTML = '<h4>'+ title+'</h4>';
		    for (var i = 0; i < values.length; i++) {
		        this._div.innerHTML +=
		            '<i style="background:' + scale(values[i]) + '"></i> ≥ ' +
		           Math.floor(values[i]) + '<br>';
		    }	
		}
		else
		{
			this._div.innerHTML = null;
		}
	}
	legend.addTo(map);
	return legend;
}

MapRenderer.prototype.zoomLayerExtend = function(params)
{
	var map = params.map;
	var layer = params.layer;
	map.fitBounds(layer.getBounds());	
}

module.exports = {
	MapRenderer : MapRenderer
}
