/*
 This program simulates a "data collection station", which joins a multicast
 group in order to receive measures published by thermometers (or other sensors).
 The measures are transported in json payloads with the following format:

   {"timestamp":1394656712850,"location":"kitchen","temperature":22.5}

 Usage: to start the station, use the following command in a terminal

   node station.js

*/

/*
 * We have defined the multicast address and port in a file, that can be imported both by
 * thermometer.js and station.js. The address and the port are part of our simple 
 * application-level protocol
 */
const protocol = require('./orchestra-protocol');
const instrumentList = require('./instrument.js');

const moment = require('moment');

const net = require('net');

/*
 * We use a standard Node.js module to work with UDP
 */
const dgram = require('dgram');

/* 
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by thermometers and containing measures
 */
const socket = dgram.createSocket('udp4');
socket.bind(protocol.PROTOCOL_PORT, function() {
  console.log("Joining multicast group");
  socket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

var listOfMusicians = [];


function getActiveMusicians(){
	let limitOfActivity = moment().subtract(5, "seconds");
	let res = [];
	for(var id  in listOfMusicians){
		console.log("id :" + id);
		let m = listOfMusicians[id];
		if(moment(m.lastActivity) >= limitOfActivity){
			res.push(m);
		}
	}

	return res;
/*
listOfMusicians.forEach( m => 
	console.log(now.getUTCSeconds() - m.lastActivity.getUTCSeconds() <= 5));
	return listOfMusicians.filter(function(m) {
		console.log("now : "  + now + " | timeStamp : " + m);
		return now.getUTCSeconds() - m.lastActivity.getUTCSeconds() <= 5;
	});
*/
}

/* 
 * This call back is invoked when a new datagram has arrived.
 */
socket.on('message', function(msg, source) {
	let message = JSON.parse(msg);
	let musician = listOfMusicians[message.uuid];
	if(musician === undefined){
		listOfMusicians[message.uuid] = {
			instrument: instrumentList.SOUND_TO_INSTRUMENT[message.sound],
			activeSince: message.timestamp,
			lastActivity: message.timestamp,
		};
	} else {
		listOfMusicians[message.uuid].lastActivity = message.timestamp;
	}
	console.log(listOfMusicians);
	console.log(getActiveMusicians());
});


var server = net.createServer();

server.on("connection", function(socket){
	socket.write(
		JSON.stringify(getActiveMusicians())
		);
		socket.pipe(socket);
		socket.destroy();
});

server.listen(protocol.PROTOCOL_PORT, function(){
	console.log("Listening on port" + protocol.PROTOCOL_PORT);
});


