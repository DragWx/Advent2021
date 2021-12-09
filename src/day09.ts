namespace day09 {
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
        var output = 0
        lowCandidates.forEach(x => {
            output += x.height + 1;
            //appOut.value += `${x.x}, ${x.y}: ${x.height}\n`;
        });
        appOut.value += `Output: ${output}\n`;
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
};
