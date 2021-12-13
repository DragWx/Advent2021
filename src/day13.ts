namespace day13 {
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
    function getKey(x: number, y: number) {
        // X | (Y<<24), using multiplication because bit shifting is limited to 32 bits.
        return (x & 0xFFFFFF) + ((y & 0xFFFFFF) * 0x1000000);
    }
    function getCoords(key: number) {
        var x = key & 0xFFFFFF
        return {x: x, y: (key - x) / 0x1000000};
    }
    function fold(dots: Array<number>, vertical: boolean, position: number) {
        var dotsToFold: Array<number>;
        var newDots: Array<number>;
        var length = position * 2;
        if (vertical) {
            // Split dots on X=position
            newDots = dots.filter(k => (k & 0xFFFFFF) <= position);
            dotsToFold = dots.filter(k => (k & 0xFFFFFF) > position).map(k => {
                // Horizontally flip.
                // Remove x from key, add (length - x) to key
                var x = k & 0xFFFFFF;
                return (k - x) + (length - x);
            });
        } else {
            // Split dots on Y=position
            newDots = dots.filter(k => ((k - (k & 0xFFFFFF)) / 0x1000000) <= position);
            dotsToFold = dots.filter(k => ((k - (k & 0xFFFFFF)) / 0x1000000) > position).map(k => {
                // Vertically flip.
                var coords = getCoords(k);
                return getKey(coords.x, length - coords.y);
            });
        }
        // Merge dotsToFold to newDots while ignoring duplicates.
        dotsToFold.forEach(k => {
            if (newDots.indexOf(k) == -1) {
                newDots.push(k);
            }
        });
        return newDots;
    }

    function run (mode: number) {
        appOut.value = `== Phase ${mode} ==\n`;
        var readMode = 0;
        var dots = new Array<number>();
        var folds = new Array<{vertical: boolean, position: number}>();
        var width = 0;
        var height = 0;
        appIn.value.split("\n").forEach((inTxtRaw) => {
            if (!inTxtRaw || !inTxtRaw.trim()) {
                // If string is null, empty, or whitespace.
                readMode++;
                return;
            }
            var inTxt = inTxtRaw.trim();
            switch (readMode) {
                case 0:
                    // Add the coordinates to the dots by turning them into a key.
                    var coords = inTxt.split(',').map(x => parseInt(x));
                    if (coords[0] > width) {
                        width = coords[0];
                    }
                    if (coords[1] > height) {
                        height = coords[1];
                    }
                    dots.push(getKey(coords[0], coords[1]));
                    break;
                case 1:
                    // Add the fold command.
                    var command = inTxt.split('=');
                    folds.push({vertical: command[0].slice(-1) == 'x', position: parseInt(command[1])});
                    break;
            }
        });
        //appOut.value += `Size: ${width} x ${height}\n`;
        //dots.forEach(x => { var coords = getCoords(x); appOut.value += `${coords.x},${coords.y}:0x${x.toString(16)}\n`; });
        //folds.forEach(x => { appOut.value += `${x.vertical ? 'X' : "Y"}=${x.position}\n`; });
        switch (mode) {
            case 1:
                dots = fold(dots, folds[0].vertical, folds[0].position);
                appOut.value += `Output: ${dots.length}\n`;
                break;
            case 2:
                appOut.value += `This is phase 2's output.\n`;
                break;
        }
    }
};
