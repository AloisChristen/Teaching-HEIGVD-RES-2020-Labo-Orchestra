/*
 This programm simulate a musician, playing an instrument in an orchestra.
 
 It will play a music, depending on the instrument played, every second.
 This music will be represented by a UDP datagram on a specified address and port.
 The datagram consists of : the date, the sound of the instrument, and the uuid (Universal Unique ID)
 of the musician.
 
 It's possible to set the instrument played when starting the container, but if none is provided, a random
 one will be set.

*/


/*
	Files required for the musician
*/
const protocol = require('./orchestra-protocol');
const instrumentList = require('./instrument.js');

/*
 * We use a standard Node.js module to work with UDP
 */
const dgram = require('dgram');

/*
 * We need an universal unique ID, form Node.js module
 */
const { v4: uuidv4 } = require('uuid');

/*
 * Let's create a datagram socket. We will use it to send our UDP datagrams 
 */
var socket = dgram.createSocket('udp4');

/*
 * We define a Musician class, that will take an instrument as parameter, and 
 * send the UDP message every seconds
 */
function Musician(instrument) {

	// Initialisation of attributes
	this.uuid = uuidv4();
	this.instrument = instrument;

  /*
   * The play function is responsible for sending the sound datagram
   */
	Musician.prototype.play = function() {

	   /*
	    * Music is the informations we want to send
	    */
		var music = {
			uuid: this.uuid,
			sound: instrumentList.INSTRUMENT_TO_SOUND[this.instrument],
			timestamp: new Date(),
		};
		var payload = JSON.stringify(music);

/*
	   * Finally, let's encapsulate the payload in a UDP datagram, which we publish on
	   * the multicast address. All subscribers to this address will receive the message.
	   */
		message = new Buffer(payload);
		socket.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
			console.log("Sending payload: " + payload + " via port " + socket.address().port);
		});

	}

	/*
	 * Let's play the music every second
	 */
	setInterval(this.play.bind(this), 1000);

}

/*
 * We retrieve the instrument to be played in the arguments
 */
var instrument = process.argv[2];

let validInstruments = Object.keys(instrumentList.INSTRUMENT_TO_SOUND);

/* If no instrument was provided, or if it's an unknown instrument,
 * we select a valid one at random
 */
if(instrument === undefined || !validInstruments.includes(instrument)){
		let min = 0;
		let max = validInstruments.length;
		let i = Math.floor(Math.random() * (max - min)) + min;
		instrument = validInstruments[i];
}	

/*
 * Finally, we create a new musician with the selected instrument
 */
var t1 = new Musician(instrument);
