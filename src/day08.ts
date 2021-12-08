namespace day08 {
    var appIn : HTMLTextAreaElement;
    var appOut : HTMLTextAreaElement;
    export function init (phase: number) {
        // Get our elements of interest
        appIn = document.getElementById("appIn") as HTMLTextAreaElement;
        appOut = document.getElementById("appOut") as HTMLTextAreaElement;
        return run;
    }

    function run (mode: number) {
        appOut.value = `== Phase ${mode} ==\n`;
        var phase1Count = 0;
        const phase1Lengths = [2, 3, 4, 7];
        var phase2Sum = 0;
        const maskHelper = [0x1, 0x2, 0x4, 0x8, 0x10, 0x20, 0x40, 0x80];
        appIn.value.split("\n").forEach((currValue) => {
            // Phase 1: Detect how many times a 1, 4, 7, or 8 appears in the outputs.
            // Phase 2: Fully decode the digits.
            var digitCode = currValue.split('|')[0]?.trim().split(/\s+/);
            var outDigits = currValue.split('|')[1]?.trim().split(/\s+/);
            if ((digitCode === undefined) || (outDigits === undefined)) {
                return;
            }
            switch (mode) {
                case 1:
                    outDigits.forEach(currDigit => {
                        if (phase1Lengths.indexOf(currDigit.length) != -1) {
                            phase1Count++;
                        }
                    })
                    break;
                case 2:
                    // Convert the digit codes to bits so we can compare them
                    // with binary operators.
                    var codeMask: Array<number>;
                    var outMask: Array<number>;
                    var segBit = Array<number>(7);
                    var digitMask = Array<number>(9);
                    var inverseMask = 0x7F;
                    // Sort codes by length.
                    digitCode.sort((a, b) => a.length - b.length);
                    codeMask = digitCode.map(x => {
                        var currMask = 0;
                        for (var i = 0; i < x.length; i++) {
                            currMask |= maskHelper[x.charCodeAt(i) - 97];
                        }
                        return currMask;
                    });
                    outMask = outDigits.map(x => {
                        var currMask = 0;
                        for (var i = 0; i < x.length; i++) {
                            currMask |= maskHelper[x.charCodeAt(i) - 97];
                        }
                        return currMask;
                    });
                    // 1, 4, 7, and 8 are free.
                    digitMask[1] = codeMask[0];
                    digitMask[7] = codeMask[1];
                    digitMask[4] = codeMask[2];
                    digitMask[8] = codeMask[9];
                    // Our unknowns are:
                    // codeMask[3..5] = 2, 3, 5
                    // codeMask[6..8] = 0, 6, 9 (nice)

                    /*     |    -A-+    -A-+   |   |   +-A-    +-A-     -A-+    -A-    +-A-+   +-A-+
                           C       C       C   B   C   B       B           C   B   C   B   C   B   C
                           |   +-D-+    -D-+   +-D-+   +-D-+   +-D-+       +    -D-    +-D-+   |   |
                           F   E           F       F       F   E   F       F   E   F       F   E   F
                           |   +-G-     -G-+       |    -G-+   +-G-+       |    -G-     -G-+   +-G-+
                    */
                    
                    // XOR 1 and 7 to get segment 'A'.
                    segBit[0] = digitMask[1] ^ digitMask[7];
                    // 2 is the only digit with segment 'F' off.
                    for (var i = 0; i < 7; i++) {
                        // Remember day 3?
                        var count = 0;
                        codeMask.forEach(x => {
                            if (x & maskHelper[i]) {
                                count++;
                            }
                        })
                        if (count == 9) {
                            // Found segment 'F'.
                            segBit[5] = maskHelper[i];
                            break;
                        }
                    }
                    // Using 'F', find 2.
                    var indexOf2 = codeMask.findIndex(x => (x & segBit[5]) == 0);
                    digitMask[2] = codeMask[indexOf2];
                    // 3/5 AND !2 will find 3 (contains 'F') and 5 (contains 'B' and 'F')
                    var codesToCheck = [3, 4, 5];
                    codesToCheck.splice(codesToCheck.indexOf(indexOf2), 1);
                    codesToCheck.forEach(i => {
                        var result = codeMask[i] & (digitMask[2] ^ inverseMask)     // XOR 2 with either 3/5
                        if (result == segBit[5]) {
                            // If the result is just segment 'F', we've found 3.
                            digitMask[3] = codeMask[i];
                        } else {
                            // If the result is NOT just segment 'F', we've found 5.
                            digitMask[5] = codeMask[i];
                        }
                    });
                    // 2 AND !3 gets us 'E'
                    segBit[4] = digitMask[2] & (digitMask[3] ^ inverseMask);
                    // Using just 'E', we can figure out where 6 and 9 are. (nice)
                    var codesToCheck = [6, 7, 8];
                    var indexOf6 = codesToCheck.find(i => codeMask[i] == (digitMask[5] | segBit[4]));
                    var indexOf9 = codesToCheck.find(i => codeMask[i] == (inverseMask ^ segBit[4]));
                    // We know 6 and 9 (nice), so the remaining index is 0.
                    codesToCheck = codesToCheck.filter(x => (x != indexOf6) && (x != indexOf9));
                    digitMask[6] = codeMask[indexOf6];
                    digitMask[9] = codeMask[indexOf9];
                    digitMask[0] = codeMask[codesToCheck[0]];

                    // Got all digits. Now figure out the outputs.

                    var outResult = outMask.reduce((p, v) => (p * 10) + digitMask.indexOf(v), 0);    
                    phase2Sum += outResult;                

                    /*digitMask.forEach((x, i) => {
                        appOut.value += `${i}: ${(x | 0x80).toString(2).substr(1, 7)}\n`;
                    });
                    appOut.value += `Digits: ${outResult}\n`;*/
                    break;
            }
        });
        switch (mode) {
            case 1:
                appOut.value += `Output: ${phase1Count}\n`;
                break;
            case 2:
                appOut.value += `Output: ${phase2Sum}\n`;
                break;
        }
    }
};
