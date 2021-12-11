Chart.register(ChartDataLabels);

let enableLog = true;
let logDefaults = false;

let student = new Student(
    "Florian Steinkellner",
    19
);

// Settings
let enableLiveReload = false;
let onTimePercent = 25;
let highestHarmonic = 100;
let fourierThreshold = 0.01;
let symmetric = false;
let loading = false;

let colorRectangle = 'rgb(255, 99, 132)';
let colorRandom = 'rgb(100, 113, 255)';

let rectangleSignal, randomSignal, measurement;
let fourierTimes, fourierPoints, fourierPhases;
let allGraphs = [];


$(window).on('load', function () {
    update();
});

$('#settingsCollapse').on("click", function() {
    this.classList.toggle("active");
    let content = this.nextElementSibling;

    if (content.style.display !== "none") {
        content.style.display = "none";
    } else {
        content.style.display = "block";
    }
});

$(function () {
    $('#enableLog').on('click', function () {
        $('#logDefaults').attr('disabled', !$(this).is(':checked'));
    });
});

let $loading = $('#loadingDiv').hide();
$(document)
    .ajaxStart(function () {
        $loading.show();
    })
    .ajaxStop(function () {
        $loading.hide();
    });

function updateLoading(load) {
    loading = load;

    if (loading) {
        $loading.ajaxStart();
        return;
    }

    $loading.ajaxStop();
}

function update() {
    updateLoading(true);

    updateSettingsNoUpdate();

    generateDefaults();

    if (logDefaults) {
        printDefaults();
    }

    initAllGraphs();
    renderAllGraphs();

    updateLoading(false);
}

function initAllGraphs() {
    allGraphs.push(initRectangleTime());
    allGraphs.push(initRectangleFourier());
    allGraphs.push(initRectangleRebuild());

    allGraphs.push(initRandomSignal());
    allGraphs.push(initRandomFourier());
    allGraphs.push(initRandomRebuild());
}

function renderAllGraphs() {
    allGraphs.forEach(graph => {
        reloadCanvas(graph.divId);

        graph.render();
    });
}

function generateDefaults() {
    rectangleSignal = RectangleSignal.generateFromStudent(
        student,
        symmetric,
        onTimePercent
    );

    measurement = generateMeasurementFromSignal(rectangleSignal, highestHarmonic);

    randomSignal = RandomSignal.generateFromStudent(student);
}

function generateMeasurementFromSignal(signal, highestHarmonic) {
    return new Measurement(
        1,
        10 * signal.periodMS,
        1 / (10 * signal.periodMS),
        highestHarmonic
    );
}

function findPeriod(data, toleranceSpan, everyNthCheck) {
    let changeCount = 0, previousValue = null;
    let retIndex = null;

    data.every(function (element, index) {
        if (index % everyNthCheck !== 0) {
            return true;
        }

        let distance = element === previousValue ? 0 : Math.abs(element - previousValue);

        if (distance > toleranceSpan) {
            changeCount++;
        }

        previousValue = element;

        if (changeCount === 3) {
            retIndex = index;

            return false;   // =break;
        }

        return true;        // =continue;
    });

    return retIndex;
}

function initRectangleTime() {
    let [sampledData, sampledTimes] = rectangleSignal.getSamplePoints(measurement);

    let graph = new Graph(
        sampledData,
        Graph.getLabelsFromDataValues(sampledTimes, '', ' ms'),
        {
            responsiveAnimationDuration: 2000
        },
        'Rechtecksignal Zeitverhalten',
        'rectangle_time_chart'
    );

    graph.setAllColors(colorRectangle);
    graph.showLabelByIndex(findPeriod(sampledData, 1, 1));

    graph.showTitle(`${student.name} | ${student.katNr}`);

    graph.formatShowIndexTime("Period:", "ms")
    graph.interpolate(true);

    return graph;
}

function initRectangleFourier() {
    if (!rectangleSignal || !measurement) {
        return null;
    }

    [fourierPoints, fourierPhases, fourierTimes] =
        SignalUtils.getFourierPoints(measurement, rectangleSignal.getSamplePoints(measurement));

    let graph = new Graph(
        fourierPoints,
        Graph.getLabelsFromDataValues(fourierTimes, '', ' kHz'),
        {
            responsiveAnimationDuration: 2000
        },
        'Rechtecksignal Fourieranalyse',
        'rectangle_fourier_chart');

    graph.type = 'bar';

    graph.setAllColors(colorRectangle);
    graph.formatShowIndexTimeValue("", "kHz", "", "V");
    graph.showPointsWithValueLargerThen(fourierThreshold);

    graph.showTitle(`${student.name} | ${student.katNr}`);

    return graph;
}

