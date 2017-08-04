
require('leaflet');

var MapRenderer = function(params){

	this.circleOptions = params.circleOptions ? params.circleOptions : {
		radius : 4,
		color : '#000',
		weight : 1,
		fillOpacity : 0
	}

	this.hover_style = params.hover_style ? params.hover_style : {
		weight : 1,
		opacity : 1,
		color : '#FFFF00',
		fillColor : '#FFFF00',
		fillOpacity : 0.5
	}

	this.selected_style = params.selected_style ? params.selected_style :  {
		weight : 1,
		opacity : 1,
		color : '#FF00FF',
		fillColor : '#FF00FF',
		fillOpacity : 0.5
	}

	this.unselected_style = params.unselected_style ? params.unselected_style :  {
		weight : 1,
		opacity : 1,
		color : '#000000',
		fillColor : '#AAAAAA',
		fillOpacity : 0.5
	}
	//
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
			if(params.onEachFeature)
				params.onEachFeature(feature, layer);
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
	var info = L.control({position: params.position ? params.position : 'topright'});
	info.onAdd = function (map) {
	    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
	    this.update();
	    return this._div;
	};

	info.update = function (props) {
		if(props)
		{
			this._div.innerHTML = '<h4>' + (params.title ? params.title : 'Properties:') + '</h4>';
		    
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

MapRenderer.prototype.addSimpleControl = function(params)
{
	var _this = this;
	var map = params.map;
	var info = L.control({position: params.position ? params.position : 'topright'});
	info.onAdd = function (map) {
	    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
	    if(params.onAdd)
	    {
	    	params.onAdd();
	    }
	    return this._div;
	};

	info.onRemove = function(map){
		if(params.onRemove)
	    {
	    	params.onRemove();
	    }
	}

	info.update = function (params) {
		if(params)
		{
			this._div.innerHTML = '<h4>' + params.title + '</h4>';
		    this._div.innerHTML += params.content;
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

	var legend = L.control({position: params.position ? params.position : 'bottomright'});
	legend.onAdd = function (map) {
	    this._div = L.DomUtil.create('div', 'info legend');
	    return this._div;
	}

	legend.update = function(params)
	{
		if(params)
		{
		    var values = params.values;
		    var scale = params.scale;
		    var title = params.title;

		    if(params.scale)
		    {
		    	if(params.header_tooltip)
		    	{
		    		this._div.innerHTML = '<div class="leaflet_utils_legend_tooltip"><h4>' + title + '</h4><div class="tooltiptext">' + params.header_tooltip + '</div></div><br>'
		    	}
		    	else
		    	{
		    		this._div.innerHTML = '<h4>'+ title+'</h4>';	
		    	}
			    for (var i = 0; i < values.length; i++) {
			        this._div.innerHTML +=
			            '<i style="background:' + scale(values[i]) + '"></i> ≥ ' +
			           Math.floor(values[i]) + '<br>';
			    }	
		    }
		    else if(params.legend_pair)
		    {
		    	if(params.header_tooltip)
		    	{
					this._div.innerHTML = '<div class="leaflet_utils_legend_tooltip"><h4>' + title + '</h4><div class="tooltiptext">' + params.header_tooltip + '</div></div><br>'
		    	}
		    	else
		    	{
		    		this._div.innerHTML = '<h4>'+ title+'</h4>';	
		    	}
			    for (var i = 0; i < params.legend_pair.color.length; i++) {
			        this._div.innerHTML +=
			            '<i style="background:' + params.legend_pair.color[i] + '"></i>' +
			           params.legend_pair.text[i] + '<br>';
			    }	

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

MapRenderer.prototype.renderLayerFeatureNames = function(params)
{
	var map = params.map;
	var layer = params.layer;
	var name = params.prop_name;
	var class_name = params.class_name;
	var markers = {};

	for (each in layer._layers) {
		var l = layer._layers[each];
		var prop = l.feature.properties[name];
		var bounds = l.getBounds();
		var lat = bounds._northEast.lat + ((bounds._southWest.lat - bounds._northEast.lat) / 2);
		var lng = bounds._northEast.lng - ((bounds._northEast.lng - bounds._southWest.lng) / 2);
		
		var icon_props = {
			html : prop
		}
		if(class_name)
			icon_props["className"] = class_name;

		var myIcon = L.divIcon(icon_props);
		var marker = L.marker([lat, lng], {icon : myIcon});
		marker.addTo(map);
		markers[prop] = marker;
	}
}

MapRenderer.prototype.getFeatureByProperty = function(params)
{
	var prop_name = params.property;
	var prop_val = params.value;
	var layer = params.layer
	var feature = undefined;

	for (each in layer._layers) {
		var l = layer._layers[each];
		var prop = l.feature.properties[prop_name];
		if(prop == prop_val)
		{
			feature = l;
			break;
		}
	}

	return feature;
}


getCentroid = function (arr) {
    var twoTimesSignedArea = 0;
    var cxTimes6SignedArea = 0;
    var cyTimes6SignedArea = 0;

    var length = arr.length

    var x = function (i) { return arr[i % length][0] };
    var y = function (i) { return arr[i % length][1] };

    for ( var i = 0; i < arr.length; i++) {
        var twoSA = x(i)*y(i+1) - x(i+1)*y(i);
        twoTimesSignedArea += twoSA;
        cxTimes6SignedArea += (x(i) + x(i+1)) * twoSA;
        cyTimes6SignedArea += (y(i) + y(i+1)) * twoSA;
    }
    var sixSignedArea = 3 * twoTimesSignedArea;
    return {
    	lat : cyTimes6SignedArea / sixSignedArea,
    	lng : cxTimes6SignedArea / sixSignedArea
    }      
}

module.exports = {
	MapRenderer : MapRenderer,
	getCentroid : getCentroid
}
