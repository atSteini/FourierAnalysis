class RandomSignal {
    constructor(a) {
        this.a = a;
        this.values = null;
    }

    getSamplePoints(measurement) {
        if (this.values) {
            return this.values;
        }

        let values = [], times = [];

        for (let t = 0; t < measurement.measureTimeMs; t++) {
            let currentValue =
                10 * this.a * Math.sin(2 * Math.PI * (this.a + 10) / 1000 * t + this.a * 2 * Math.PI / 350) +
                this.a * 10 / 5 * Math.cos(this.a * 2 * Math.PI / 340 + 2 * (this.a + 15) * Math.PI / 1000 * t) +
                10 * this.a / 2 * Math.sin(2 * (20 + this.a) * Math.PI / 1000 * t + this.a * 2 * Math.PI / 330) +
                5 * this.a * Math.cos(0) +
                3 * this.a * Math.sin(0);

            values.push(currentValue);
            times.push(t);
        }

        this.values = values;

        return [values, times];
    }
    
    static generateFromStudent(student) {
        return new RandomSignal(student.katNr);
    }
}