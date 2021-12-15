namespace day15 {
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
        var terrain = Array<Array<number>>();
        appIn.value.split("\n").forEach((inTxtRaw) => {
            if (!inTxtRaw || !inTxtRaw.trim()) {
                // If string is null, empty, or whitespace.
                return;
            }
            var inTxt = inTxtRaw.trim();
            var newRow = Array<number>();
            for (var v of inTxt) {
                newRow.push(parseInt(v));
            }
            if (newRow.length > 0) {
                terrain.push(newRow);
            }
        });
        const width = terrain[0]?.length || 0;
        const height = terrain.length;
        var getKey = function(x: number, y: number) {
            return (y * width) + x;
        }
        var getCoords = function(key: number) {
            var yComp = key - (key % width);
            return {x: key - yComp, y: yComp / width};
        }
        var distanceFromGoal = function(x: number, y: number) {
            var dX = (width-1) - x;
            var dY = (height-1) - y;
            return Math.sqrt((dX * dX) + (dY * dY));
        }
        // Draw the heightmap.
        var cxt = outCanvas.getContext("2d");
        var drawScale = 4;
        outCanvas.height = height * drawScale;
        outCanvas.width = width * drawScale;
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
        ];
        terrain.forEach((currRow, y) => {
            currRow.forEach((currCol, x) => {
                cxt.fillStyle = palette[currCol];
                cxt.fillRect(x * drawScale, y * drawScale, drawScale, drawScale);
            });
        });

        var goalKey = getKey(width-1, height-1);

        var cameFrom = new Map<number, number>();

        var openSet = new Array<number>();
        // Cost of travel from start to here.
        var travelCost = new Map<number, number>();
        // Estimated cost of travel from start to here to goal.
        var totalCost = new Map<number, number>();

        // Push top-left node.
        openSet.push(0);
        travelCost.set(0, 0);
        totalCost.set(0, distanceFromGoal(0, 0));

        while (openSet.length > 0) {
            // Find the node in openSet with the smallest totalCost.
            var curr = openSet.reduce((currMinimum, currValue) => {
                if ((totalCost.get(currMinimum) || Infinity) > (totalCost.get(currValue) || Infinity)) {
                    return currValue;
                } else {
                    return currMinimum;
                }
            }, -1);
            if (curr == goalKey) {
                break;
            }
            openSet.splice(openSet.indexOf(curr), 1);
            var currCoords = getCoords(curr);

            var neighbors = new Array<Array<number>>();
            if (currCoords.x > 0)        { neighbors.push([getKey(currCoords.x - 1, currCoords.y    ), currCoords.x - 1, currCoords.y]); }
            if (currCoords.x < width-1)  { neighbors.push([getKey(currCoords.x + 1, currCoords.y    ), currCoords.x + 1, currCoords.y]); }
            if (currCoords.y > 0)        { neighbors.push([getKey(currCoords.x,     currCoords.y - 1), currCoords.x,     currCoords.y - 1]); }
            if (currCoords.y < height-1) { neighbors.push([getKey(currCoords.x,     currCoords.y + 1), currCoords.x,     currCoords.y + 1]); }
            neighbors.forEach(currNeighbor => {
                // Calculate travel cost from start to this neighbor node.
                var myTravelCost = travelCost.get(curr) + terrain[currNeighbor[2]][currNeighbor[1]];
                if (myTravelCost < (travelCost.get(currNeighbor[0]) || Infinity)) {
                    // We've just found a better path to approach this coordinate from.
                    cameFrom.set(currNeighbor[0], curr);
                    travelCost.set(currNeighbor[0], myTravelCost);
                    totalCost.set(currNeighbor[0], myTravelCost + distanceFromGoal(currNeighbor[1], currNeighbor[2]));
                    if (openSet.indexOf(currNeighbor[0]) == -1) {
                        openSet.push(currNeighbor[0]);
                    }
                }
            });
        }

        // Get the path from the goal back to start.
        var path = [goalKey];
        var pathIterator = goalKey;
        var score = 0;
        cxt.fillStyle = "#F00";
        while (pathIterator) {
            path.push(pathIterator);
            var coords = getCoords(pathIterator);
            score += terrain[coords.y][coords.x];
            cxt.fillRect(coords.x * drawScale, coords.y * drawScale, drawScale / 2, drawScale / 2);
            pathIterator = cameFrom.get(pathIterator);
        }
        cxt.stroke();

        switch (mode) {
            case 1:
                appOut.value += `Output: ${score}\n`;
                break;
            case 2:
                appOut.value += `This is phase 2's output.\n`;
                break;
        }
    }
};
