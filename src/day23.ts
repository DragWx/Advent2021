namespace day23 {
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
    function toKey(to: number, from: number) {
        return (to & 0x1F) + ((from & 0x1F) << 5);
    }
    function fromKey(key: number) {
        return {to: key & 0x1F, from: (key >> 5) & 0x1F};
    }

    function run (mode: number) {
        appOut.value = `== Phase ${mode} ==\n`;
        // I'm just hardcoding the board layout, so the input scanning is just
        // going to be for getting the starting positions.
        let board = new Array<string>();
        let currStartPos = 11;
        let totalPawns = 0;
        appIn.value.split("\n").forEach((inTxtRaw) => {
            if (!inTxtRaw || !inTxtRaw.trim()) {
                // If string is null, empty, or whitespace.
                return;
            }
            var inTxt = inTxtRaw.trim();
            var matches = inTxt.match(/[A-D]/g);
            if (matches) {
                matches.forEach(x => { board[currStartPos++] = x; totalPawns++; });
            }
        });
        /*####################################
        ## 0  1  2  3  4  5  6  7  8  9  10 ##
        ####### 11 ## 12 ## 13 ## 14 #########
             ## 15 ## 16 ## 17 ## 18 ##
             ##-A--##-B--##-C--##-D--##     */
        // Positions 2, 4, 6, and 8 cannot be stopped on.
        // A pawn only has two moves:
        //    1) Move out of room
        //    2) Move into destination room
        //       a) ...if and only if room doesn't contain non-target pawns.

        // Make the first available move of the following:
        // 1. Move a pawn into a room.
        // 2. Move a pawn into the hallway.
        //    a. From [11..18], select the lowest value available, or the next value higher after backtracking.
        //    b. From [0..10], select the lowest value available, or the next value higher after backtracking.
        //       - but never 2, 4, 6, or 8.
        // 3. Backtrack.
        let pawns = new Map([
            ["A", {targets: [15, 11], energyUse: 1}],
            ["B", {targets: [16, 12], energyUse: 10}],
            ["C", {targets: [17, 13], energyUse: 100}],
            ["D", {targets: [18, 14], energyUse: 1000}]
        ]);
        let noStops = [2, 4, 6, 8];
        let currPath = Array<{to: number, from: number, energy: number}>();
        let reverse = false;
        let currPawn: {targets: Array<number>, energyUse: number};

        let totalEnergy = 0;
        let lowestEnergy = Infinity;
        let pawnsRemaining = totalPawns;

        // Scan to see if any pawns start out already solved.
        for (let currPawn of pawns) {
            for (let currSpace of currPawn[1].targets) {
                if (board[currSpace] == currPawn[0]) {
                    board[currSpace] = board[currSpace] + "!";
                    pawnsRemaining--;
                } else {
                    break;
                }
            }
        }
        let getSteps = function(to: number, from: number) {
            let currSteps = 0;
            
            // We don't want to check the starting point for occupancy, but
            // every point afterwards is fair game.            
            if (from >= 15) {
                // Deep in room.
                from -= 4;
                currSteps++;
            }
            if (from >= 11) {
                // Stepping out into hallway.
                from = (from - 10) << 1;
                currSteps++;
            }

            // These are from reverse perspective.
            if (to >= 15) {
                // Stepping deeper into room.
                if (board[to]) { return null; }
                to -= 4;
                currSteps++;
            }
            if (to >= 11) {
                // Stepping into room from hallway.
                if (board[to]) { return null; }
                to = (to - 10) << 1;
                currSteps++;
            }

            // Scan the hallway.
            if (from < to) {
                for (let i = from; i <= to; i++) {
                    if (i == from) { currSteps--; continue; }
                    if (board[i] && (i != from)) { return null; }
                }
                currSteps += to - from + 1;
            } else {
                for (let i = to; i <= from; i++) {
                    if (i == from) { currSteps--; continue; }
                    if (board[i] && (i != from)) { return null; }
                }
                currSteps += from - to + 1;
            }

            return currSteps;
        }

        let checkPawnToRoom = function() {
            for (let i = 0; i < board.length; i++) {
                if (!board[i]) {
                    continue;
                }
                // Check this pawn.
                currPawn = pawns.get(board[i]);
                if (currPawn === undefined) {
                    // This pawn doesn't need to move.
                    continue;
                }
                for (let x = 0; x < currPawn.targets.length; x++) {
                    if (!board[currPawn.targets[x]]) {
                        // Space is empty.
                        // Try to go here. If it's possible, this is the move.
                        let steps = getSteps(currPawn.targets[x], i);
                        if (steps !== null) {
                            return {to: currPawn.targets[x], from: i, energy: steps * currPawn.energyUse};
                        }
                    } else if (board[currPawn.targets[x]].length == 1) {
                        // Space is occupied by a pawn which doesn't belong in
                        // the room, therefore, this pawn isn't allowed to enter
                        // this room right now.
                        break;
                    }
                }
            }
            // No pawns can move to any rooms right now.
            return null;
        }

        let checkPawnToHallway = function(startRoomSpace: number = 11, startHallSpace: number = 0) {
            if (startHallSpace >= 11) {
                startHallSpace = 0;
                startRoomSpace++;
            }
            for (let roomSpace = startRoomSpace; roomSpace < board.length; roomSpace++) {
                if (!board[roomSpace]) {
                    continue;
                }
                // Check this pawn.
                currPawn = pawns.get(board[roomSpace]);
                if (currPawn === undefined) {
                    // This pawn doesn't need to move.
                    continue;
                }
                for (let hallSpace = startHallSpace; hallSpace < 11; hallSpace++) {
                    if ((noStops.indexOf(hallSpace) != -1) || (board[hallSpace])) {
                        // Skip this space if it's occupied or a forbidden space.
                        continue;
                    } else {
                        // Try to go here. If it's possible, this is the move.
                        let steps = getSteps(hallSpace, roomSpace);
                        if (steps !== null) {
                            return {to: hallSpace, from: roomSpace, energy: steps * currPawn.energyUse};
                        }
                        break;
                    }
                }
            }
            // No pawns can move to the hallway right now.
            return null;
        }

        while (!reverse || currPath.length) {
            if (!reverse) {
                // Going forwards.
                
                // Check if we've reached the end condition.
                if (pawnsRemaining == 0) {
                    if (totalEnergy < lowestEnergy) {
                        lowestEnergy = totalEnergy;
                    }
                    reverse = true;
                    continue;
                }
                if (totalEnergy > lowestEnergy) {
                    // Since we're interested in the lowest energy consumption,
                    // we can skip paths which grow bigger than the lowest
                    // recorded solution.
                    reverse = true;
                    continue;
                }


                // Check if someone can move into a room.
                let result: {to: number, from: number, energy: number};
                result = checkPawnToRoom();
                if (result) {
                    currPath.push(result);
                    // We'll also mark that this pawn doesn't need to move further.
                    board[result.to] = board[result.from] + "!";
                    board[result.from] = undefined;
                    totalEnergy += result.energy;
                    pawnsRemaining--;
                    continue;
                }
                
                
                // Try moving someone into the hallway.
                result = checkPawnToHallway();
                if (result) {
                    currPath.push(result);
                    board[result.to] = board[result.from];
                    board[result.from] = undefined;
                    totalEnergy += result.energy;
                    continue;
                }
                
                // No further moves are possible, start backtracking.
                reverse = true;
            } else {
                // Backtracking.

                let result = currPath.pop();
                // Undo this move, also undoing any "!" we appended.
                board[result.from] = board[result.to].charAt(0);
                board[result.to] = undefined;
                totalEnergy -= result.energy;
                if (result.to >= 11) {
                    // This was a move into a target room which we're undoing.
                    pawnsRemaining++;
                } else {
                    // This was a move into the hallway, which has multiple
                    // possibilities, so try the next one.
                    result = checkPawnToHallway(result.from, result.to + 1);
                    if (result) {
                        currPath.push(result);
                        board[result.to] = board[result.from];
                        board[result.from] = undefined;
                        totalEnergy += result.energy;
                        reverse = false;
                        continue;
                    }
                }
            }
        }

        switch (mode) {
            case 1:
                appOut.value += `Output: ${lowestEnergy}\n`;
                break;
            case 2:
                appOut.value += `This is phase 2's output.\n`;
                break;
        }
    }
};
