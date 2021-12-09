namespace day01 {
    var appIn : HTMLTextAreaElement;
    var appOut : HTMLTextAreaElement;
    export const config: object = {
        phases: 2,
        extras: []
    };
    export function init (phase: number, inElement: HTMLTextAreaElement, outElement: HTMLTextAreaElement, extras: object) {
        // Get our elements of interest
        appIn = inElement;
        appOut = outElement;
        return run;
    }

    function run (mode: number) {
        var inNumbers: number[];
        // Read each line as an integer and create an array
        inNumbers = appIn.value.split('\n').map(x => parseInt(x));
        var out: number = 0;
        switch (mode) {
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
};
