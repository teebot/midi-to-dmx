const _ = require('lodash')
// eg: makeRgbSegment(255, 10, 0, 2, 2) makes { 5: 255, 6: 10, 7: 0 }  6 is green of second segment with address = 5 + 1 
module.exports = {
    rgbSegmentWithChannel: (channel) => {
        return (r, g, b, alpha, from, to) => {
            if (!to) {
                to = from;
            }

            return _.range(from, to + 1).reduce((acc, curr) => {
                var keyBase = 3 * curr + (channel - 1);
                acc[keyBase + 1] = Math.round(r * alpha);
                acc[keyBase + 2] = Math.round(g * alpha);
                acc[keyBase + 3] = Math.round(b * alpha);
                return acc;
            }, {});
        }
    }
}