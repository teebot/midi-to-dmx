const DMX = require('dmx');
const midi = require('midi');
const _ = require('lodash');
const A = DMX.Animation;
const input = new midi.input();
const { rgbSegmentWithChannel } = require('./color-utils');
const [ NOTE_ON, NOTE_OFF, PROGRAM_CHANGE, CC ] = [144, 128, 192, 176];
const ON_NOTE_OFF = 0;

const dmx = new DMX();
const universe = dmx.addUniverse('demo', 'enttec-usb-dmx-pro', '/dev/ttyUSB0');
let cutoff = 127;
let preset = 0; // default

const dmxChannelStart = 1;
const makeRgbSegment = rgbSegmentWithChannel(dmxChannelStart);

const config = {
  presets: {
    0: {
      events: [
        {
          on: { noteRange: { from: 0, to: 52 } },
          steps: [{
            channels: { ...makeRgbSegment(85, 105, 0, 1, 0, 3), ...makeRgbSegment(165, 23, 0, 1, 4, 7) },
            duration: 0
          }]
        },
        {
          on: { noteRange: { from: 52, to: 127 } },
          steps: [{
            channels: { ...makeRgbSegment(0, 0, 155, 1, 0, 7) },
            duration: 0
          }]
        }
      ]
    }
  }
};

const eventMapping = config.presets[0].events.map(e => {
  const { from, to } = e.on.noteRange;
  const noteRange = _.range(from, to + 1);
  return {
    steps: e.steps,
    noteRange
  }
});

input.on('message', (deltaTime, message) => {
  // only supports note events for now
  const [ midiEvent, data1, data2 ] = message;
  switch (midiEvent) {
    case NOTE_ON:
      const found = eventMapping.find(e => e.noteRange.indexOf(data1) !== -1);
      if (found) {
        let timeAdd = 0;
        found.steps.forEach(s => {
          if (s.duration === ON_NOTE_OFF) {
            universe.update(s.channels);
          } else {
            // handle set timeouts with timeadd increments
          }
        })
      }
      break;
    case PROGRAM_CHANGE:
      preset = data1;
      break;
    case CC:
      cutoff = data2;
      break;
    default:
    case NOTE_OFF: {
      universe.updateAll(0);
    }
  }
});

input.openPort(1);