'use strict'
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const config = require('./config');
const urls = require('./urls');

/*services section*/
const fb = require('./services/facebook-service');
const search = require('./services/search-service');
/*APP SETTINGS DO NOT TOUCH THESE. THEY REMAIN THE SAME ALWAYS*/
app.set('port', (process.env.PORT || 8082));

if(!module.parent) {
    app.listen(app.get('port'), function() {
		console.log('running on port', app.get('port'));
	});
}

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());


/*GET METHOD TO CONNECT TO WEBPAGE FOR AIDERA*/
app.get('/', function( req, res) {
	res.send('Official Page for the chatbot Kiki!');
});


/*GET METHOD TO CONNECT TO FACEBOOK*/
app.get('/webhook', function (req, res) {
	if (req.query['hub.verify_token'] === 'kiki') {
		res.send(req.query['hub.challenge']);
		console.log("Got a webhook request");
	}
	res.send('Error, wrong token');
});


/*POST METHOD TO GET MESSAGE FROM FACEBOOK*/
app.post('/webhook/', function(req, res) {

	var data = req.body;
	console.log("data is " + JSON.stringify(data));

	if (data.object == 'page') {
		data.entry.forEach(function(pageEntry) {

			pageEntry.messaging.forEach(function(messagingEvent) {
				if (messagingEvent.message) {
					console.log("Got a message from Facebook:");
					receivedMessage(messagingEvent);
				}
				else if (messagingEvent.postback) {
					console.log("Got a payload request from Facebook:");
					receivedPostback(messagingEvent);
				}
				else {
					console.log("Webhook received messaging event which is not handled" + JSON.stringify(messagingEvent));
				}
			});
		});
		res.sendStatus(200);
	}
});


/*TO GET SEARCH QUERIES FROM THE PI*/
app.post('/searchresults', function(req, res) {
	//here
	var data = req.body;
	console.log("data is " + JSON.stringify(data));
	//handle sending to facebook
	var elements = search.createSearchCards(data.urls);
	var message = fb.createCards(data.fbid, elements);
	console.log("Response status -> " + fb.sendMessageToFacebook(message));
	res.sendStatus(200)
});


function receivedMessage(event) {
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfMessage = event.timestamp;
	var message = event.message;
	var metadata = message.metadata;

	var messageText = message.text;
	var messageAttachments = message.attachments;
	var isEcho = message.is_echo;
	var quickReply = message.quick_reply;

	if (isEcho) {
		//console.log("Received echo for message %s and app %d with metadata %s", messageId, appId, metadata);
		return;
	}
	else if (quickReply) {
		//nothing to do here
	}
	else if (messageText) {
		var data = {
			message : messageText,
		};
		console.log(data);
		request({
		uri: urls.backend_url+'chatbot',
		method: 'POST',
		json: data
		}, function (error, response, body) {
			if (!error) {
				console.log("Sent data to the backend" + JSON.stringify(data));
				var message = fb.createTextMessage(senderID, body.message);
				fb.sendMessageToFacebook(message);
				return;
			} else {
				console.error("Failed calling Backend");
				console.log("the message we call for is " + messageText);
				return;
			}
		});
	}
}

function receivedPostback(event) {
	var senderID = event.sender.id;
	var timeOfPostback = event.timestamp;

	var payload = event.postback.payload;
	var payload_params = payload.split(" ");
	if (payload_params[0] != null) {
		console.log("Postback was : " + payload_params[0]);
		var data = {
			"user_id": senderID, 
			"payload_type" : payload,
		};
		console.log(payload);
		request({
		uri: urls.backend_url+'postback',
		method: 'POST',
		json: data
		}, function (error, response, body) {
			if (!error) {
				console.log("Sent postback to the backend" + JSON.stringify(body));
				var message = fb.createTextMessage(senderID, body.message);
				fb.sendMessageToFacebook(message);
				return;
			} else {
				console.error("Failed calling Backend");
				console.log("the payload_params we call for is " + payload_params[0]);
				return;
			}
		});
	}
	else {
		console.log("Postback was : " + payload_params[0]);
	}
}




module.exports = app;