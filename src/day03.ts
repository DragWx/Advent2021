namespace day03 {
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
        switch (mode) {
            case 1: // Phase 1
                var counts = Array<number>();
                var numInputs = 0;
                // Parse the input into command and number.
                appIn.value.split("\n").forEach(currLine => {
                    var currBinary = parseInt(currLine, 2);
                    if (!isNaN(currBinary)) {
                        numInputs++;
                        var mask = 1;
                        var position = 0;
                        // Scan the bits in the current input.
                        while (mask <= currBinary) {
                            // Add any missing leading bits we haven't seen before
                            if (counts.length < (position+1)) {
                                counts.push(0);
                            }
                            // '1' bit in the current position? Count it.
                            if (currBinary & mask) {
                                counts[position]++;
                            }
                            // Advance to next bit position
                            mask <<= 1;
                            position++;
                        }
                    }
                });
                // To calculate gamma, the most common bit in each position is the bit
                // you put into gamma. Epsilon gets the opposite bit (least common)
                var gamma = 0;
                var epsilon = 0;
                var mask = 1;
                var threshold = numInputs / 2;
                for (var i = 0; i < counts.length; i++) {
                    if (counts[i] > threshold) {
                        gamma |= mask;
                    } else {
                        epsilon |= mask;
                    }
                    mask <<= 1;
                }
                appOut.value = `== Phase ${mode} ==\nGamma: ${gamma}\nEpsilon: ${epsilon}\nOutput: ${gamma * epsilon}`;
                break;
            case 2: // Phase 2
                var binary = Array<number>();
                var mask = 1;
                var numBits = 0;
                appIn.value.split("\n").forEach(currLine => {
                    var currBinary = parseInt(currLine, 2);
                    if (!isNaN(currBinary)) {
                        binary.push(currBinary);
                        // Figure out how many bits we're dealing with.
                        while (mask <= currBinary) {
                            mask <<= 1;
                            numBits++;
                        }
                    }
                });

                // Start with MSB, which value is majority? Fill oxy with inputs
                // matching that bit. Move to next bit and repeat.

                var oxyFilter = [...binary];
                var mask = 1 << (numBits - 1);
                for (var i = numBits - 1; i >= 0; i--) {
                    var threshold = oxyFilter.length / 2;
                    // Starting with MSB and working to LSB.

                    // Filter by '1' bit in current position and check result count.
                    var test = oxyFilter.filter(x => (x & mask) != 0);
                    if (test.length >= threshold) {
                        // Majority is 1.
                        oxyFilter = test;
                    } else {
                        // Majority is 0.
                        oxyFilter = oxyFilter.filter(x => (x & mask) == 0);
                    }
                    if (oxyFilter.length <= 1) {
                        break;
                    }
                    mask >>= 1;
                }

                // Repeat the procedure, but now we're interested in which value
                // is minority.
                var carFilter = [...binary];
                var mask = 1 << (numBits - 1);
                for (var i = numBits - 1; i >= 0; i--) {
                    var threshold = carFilter.length / 2;
                    // Starting with MSB and working to LSB.

                    // Filter by '1' bit in current position and check result count.
                    var test = carFilter.filter(x => (x & mask) != 0);
                    if (test.length < threshold) {
                        // Majority is 1.
                        carFilter = test;
                    } else {
                        // Majority is 0.
                        carFilter = carFilter.filter(x => (x & mask) == 0);
                    }
                    if (carFilter.length <= 1) {
                        break;
                    }
                    mask >>= 1;
                }
                var oxygen = oxyFilter[0];
                var carbon = carFilter[0];
                appOut.value = `== Phase ${mode} ==\nOxygen: ${oxygen}\nCarbon: ${carbon}\nOutput: ${oxygen * carbon}`;
                break;        
        }
    }
};
