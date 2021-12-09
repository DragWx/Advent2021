window.onload = globalInit;
var currDayPhase = {
    day: 0,
    phase: 0,
    namespace: undefined
};
var page: {
    daySelect: HTMLSelectElement,
    phaseSelect: HTMLSelectElement,
    outputExtraToggle: HTMLInputElement,
    outputExtraPane: HTMLDivElement,
    outputExtra: HTMLDivElement,
    appIn: HTMLTextAreaElement,
    appOut: HTMLTextAreaElement,
    extras: {
        outCanvas?: HTMLCanvasElement
    }
};
// The namespace for each day.
var days = [];
function globalInit() {
    // Dynamically find all namespaces whose names are day01, day02, ..., day25.
    var dayNames = Array<string>(25);
    for (var i = 1; i < 26; i++) {
        dayNames[i-1] = `day${i < 10 ? '0' + i : i}`;
    }
    dayNames = dayNames.filter(x => typeof window[x] !== 'undefined');
    days = dayNames.map(x => window[x]);
    page = {
        daySelect: document.getElementById("daySelect") as HTMLSelectElement,
        phaseSelect: document.getElementById("phaseSelect") as HTMLSelectElement,
        outputExtraToggle: document.getElementById("outputExtraToggle") as HTMLInputElement,
        outputExtraPane: document.getElementById("outputExtraPane") as HTMLDivElement,
        outputExtra: document.getElementById("outputExtra") as HTMLDivElement,
        appIn: document.getElementById("appIn") as HTMLTextAreaElement,
        appOut: document.getElementById("appOut") as HTMLTextAreaElement,
        extras: {}
    };
    // We take advantage of the fact that browsers typically save the value of
    // all inputs between refreshes.

    // There's a dummy option in the Day Select dropdown. If this code runs, and
    // that dummy option is selected, we interpret it as a fresh pageload and
    // select a default option instead (the latest day)
    if (page.daySelect.value == "") {
        page.daySelect.value = days.length.toString();
        page.phaseSelect.value = "1";
    }
    page.daySelect.options.remove(0);

    // Disable days which aren't done yet.
    for (var i = days.length; i < page.daySelect.options.length; i++) {
        page.daySelect.options.item(i).disabled = true;
    }

    // Generic function for binding a dropdown to a property in an object. Used
    // for the day/phase options.
    var dayPhaseBind = (elem: HTMLSelectElement, model: object, property: string): void => {
        elem.addEventListener("change", function (this, ev) {
            this.classList.value = this.selectedOptions.item(0).classList.value;
            model[property] = parseInt(this.value);
            loadDayPhase();
        });    
        elem.dispatchEvent(new Event("change"));
    }
    dayPhaseBind(page.daySelect, currDayPhase, "day");
    dayPhaseBind(page.phaseSelect, currDayPhase, "phase");

    var outputExtraToggleHandler = function(this: HTMLInputElement, ev: Event) {
        if (this.checked) {
            page.outputExtra.classList.remove("hide");
            page.outputExtraPane.classList.add("fill-big");
        } else {
            page.outputExtra.classList.add("hide");
            page.outputExtraPane.classList.remove("fill-big");
        }

    }
    page.outputExtraToggle.addEventListener("change", outputExtraToggleHandler);
    page.outputExtraToggle.dispatchEvent(new Event("change"));

    // Once everything's gone without a hitch, check for ".waitForLoaded" and
    // and remove from all elements.
    var elements = document.getElementsByClassName("waitForLoaded")
    while(elements.length) {
        elements.item(0).classList.remove("waitForLoaded");
    }
}
function matchFestiveness(target: HTMLElement, source: HTMLElement) {
    for (var i = 1; i <= 5; i++) {
        var currClass = `festive-${i}`;
        if (source.classList.contains(currClass)) {
            target.classList.add(currClass);
        } else {
            target.classList.remove(currClass);
        }
    }
}
// When a Day runs its init() function, it will set this delegate.
var run: (mode: number) => void;
function runButton() {
    if (currDayPhase.phase) {
        run(currDayPhase.phase);
    }
}
function clearButton(field: string) {
    switch (field) {
        case "input":
            page.appIn.value = "";
            break;
        case "output":
            page.appOut.value = "";
            break;
    }
}

// Load the selected day's stuff.
function loadDayPhase() {
    if (!currDayPhase.day || !currDayPhase.phase) {
        return;
    }
    // Get the current day's namespace.
    currDayPhase.namespace = days[currDayPhase.day-1];

    // Clear extras
    while (page.outputExtra.firstChild) {
        page.outputExtra.removeChild(page.outputExtra.firstChild);
    }
    for (var element in page.extras) {
        delete page.extras[element];
    }
    // Parse any extras configured by the day.
    if (currDayPhase.namespace.config['extras']) {
        if (currDayPhase.namespace.config['extras'].indexOf('outCanvas') != -1) {
            page.extras.outCanvas = document.createElement("canvas");
            page.extras.outCanvas.classList.add("fill");
            page.outputExtra.appendChild(page.extras.outCanvas);
            page.outputExtraPane.classList.remove("hide");
        } else {
            page.outputExtraPane.classList.add("hide");
        }
    }
    // Start by disabling the [run] button. It'll stay disabled if there's
    // an error loading the selected day.
    var runButton = document.getElementById("runButton") as HTMLButtonElement;
    runButton.disabled = true;
    try {
        // Run the day's init function.
        run = currDayPhase.namespace.init(currDayPhase.phase, page.appIn, page.appOut, page.extras);
        // If the above failed, we won't reach this point and the [run] button
        // stays disabled.
        runButton.disabled = false;
        matchFestiveness(page.appIn, page.daySelect);
        matchFestiveness(page.appOut, page.phaseSelect);
    } catch(e) {
        // "Why's it failing /now/?"
        console.log(`There's a problem with Day ${currDayPhase.day} Phase ${currDayPhase.phase}'s init code.`);
        console.log(e);
    }
}
