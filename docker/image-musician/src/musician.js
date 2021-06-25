/*
 This program simulates a "smart" thermometer, which publishes the measured temperature
 on a multicast group. Other programs can join the group and receive the measures. The
 measures are transported in json payloads with the following format:

   {"timestamp":1394656712850,"location":"kitchen","temperature":22.5}

 Usage: to start a thermometer, type the following command in a terminal
        (of course, you can run several thermometers in parallel and observe that all
        measures are transmitted via the multicast group):

   node thermometer.js location temperature variation

*/

const protocol = require('./orchestra-protocol');
const instrumentList = require('./instrument.js');

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

/*
 * Let's create a datagram socket. We will use it to send our UDP datagrams 
 */
var s = dgram.createSocket('udp4');

/*
 * We need an universal unique ID
 */
const { v4: uuidv4 } = require('uuid');
/*
 * Let's define a javascript class for our thermometer. The constructor accepts
 * a location, an initial temperature and the amplitude of temperature variation
 * at every iteration
 */
function Musician(instrument) {

	this.uuid = uuidv4();
	this.instrument = instrument;

/*
   * We will simulate temperature changes on a regular basis. That is something that
   * we implement in a class method (via the prototype)
   */
	Musician.prototype.update = function() {

/*
	  * Let's create the measure as a dynamic javascript object, 
	  * add the 3 properties (timestamp, location and temperature)
	  * and serialize the object to a JSON string
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
		s.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
			console.log("Sending payload: " + payload + " via port " + s.address().port);
		});

	}

/*
	 * Let's take and send a measure every 500 ms
	 */
	setInterval(this.update.bind(this), 1000);

}

/*
 * Let's get the thermometer properties from the command line attributes
 * Some error handling wouln't hurt here...
 */
var instrument = process.argv[2];

let validInstruments = Object.keys(instrumentList.INSTRUMENT_TO_SOUND);

if(instrument === undefined || !validInstruments.includes(instrument)){
		let min = 0;
		let max = validInstruments.length;
		let i = Math.floor(Math.random() * (max - min)) + min;
		instrument = validInstruments[i];
}	

/*
 * Let's create a new thermoter - the regular publication of measures will
 * be initiated within the constructor
 */
var t1 = new Musician(instrument);
