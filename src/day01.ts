window.onload = init;
var appIn : HTMLTextAreaElement;
var appOut : HTMLTextAreaElement;
function init () {
    // Get our elements of interest
    appIn = document.getElementById("appIn") as HTMLTextAreaElement;
    appOut = document.getElementById("appOut") as HTMLTextAreaElement;
}

function run (calculation?: number) {
    var inNumbers: number[];
    // Read each line as an integer and create an array
    inNumbers = appIn.value.split('\n').map(x => parseInt(x));
    var out: number = 0
    switch (calculation) {
        case 1: // Compare current with previous
            out = inNumbers.reduce((accumulator, x, i, all):number => {
                if (i > 0) {
                    if (all[i] > all[i-1]) {
                        // Increase accumulator if current value > previous value.
                        accumulator++;
                    }
                } else {
                    // First element? Initialize the accumulator.
                    return 0;
                }
                return accumulator;
            }, 0);
            break;
        case 2: // Compare current triplet with previous triplet
            out = inNumbers.reduce((accumulator, x, i, all):number => {
                if (i > 2) {
                    // calculate the tuples
                    var prev = all[i-2] + all[i-1];
                    var curr = prev + all[i];
                    prev += all[i-3];
                    if (curr > prev) {
                        // Increase accumulator if current tuple > previous tuple
                        accumulator++;
                    }
                } else {
                    // Not enough numbers for comparison? Initialize accumulator.
                    return 0;
                }
                return accumulator;
            }, 0);
            break;
    }
    appOut.value = out.toString();
}