function initRectangleRebuild() {
    if (!measurement || !fourierPoints || !fourierPhases) {
        return null;
    }

    let rebuild = new RebuildSignal(fourierPoints, fourierPhases);

    let [rebuildPoints, rebuildTimes] = rebuild.getSamplePoints(measurement);

    let graph = new Graph(
        rebuildPoints,
        Graph.getLabelsFromDataValues(rebuildTimes, '', ' ms'),
        {
            responsiveAnimationDuration: 2000
        },
        'Rechtecksignal Nachbau',
        'rectangle_rebuild_chart');

    graph.setAllColors(colorRectangle);
    graph.showTitle(`${student.name} | ${student.katNr}`);

    graph.interpolate(true);

    return graph;
}

function initRandomSignal() {
    if (!measurement) {
        return null;
    }

    measurement.measureTimeMs = 1000;
    measurement.frequencyResolutionKHz = 1 / measurement.measureTimeMs;

    let [randomPoints, randomTimes] = randomSignal.getSamplePoints(measurement);

    let graph = new Graph(
        randomPoints,
        Graph.getLabelsFromDataValues(randomTimes, '', ' ms'),
        {
            responsiveAnimationDuration: 2000
        },
        'Zufälliges Signal Zeitverhalten',
        'random_signal_chart'
    );

    graph.setAllColors(colorRandom);

    graph.showTitle(`${student.name} | ${student.katNr}`);

    graph.interpolate(true);

    return graph;
}

function initRandomFourier() {
    if (!randomSignal || !measurement) {
        return null;
    }

    [fourierPoints, fourierPhases, fourierTimes] =
        SignalUtils.getFourierPoints(measurement, randomSignal.getSamplePoints(measurement));

    let graph = new Graph(
        fourierPoints,
        Graph.getLabelsFromDataValues(fourierTimes, '', ' kHz'),
        {
            responsiveAnimationDuration: 2000
        },
        'Zufälliges Signal Fourieranalyse',
        'random_fourier_chart');

    graph.setAllColors(colorRandom);

    graph.formatShowIndexTimeValue("", "kHz", "", "V");
    graph.showPointsWithValueLargerThen(fourierThreshold);

    graph.showTitle(`${student.name} | ${student.katNr}`);

    graph.type = 'bar';

    return graph;
}

function initRandomRebuild() {
    if (!measurement || !fourierPoints || !fourierPhases) {
        return null;
    }

    let rebuild = new RebuildSignal(fourierPoints, fourierPhases);

    let [rebuildPoints, rebuildTimes] = rebuild.getSamplePoints(measurement);

    let graph = new Graph(
        rebuildPoints,
        Graph.getLabelsFromDataValues(rebuildTimes, '', ' ms'),
        {
            responsiveAnimationDuration: 2000
        },
        'Zufälliges Signal Nachbau',
        'random_rebuild_chart');

    graph.setAllColors(colorRandom);

    graph.showTitle(`${student.name} | ${student.katNr}`);

    graph.interpolate(true);

    return graph;
}

function printDefaults() {
    if (!enableLog) {
        return;
    }

    console.clear();

    logTableWithName(student, "Student");

    logTableWithName(measurement, "Measurement");

    logTableWithName(rectangleSignal, "RectangleSignal");

    logTableWithName(randomSignal, "RandomSignal");
}

function reloadCanvas(divId) {
    let oldCanvas = $('#' + divId);
    let parentElement = oldCanvas.parent();

    oldCanvas.remove();

    let canvas = document.createElement('canvas');
    canvas.id = divId;

    parentElement.append(canvas);
}

function updateSettings(isCalledFromDom) {
    if (isCalledFromDom && !enableLiveReload) {
        return;
    }

    updateSettingsNoUpdate();

    update();
}

function updateSettingsNoUpdate() {
    console.clear();

    enableLog = getChecked('enableLog');
    logDefaults = getChecked('logDefaults');
    symmetric = getChecked('symmetric');

    $('#logDefaults').attr('disabled', !getChecked('enableLog'));

    for (let property in student) {
        student[property] = $('#' + property).val();
    }

    highestHarmonic = $('#highestHarmonic').val();
    onTimePercent = $('#onTimePercent').val();
    fourierThreshold = $('#fourierThreshold').val();

    $('#title').text("Projekt Fourieranalyse");
    $('#subtitle').text(`${student.name} | ${student.katNr}`);
}

function log(object) {
    if (!enableLog) {
        return;
    }

    console.log(object);
}

function logTableWithName(object, name) {
    if (!enableLog) {
        return;
    }

    let modObj = {"Object": name, ...object};

    delete modObj.values;

    console.table(modObj)
}

function getChecked(chkbxId) {
    return $("#" + chkbxId).is(':checked')
}