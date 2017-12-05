const config = require('../config');
const urls = require('../urls');
const request = require('request');

module.exports = {
	createSearchCards : function(url_array) {
		var elements = [];
		var title = "Google Search Result #";
		var number = 1;
		url_array.forEach(function(url) {
			var temp_element = {
				title : title+number,
				subtitle : url,
				buttons: [{
					type : "web_url", 
					url : url,
					title : "Go To Result",
				}],
			};
			elements.push(temp_element);
			number += 1;
		});
		return elements;
	},
};