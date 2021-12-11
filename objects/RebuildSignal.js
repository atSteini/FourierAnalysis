class RebuildSignal {
    constructor(c, phi) {
        this.c = c;
        this.phi = phi;
    }

    getSamplePoints(measurement) {
        let values = new Array(measurement.measureTimeMs).fill(0),
            times = new Array(measurement.measureTimeMs);

        for (let k = 0; k < measurement.highestHarmonic; k++) {
            for (let t = 0; t < measurement.measureTimeMs; t += measurement.sampleIntervalMs) {
                values[t] +=
                    this.c[k] *
                    Math.sin(k * 2 * Math.PI * measurement.frequencyResolutionKHz * t + this.phi[k]);

                if (times[t] === null || times[t] === undefined) {
                    times[t] = t;
                }
            }
        }

        return [values, times];
    }
}