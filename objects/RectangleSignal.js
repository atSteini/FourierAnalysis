class RectangleSignal {
    constructor(periodMs, low, high, onTimePercent) {
        this.periodMS = periodMs;   //ms
        this.low = low; //V
        this.high = high;   //V
        this.dutyCycle = onTimePercent / 100.0;   // % / 100
        this.initialValue = true; //starting Low (false) or High (true)

        this.values = null;
    }

    getSamplePoints(measurement) {
        if (this.values) {
            return this.values;
        }

        let retValues = [];
        let retTimes = [];

        //Counts up milliseconds
        for (let i = 0; i <= measurement.measureTimeMs; i += measurement.sampleIntervalMs) {
            let currentValue = this.getValueAtTime(i);

            retValues.push(currentValue);
            retTimes.push(i);
        }

        this.values = retValues;

        return [retValues, retTimes];
    }

    getValueAtTime(timeMs) {
        let currentPeriodCounter = timeMs % this.periodMS;

        let changeTime = this.periodMS * this.dutyCycle;
        let flag = currentPeriodCounter >= changeTime;

        if (this.initialValue) {
            flag = currentPeriodCounter < changeTime;
        }

        return flag ? this.high : this.low;
    }

    static generateFromStudent(student, symmetric, onTimePercent) {
        let amplitudeHigh = parseInt(student.katNr) + 5;  //V
        let amplitudeLow = 0;       //V

        if (symmetric) {
            amplitudeHigh *= 1/2;
            amplitudeLow = -amplitudeHigh;
        }

        return new RectangleSignal(
            2* student.katNr + 20,  //ms
            amplitudeLow,   //V
            amplitudeHigh,  //V
            onTimePercent);//%
    }
}