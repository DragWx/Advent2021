namespace day11 {
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
        var grid = Array<Array<number>>();
        var hasFlashed = Array<{x: number, y: number}>();
        var wasFlashedOn = Array<{x: number, y: number}>();
        var flashCount = 0;
        appOut.value = `== Phase ${mode} ==\n`;
        appIn.value.split("\n").forEach((inTxtRaw) => {
            if (!inTxtRaw || !inTxtRaw.trim()) {
                // If string is null, empty, or whitespace.
                return;
            }
            var inTxt = inTxtRaw.trim();

            var newRow = Array<number>();
            for (var i = 0; i < inTxt.length; i++) {
                newRow.push(parseInt(inTxt.charAt(i)));
            }
            grid.push(newRow);
        });

        var flashOn = function (x: number, y: number) {
            if ((y >= 0) && (x >= 0) && (y < grid.length) && (x < grid[y].length)) {
                wasFlashedOn.push({x, y});
            }
        }
        // Update an octopus.
        var runOctopus = function (x: number, y: number, value: number) {
            if (value == 9) {
                // Time to flash!
                hasFlashed.push({x, y});
                flashOn(x-1, y-1);
                flashOn(x-1, y);
                flashOn(x-1, y+1);
                flashOn(x, y-1);
                flashOn(x, y+1);
                flashOn(x+1, y-1);
                flashOn(x+1, y);
                flashOn(x+1, y+1);
            }
            return value + 1;
        }

        for (var i = 0; i < 100; i++) {
            // First, clock every octopus.
            grid.forEach((currRow, y) => {
                currRow.forEach((currCell, x) => {
                    grid[y][x] = runOctopus(x, y, currCell);
                });
            });

            // Next, keep going through `wasFlashedOn` until empty.
            while (wasFlashedOn.length > 0) {
                var octopus = wasFlashedOn.pop();
                grid[octopus.y][octopus.x] = runOctopus(octopus.x, octopus.y, grid[octopus.y][octopus.x]);
            }

            // Once everyone's done flashing, count how many flashed and reset them
            // all back to 0.
            flashCount += hasFlashed.length;
            hasFlashed.forEach(octo => { grid[octo.y][octo.x] = 0; });
            hasFlashed.length = 0;
        }

        switch (mode) {
            case 1:
                grid.forEach(currRow => {
                    appOut.value += `${currRow.join('')}\n`;
                })
                appOut.value += `Output: ${flashCount}\n`;
                break;
            case 2:
                appOut.value += `This is phase 2's output.\n`;
                break;
        }
    }
};
