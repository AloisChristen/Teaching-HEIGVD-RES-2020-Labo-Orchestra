/*
 This program simulates someone listening to the orchestra. He will keep a list of 
 musicians, and can give the actives ones on demand on a TCP port.

 A musician is active if he played in the last 5 seconds.
 The list of active musicians is made of their UUID, the instrument they play and the 
 first time they played. 

*/

/*
	Files required for the auditor
*/
const protocol = require('./orchestra-protocol');
const instrumentList = require('./instrument.js');

/*
 * We use a standard Node.js module to work with UDP
 */
const dgram = require('dgram');


/*
 * We use moment to make  time related calculs.
 */
const moment = require('moment');

/*
 * We use net to implement a server with TCP protocol.
 */
const net = require('net');



/* 
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by musicians and containing the music they play.
 */
const socket = dgram.createSocket('udp4');
socket.bind(protocol.PROTOCOL_PORT, function() {
  console.log("Joining multicast group");
  socket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

var listOfMusicians = [];


/*
 * This function curate the list of musicians and only return the active ones
 */
function getActiveMusicians(){
	
	// Any musician that has played since the limit is active
	let limitOfActivity = moment().subtract(5, "seconds");
	
	// Result of the filtering
	let res = [];
	for(var id  in listOfMusicians){
		let musician = listOfMusicians[id];
		if(moment(musician.lastActivity) >= limitOfActivity){
			
			// We create an object with the desired informations
			let data_musician = {
				"uuid" : id,
				"instrument" : musician.instrument,
				"activeSince" : musician.activeSince
			};
			res.push(data_musician);
		}
	}

	return res;
}

/* 
 * This call back is invoked when a new datagram has arrived.
 */
socket.on('message', function(msg, source) {
	let message = JSON.parse(msg);
	let musician = listOfMusicians[message.uuid];
	
	// If this is a new musician, we add it to the list
	if(musician === undefined){
		listOfMusicians[message.uuid] = {
			instrument: instrumentList.SOUND_TO_INSTRUMENT[message.sound],
			activeSince: message.timestamp,
			lastActivity: message.timestamp,
		};
	// The musician was already known, we update the lastActivity timestamp
	} else {
		listOfMusicians[message.uuid].lastActivity = message.timestamp;
	}
});



/*
 * Server creation and binding to port for the TCP ressource of actives musicians
 */
var server = net.createServer();

server.on("connection", function(socket){
	// We send the list of active musicians
	socket.write(
		JSON.stringify(getActiveMusicians())
		);
		socket.pipe(socket);
		socket.destroy();
});

// We listen on the port
server.listen(protocol.PROTOCOL_PORT, function(){
	console.log("Listening on port" + protocol.PROTOCOL_PORT);
});


