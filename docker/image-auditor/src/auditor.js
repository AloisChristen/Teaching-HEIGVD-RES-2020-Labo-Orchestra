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

/*
 * We use a standard Node.js module to work with UDP
 */
const dgram = require('dgram');

/* 
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by thermometers and containing measures
 */
const s = dgram.createSocket('udp4');
s.bind(protocol.PROTOCOL_PORT, function() {
  console.log("Joining multicast group");
  s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

let listOfMusicians = [];


function getActiveMusician(){
	var limitOfActivity = moment().subtract(5, "seconds");
	for(var m of listOfMusicians){
		if(moment(m.lastActivity) < limitOfActivity){
		console.log("too old");
		} else {
		console.log(m);
		}
	}
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
s.on('message', function(msg, source) {
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
	//console.log("Data has arrived: " + msg + ". Source port: " + source.port);
	//console.log(listOfMusicians);
	console.log(getActiveMusician());
});





