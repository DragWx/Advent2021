namespace day18 {
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
        appOut.value = `== Phase ${mode} ==\n`;
        var inValues = new Array<Array<number>>();
        var inDepths = new Array<Array<number>>();
        appIn.value.split("\n").forEach((inTxtRaw) => {
            if (!inTxtRaw || !inTxtRaw.trim()) {
                // If string is null, empty, or whitespace.
                return;
            }
            var inTxt = inTxtRaw.trim();
            var currDepth = 0;
            var currValues = new Array<number>();
            var currDepths = new Array<number>();
            for (var i = 0; i < inTxt.length; i++) {
                switch (inTxt.charAt(i)) {
                    case "[":
                        currDepth++;
                        break;
                    case "]":
                        currDepth--;
                        break;
                    default:
                        // Decode number with 1 or more digits.
                        var match = inTxt.substring(i).match(/^\d+/);
                        if (match) {
                            currValues.push(parseInt(match[0]));
                            currDepths.push(currDepth);
                            i += match[0].length - 1;
                        }
                        break;
                }
            }
            inValues.push(currValues);
            inDepths.push(currDepths);
            //appOut.value += `${inTxt}\nV: ${currValues.join(',')}\nD: ${currDepths.join(',')}\n`;
        });
        // Each additional line takes the previous info and promotes it to the
        // left half of a pair, with the new line as the right half.

        var currValues = new Array<number>();
        var currDepths = new Array<number>();

        inValues.forEach((nextValues, index) => {
            currValues = currValues.concat(nextValues);
            if (currDepths.length == 0) {
                currDepths = inDepths[index];
            } else {
                currDepths = currDepths.map(x => x + 1).concat(inDepths[index].map(x => x + 1));
            }

            //appOut.value += `- Add -\nV: ${currValues.join(',')}\nD: ${currDepths.join(',')}\n`;

            //var opCount = 0;
            while (true) {
                var explodePosition = currDepths.findIndex((v, i, a) => (v > 4) && (a[i + 1] == v));
                if (explodePosition > -1) {
                    if (explodePosition > 0) {
                        // Distribute left.
                        currValues[explodePosition - 1] += currValues[explodePosition];
                    }
                    // Convert pair to single
                    currValues.splice(explodePosition, 1);
                    currDepths.splice(explodePosition, 1);
                    currDepths[explodePosition]--;
                    if (explodePosition < currDepths.length - 1) {
                        // Distribute right.
                        currValues[explodePosition + 1] += currValues[explodePosition];
                    }
                    // Set single to 0, completing the explosion.
                    currValues[explodePosition] = 0;
                    //opCount++;
                    //appOut.value += `- ${opCount}: Explode -\nV: ${currValues.join(',')}\nD: ${currDepths.join(',')}\n`;
                    continue;
                }

                var splitPosition = currValues.findIndex(x => x >= 10);
                if (splitPosition > -1) {
                    // Insert new element to right.
                    currValues.splice(splitPosition + 1, 0, Math.ceil(currValues[splitPosition] / 2));
                    currValues[splitPosition] = Math.floor(currValues[splitPosition] / 2);
                    // Promote to pair.
                    currDepths.splice(splitPosition + 1, 0, currDepths[splitPosition] + 1);
                    currDepths[splitPosition]++;
                    //opCount++;
                    //appOut.value += `- ${opCount}: Split -\nV: ${currValues.join(',')}\nD: ${currDepths.join(',')}\n`;
                    continue;
                }
                break;
            }
            //appOut.value += `- Finished -\nV: ${currValues.join(',')}\nD: ${currDepths.join(',')}\n`;
        });

        // Sum and reduction are all done. Now calculate the magnitude. We'll do
        // this similarly to how the explode works.
        while (currValues.length > 1) {
            // Find location of the deepest pair, left to right.
            var deepest = currDepths.reduce((p, v) => (v > p) ? v : p);
            var deepestPos = currDepths.findIndex((v, i, a) => (v == deepest) && (a[i + 1] == v));
            // Calculate magnitude of pair to reduce to single.
            var left = currValues.splice(deepestPos, 1)[0];            
            currValues[deepestPos] = (left * 3) + (currValues[deepestPos] * 2);
            // Convert to single.
            currDepths.splice(deepestPos, 1);
            currDepths[deepestPos]--;
        }

        //appOut.value += `- Finished -\nV: ${currValues.join(',')}\nD: ${currDepths.join(',')}\n`;

        switch (mode) {
            case 1:
                appOut.value += `Output: ${currValues[0]}\n`;
                break;
            case 2:
                appOut.value += `This is phase 2's output.\n`;
                break;
        }
    }
};
