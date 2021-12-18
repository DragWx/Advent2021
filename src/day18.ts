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

    function reduce(values: Array<number>, depths: Array<number>) {
        //var opCount = 0;
        while (true) {
            var explodePosition = depths.findIndex((v, i, a) => (v > 4) && (a[i + 1] == v));
            if (explodePosition > -1) {
                if (explodePosition > 0) {
                    // Distribute left.
                    values[explodePosition - 1] += values[explodePosition];
                }
                // Convert pair to single
                values.splice(explodePosition, 1);
                depths.splice(explodePosition, 1);
                depths[explodePosition]--;
                if (explodePosition < depths.length - 1) {
                    // Distribute right.
                    values[explodePosition + 1] += values[explodePosition];
                }
                // Set single to 0, completing the explosion.
                values[explodePosition] = 0;
                //opCount++;
                //appOut.value += `- ${opCount}: Explode -\nV: ${values.join(',')}\nD: ${depths.join(',')}\n`;
                continue;
            }

            var splitPosition = values.findIndex(x => x >= 10);
            if (splitPosition > -1) {
                // Insert new element to right.
                values.splice(splitPosition + 1, 0, Math.ceil(values[splitPosition] / 2));
                values[splitPosition] = Math.floor(values[splitPosition] / 2);
                // Promote to pair.
                depths.splice(splitPosition + 1, 0, depths[splitPosition] + 1);
                depths[splitPosition]++;
                //opCount++;
                //appOut.value += `- ${opCount}: Split -\nV: ${values.join(',')}\nD: ${depths.join(',')}\n`;
                continue;
            }
            break;
        }
        //appOut.value += `- Finished -\nV: ${values.join(',')}\nD: ${depths.join(',')}\n`;
    }
    function add(leftValues: Array<number>, leftDepth: Array<number>, rightValues: Array<number>, rightDepth: Array<number>) {
        var outValues = leftValues.concat(rightValues);
        var outDepth: Array<number>;
        if (leftDepth.length == 0) {
            outDepth = rightDepth;
        } else {
            outDepth = leftDepth.map(x => x + 1).concat(rightDepth.map(x => x + 1));
        }
        return {values: outValues, depth: outDepth};
    }
    function toMagnitude(values: Array<number>, depths: Array<number>) {
        // This works similarly to how the explode works.
        while (values.length > 1) {
            // Find location of the deepest pair, left to right.
            var deepest = depths.reduce((p, v) => (v > p) ? v : p);
            var deepestPos = depths.findIndex((v, i, a) => (v == deepest) && (a[i + 1] == v));
            // Calculate magnitude of pair to reduce to single.
            var left = values.splice(deepestPos, 1)[0];            
            values[deepestPos] = (left * 3) + (values[deepestPos] * 2);
            // Convert to single.
            depths.splice(deepestPos, 1);
            depths[deepestPos]--;
        }
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

        switch (mode) {
            case 1:
                // Each additional line takes the previous info and promotes it to the
                // left half of a pair, with the new line as the right half.

                var currValues = new Array<number>();
                var currDepths = new Array<number>();

                inValues.forEach((nextValues, index) => {
                    var addResults = add(currValues, currDepths, nextValues, inDepths[index]);
                    currValues = addResults.values;
                    currDepths = addResults.depth;

                    //appOut.value += `- Add -\nV: ${currValues.join(',')}\nD: ${currDepths.join(',')}\n`;
                    reduce(currValues, currDepths);
                });

                // Sum and reduction are all done. Now calculate the magnitude.
                toMagnitude(currValues, currDepths);

                //appOut.value += `- Finished -\nV: ${currValues.join(',')}\nD: ${currDepths.join(',')}\n`;
                appOut.value += `Output: ${currValues[0]}\n`;
                break;
            case 2:
                // Figure out the largest magnitude you can get from adding two
                // lines together.

                // I spent hours trying to think of a clever way to not check all
                // permutations, but I came up empty.
                var magnitudes = Array<number>();
                for (var a = 0; a < inValues.length; a++) {
                    for (var b = 0; b < inValues.length; b++) {
                        if (a == b) {
                            continue;
                        } else {
                            var addResults = add(inValues[a], inDepths[a], inValues[b], inDepths[b]);
                            reduce(addResults.values, addResults.depth);
                            toMagnitude(addResults.values, addResults.depth);
                            magnitudes.push(addResults.values[0]);
                        }
                    }
                }
                magnitudes = magnitudes.sort((a, b) => b - a);
                var output = magnitudes[0];

                appOut.value += `Output: ${output}\n`;
                break;
        }
    }
};
