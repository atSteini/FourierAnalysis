class SignalUtils {
    constructor() {
    }

    static getFourierPoints(measurement, signal) {
        let retTimes = [];

        let c = new Array(measurement.highestHarmonic);
        let phi = new Array(measurement.highestHarmonic);

        for (let k = 0; k < measurement.highestHarmonic; k++) {
            let a = 0, b = 0;

            for (let t = 0; t < measurement.measureTimeMs; t+= measurement.sampleIntervalMs) {
                a +=
                    (2/measurement.measureTimeMs)
                    * signal[t]
                    * Math.cos(2 * Math.PI * k * t * measurement.frequencyResolutionKHz);

                b +=
                    (2/measurement.measureTimeMs)
                    * signal[t]
                    * Math.sin(2 * Math.PI * k * t * measurement.frequencyResolutionKHz);
            }

            c[k] = Math.sqrt(a * a + b * b);
            phi[k] = Math.atan(a / b);

            retTimes.push(k);
        }

        //Gleichanteil halbieren
        c[0] /= 2;

        return [c, phi, retTimes];
    }
}