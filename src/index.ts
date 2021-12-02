window.onload = globalInit;
var currDay = 0;
var currPhase = 0;
function globalInit() {
    var daySelectElem = document.getElementById("daySelect") as HTMLSelectElement;
    var phaseSelectElem = document.getElementById("phaseSelect") as HTMLSelectElement;
    
    // Disable days which aren't done yet.
    for (var i = 2; i < daySelectElem.options.length; i++) {
        daySelectElem.options.item(i).disabled = true;
    }

    daySelectElem.addEventListener("change", function (this, ev) {
        this.classList.value = this.selectedOptions.item(0).classList.value;
        currDay = parseInt(this.value);
        loadDayPhase();
    });
    // Grab current setting because browsers retain current selections through refreshes.
    daySelectElem.dispatchEvent(new Event("change"));

    phaseSelectElem.addEventListener("change", function (this, ev) {
        this.classList.value = this.selectedOptions.item(0).classList.value;
        currPhase = parseInt(this.value);
        loadDayPhase();
    });
    // Grab current setting because browsers retain current selections through refreshes.
    phaseSelectElem.dispatchEvent(new Event("change"));

    // Once everything's gone without a hitch, check for ".waitForLoaded" and
    // and remove from all elements.
    var elements = document.getElementsByClassName("waitForLoaded")
    while(elements.length) {
        elements.item(0).classList.remove("waitForLoaded");
    }
}
// When a Day runs its init() function, it will set this delegate.
var run: (mode: number) => void;
function runButton() {
    if (currPhase) {
        run(currPhase);
    }
}
function clearButton(field: string) {
    switch (field) {
        case "input":
            (document.getElementById("appIn") as HTMLTextAreaElement).value = "";
            break;
        case "output":
            (document.getElementById("appOut") as HTMLTextAreaElement).value = "";
            break;
    }
}

function loadDayPhase() {
    if (!currDay || !currPhase) {
        return;
    }
    var runButton = document.getElementById("runButton") as HTMLButtonElement;
    runButton.disabled = true;
    try {
        switch(currDay) {
            case 1:
                run = day01.init(currPhase);
                break;
            case 2:
                run = day02.init(currPhase);
                break;
            default:
                run = undefined;
                return;
        }
        runButton.disabled = false;
    } catch(e) {
        console.log(`There's a problem with Day ${currDay}'s init code.`);
        console.log(e);
    }
}
