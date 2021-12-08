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
        appIn.value.split("\n").forEach((currValue) => {
            // Phase 1: Detect how many times a 1, 4, 7, or 8 appears in the outputs.
            var outDigits = currValue.split('|')[1]?.trim().split(/\s+/);
            if (outDigits === undefined) {
                return;
            }
            outDigits.forEach(currDigit => {
                if (phase1Lengths.indexOf(currDigit.length) != -1) {
                    phase1Count++;
                }
            })
        });
        appOut.value += `Output: ${phase1Count}\n`;
    }
};
