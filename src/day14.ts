namespace day14 {
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

    function doInsert(input: string, rules: Map<string, string>) {
        // Start with the first character of `input`.
        var output = input.substring(0,1);
        for (var i = 0; i < input.length - 1; i++) {
            // Look at pairs.
            var pair = input.substring(i, i+2);
            var insert = rules.get(pair) || "";
            output += insert + pair.slice(-1);
        }
        return output;
    }
    function doIncidence(input: string) {
        var counts = new Map<string, number>();
        for (var c of input) {
            if (counts.has(c)) {
                counts.set(c, counts.get(c) + 1);
            } else {
                counts.set(c, 1);
            }
        }
        var output = new Array<{element: string, count: number}>();
        counts.forEach((v, k) => { output.push({element: k, count: v}); });
        return output.sort((a, b) => a.count - b.count);
    }

    function run (mode: number) {
        appOut.value = `== Phase ${mode} ==\n`;
        var readMode = 0;
        var polymer = "";
        var rules = new Map<string, string>();
        appIn.value.split("\n").forEach((inTxtRaw) => {
            if (!inTxtRaw || !inTxtRaw.trim()) {
                // If string is null, empty, or whitespace.
                readMode++;
                return;
            }
            var inTxt = inTxtRaw.trim();
            switch (readMode) {
                case 0:
                    // Template polymer.
                    polymer = inTxt;
                    break;
                case 1:
                    // Insertion pairs.
                    var curr = inTxt.split('->').map(x => x.trim());
                    rules.set(curr[0], curr[1]);
                    break;
            }
            
        });
        //appOut.value += `${polymer}\n`;
        //rules.forEach((v, k) => { appOut.value += `${k} -> ${v}\n` });

        switch (mode) {
            case 1:
                for (var i = 0; i < 10; i++) {
                    polymer = doInsert(polymer, rules);
                    //appOut.value += `${i+1}: ${polymer}\n`;
                }
                var incidence = doIncidence(polymer);
                appOut.value += `Output: ${incidence[incidence.length-1].count - incidence[0].count}\n`;
                break;
            case 2:
                appOut.value += `This is phase 2's output.\n`;
                break;
        }
    }
};
