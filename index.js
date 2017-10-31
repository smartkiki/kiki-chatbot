'use strict'
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const config = require('./config');
const urls = require('./urls');

/*services section*/
//const fb = require('./services/facebook-service');

/*APP SETTINGS DO NOT TOUCH THESE. THEY REMAIN THE SAME ALWAYS*/
app.set('port', (process.env.PORT || 8000));

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

	if (data.object == 'page') {
		data.entry.forEach(function(pageEntry) {

			pageEntry.messaging.forEach(function(messagingEvent) {
				if (messagingEvent.message) {
					console.log("Got a message from Facebook:");
					receivedMessage(messagingEvent);
				}
				else if (messagingEvent.postback) {
					receivedPostback(messagingEvent);
				}
				else {
					//console.log("Webhook received messaging event which is not handled");
				}
			});
		});
		res.sendStatus(200);
	}
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
		var quickReplyPayload = quickReply.payload;
		//console.log("Quick reply for message %s with payload %s", messageId, quickReplyPayload);


		var payload = quickReplyPayload.split(" ");

		console.log("Quick reply with payload %s", payload[1]);
		//if (payload_params[1] == "1") {
		console.log("user found without location");
		User.findOne({ user_id: senderID }, function(err, user) {
			if (err) {
				console.log(err);
			}
			else {
				console.log("Response status -> " + fb.sendMessageToFacebook(message));
				return;
			}
		});
	}
	else if (messageText) {
		var data = {
			message : messageText,
		};
		console.log(data);
		request({
		uri: urls.backend_url,
		method: 'POST',
		json: data
		}, function (error, response, body) {
			if (!error) {
				console.log("Sent data to the backend");
				return;
			} else {
				console.error("Failed calling Backend");
				console.log("the message we call for is " + messageText);
				return;
			}
		});
	}
}


module.exports = app;