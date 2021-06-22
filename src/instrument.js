exports.INSTRUMENT_TO_SOUND = instrumentToSound;
exports.SOUND_TO_INSTRUMENT = soundToInstrument;

var instrumentToSound = {
	"piano"   : "ti-ta-ti"
	"trumpet" : "pouet"
	"flute"   : "trulu"
	"violin"  : "gzi-gzi"
	"drum"    : "boum-boum"
};

var soundToInstrument = {};
for(var instrument in instrumentToSound)
{
    var sound = instrumentToSound[instrument];
    soundToInstrument[sound] = instrument;
}

