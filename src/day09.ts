namespace day09 {
    var appIn : HTMLTextAreaElement;
    var appOut : HTMLTextAreaElement;
    var outCanvas : HTMLCanvasElement;
    export const config: object = {
        phases: 2,
        extras: ['outCanvas']
    };
    export function init (phase: number, inElement: HTMLTextAreaElement, outElement: HTMLTextAreaElement, extras: object) {
        // Get our elements of interest
        appIn = inElement;
        appOut = outElement;
        outCanvas = extras["outCanvas"];
        outCanvas.style.imageRendering = "crisp-edges";
        return run;
    }

    function run (mode: number) {
        appOut.value = `== Phase ${mode} ==\n`;
        var heightMap = Array<Array<number>>();
        var currRowNum = 0;
        var lowCandidates = Array<{x: number, y: number, height: number}>();
        appIn.value.split("\n").forEach((currValue) => {
            if (!currValue) {
                return;
            }
            var currRowTxt = currValue.trim();
            
            // We're going to compute the low points as we read the data in.
            // The current cell is the bottom neighbor of the cell we're checking.
            var prevRow: Array<number>;
            var checkRow: Array<number>;
            if (heightMap.length >= 1) {
                checkRow = heightMap[heightMap.length - 1];
            }
            if (heightMap.length >= 2) {
                prevRow = heightMap[heightMap.length - 2];
            }
            var newRow = new Array<number>();
            for (var i = 0; i < currRowTxt.length; i++) {
                // Parse current cell, add to row.
                var currCell = parseInt(currRowTxt.charAt(i));
                newRow.push(currCell);
                
                if (checkRow) {
                    if (checkCell(prevRow, checkRow, newRow, i)) {
                        lowCandidates.push({x: i, y: currRowNum-1, height: checkRow[i]});
                    }
                }
            }
            currRowNum++;
            heightMap.push(newRow);
        });
        // Check bottom row.
        var checkRow: Array<number> = heightMap[heightMap.length - 1];
        var prevRow: Array<number>;
        if (heightMap.length > 1) {
            prevRow = heightMap[heightMap.length - 2];
        }
        for (var i = 0; i < checkRow.length; i++) {
            if (checkCell(prevRow, checkRow, undefined, i)) {
                lowCandidates.push({x: i, y: heightMap.length - 1, height: checkRow[i]});
            }
        }

        switch (mode) {
            case 1:
                // If phase 1, we're done.
                var output = 0
                lowCandidates.forEach(x => {
                    output += x.height + 1;
                    //appOut.value += `${x.x}, ${x.y}: ${x.height}\n`;
                });
                appOut.value += `Output: ${output}\n`;
                break;
            case 2:
                var basins = Array<Array<{x: number, y: number}>>();
                // Now use the floodfill algorithm on all of the low points.
                // I'm trusting that each low point is bounded by 9's such that
                // exactly one low point exists in each bounded region.
                lowCandidates.forEach(x => {
                    basins.push(floodFill(heightMap, x.x, x.y));
                });
                /*basins.forEach(x => {
                    appOut.value += `${x[0].x}, ${x[0].y}: ${x.length}\n`;
                })*/
                basins.sort((a, b) => a.length - b.length);
                var output = 1;
                basins.slice(-3).forEach(x => output *= x.length);
                appOut.value += `Output: ${output}`;
                break;
        }

        if (outCanvas) {
            var getColorFromHex = function (colorHex: string) {
                // Convert from #RRGGBB... to decimal values [R, G, B, ...]
                var channels = [];
                for (var i = 0; i < 4; i++) {
                    if ((i * 2) >= colorHex.length - 1) { break; }
                    channels.push(parseInt(colorHex.substr(1 + (i * 2),2), 16) / 255);
                }
                return channels;
            }
            
            var getHexFromColor = function (color: Array<number>) {
                // Convert from [R, G, B, ...] to hex #RRGGBB...
                var out = "#";
                color.forEach(currChn => {
                    if (currChn > 1) {
                        currChn = 1;
                    } else if (currChn < 0) {
                        currChn = 0;
                    }
                    var currHex = Math.floor(currChn * 255).toString(16);
                    out += (currHex.length < 2 ? "0" : "") + currHex;
                });
                return out;
            }
            
            var combineColors = function (color: string, target: string) {
                // Blend color to target
                var channels = getColorFromHex(color);
                var tgtChannels = getColorFromHex(target);
                for (var i = 0; i < 3; i++) {
                    channels[i] = (channels[i] * (tgtChannels[i] * 2));
                }
                return getHexFromColor(channels);
            }
            var cxt = outCanvas.getContext("2d");
            outCanvas.height = heightMap.length;
            outCanvas.width = heightMap[0].length;
            const palette = [
                "#000000",
                "#111111",
                "#222222",
                "#333333",
                "#444444",
                "#555555",
                "#666666",
                "#888888",
                "#AAAAAA",
                "#DDDDDD"
            ]
            const hues = [
                "#AA2222",
                "#AA8833",
                "#118822",
                "#2288AA",
                "#4444AA",
                "#BB11DD"
            ]
            switch (mode) {
                case 1:
                    heightMap.forEach((currRow, y) => {
                        currRow.forEach((currCol, x) => {
                            cxt.fillStyle = palette[currCol];
                            cxt.fillRect(x, y, 1, 1);
                        });
                    });
                    cxt.fillStyle = "#F00";
                    lowCandidates.forEach(point => {
                        cxt.fillRect(point.x, point.y, 1, 1);
                    });
                    break;
                case 2:
                    basins.forEach((basin, i) => {
                        var currColor = Math.floor(Math.random() * hues.length);
                        basin.forEach(point => {
                            cxt.fillStyle = combineColors(palette[heightMap[point.y][point.x]], hues[currColor]);
                            cxt.fillRect(point.x, point.y, 1, 1);
                        });
                    });
                    break;
            }
        }
    }
    function checkCell(topRow: Array<number>, middleRow: Array<number>, bottomRow: Array<number>, x: number) {
        if (((!bottomRow)                || (middleRow[x] < bottomRow[x]))   // Bottom neighbor
        &&  ((x == middleRow.length - 1) || (middleRow[x] < middleRow[x+1])) // Right neighbor
        &&  ((x < 1)                     || (middleRow[x] < middleRow[x-1])) // Left neighbor
        &&  ((!topRow)                   || (middleRow[x] < topRow[x]))) {   // Top neighbor
            return true;
        }
        return false;
    }
    function floodFill(map: Array<Array<number>>, x: number, y: number) {
        const queue = new Array<{x: number, y: number}>();
        const result = new Array<{x: number, y: number}>();
        const test = function(x: number, y: number) {
            if ((map[currCell.y][currCell.x] != 9) && (result.find(cell => (cell.x == x) && (cell.y == y)) === undefined)) {
                return true;
            }
            return false;
        }
        queue.push({x: x, y: y});
        while (queue.length > 0) {
            var currCell = queue.pop();
            if (test(currCell.x, currCell.y)) {
                result.push({x: currCell.x, y: currCell.y});
                if (currCell.x > 0)                          { queue.push({x: currCell.x - 1, y: currCell.y}) };
                if (currCell.x < map[currCell.y].length - 1) { queue.push({x: currCell.x + 1, y: currCell.y}) };
                if (currCell.y > 0)                          { queue.push({x: currCell.x, y: currCell.y - 1}) };
                if (currCell.y < map.length - 1)             { queue.push({x: currCell.x, y: currCell.y + 1}) };
            }
        }
        return result;
    }
};
