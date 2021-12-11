class Graph {
    static defaultBackgroundColor = 'rgb(255, 99, 132)';
    static defaultBorderColor = 'rgb(255, 99, 132)';
    static defaultFontColor = 'rgb(255, 99, 132)';

    constructor(dataValueArray, labels, options, lineLabel, divId) {
        this.divId = divId;

        this.pointRadius = 0;
        this.backgroundColor = Graph.defaultBackgroundColor;
        this.borderColor = Graph.defaultBorderColor;
        this.fontColor = Graph.defaultFontColor;
        this.lineLabel = lineLabel;

        this.labels = labels;
        this.dataValueArray = dataValueArray;
        this.options = options;

        this.dataLabels = {
            display: false,
            align: "end",
            anchor: "end",
            backgroundColor: "#F2F2F2",
            borderRadius: 7,
            padding: 4,
            offset: 5,
            color: "#1E2C53",
        };

        this.tension = null;

        this.type = 'line';

        this.showIndexes = [];

        this.title = {
            display: false
        };
    }

    static formatFloat(fractionDigits, value) {
        return parseFloat(value).toFixed(fractionDigits);
    }

    getData(dataValueArray, labels) {
        return {
            labels: labels,
            datasets: [{
                label: this.lineLabel,
                backgroundColor: this.backgroundColor,
                borderColor: this.borderColor,
                fontColor: this.fontColor,
                data: dataValueArray,
                pointRadius: this.pointRadius,
                tension: this.tension
            }]
        };
    }

    static getLabelsFromDataValues(dataPointTimes, preFix, suffix) {
        let labels = [];
        let delta = 1;

        for (let i = 0; i < dataPointTimes.length; i += delta) {
            labels.push(preFix + dataPointTimes[i] + suffix);
        }

        return labels;
    }

    showTitle(titleString) {
        this.title = {
            display: true,
            text: titleString
        }
    }

    setAllColors(color) {
        this.fontColor = color;
        this.backgroundColor = color;
        this.borderColor = color;
    }

    interpolate(isCubic) {
        this.tension = isCubic ? 0.4 : null;
    }

    formatShowIndexTimeValue(timePrefix, timeSuffix, valuePrefix, valueSuffix) {
        this.dataLabels.formatter = function (value, context) {
            return (
                `${valuePrefix} ${Graph.formatFloat(3, value)} ${valueSuffix}\n` +
                `${timePrefix} ${Graph.formatFloat(3, context.chart.data.labels[context.dataIndex])} ${timeSuffix}`
            );
        };
    }

    formatShowIndexTime(timePrefix, timeSuffix) {
        this.dataLabels.formatter = function (value, context) {
            return (
                `${timePrefix} ${Graph.formatFloat(3, context.chart.data.labels[context.dataIndex])} ${timeSuffix}`
            );
        };
    }

    formatShowIndexValue(prefix, suffix) {
        this.dataLabels.formatter = function (value, context) {
            return (
                `${prefix} ${Graph.formatFloat(3, value)} ${suffix}`
            );
        };
    }

    showLabelByIndex(index) {
        this.showIndexes.push(index);

        let self = {...this};
        this.dataLabels.display = function (context) {
            let show = false;

            for (let i = 0; i < self.showIndexes.length; i++) {
                show |= context.dataIndex === self.showIndexes[i];
            }

            return show;
        }
    }

    showPointsWithValueLargerThen(threshold) {
        this.dataValueArray.forEach((value, index) => {
            if (value > threshold) {
                this.showLabelByIndex(index);
            }
        });
    }

    render() {
        let config = {
            type: this.type,
            data: this.getData(this.dataValueArray, this.labels),
            options: {
                ...this.options,
                plugins: {
                    title: this.title,
                    datalabels: this.dataLabels
                }
            }
        };

        new Chart(
            $('#' + this.divId),
            config
        );
    }
}