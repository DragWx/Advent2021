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
             ## 19 ## 20 ## 21 ## 22 ##
             ## 23 ## 24 ## 25 ## 26 ##
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
        let checkSpaces = [0, 1, 3, 5, 7, 9, 10, -1, -1, -1, -1];
        let pawns = new Map([
            ["A", {targetRoom: 0, energyUse: 1}],
            ["B", {targetRoom: 1, energyUse: 10}],
            ["C", {targetRoom: 2, energyUse: 100}],
            ["D", {targetRoom: 3, energyUse: 1000}]
        ]);
        let rooms = new Array(
            {spaces: [11], top: 0, numGuests: 0, checkSpacesNum: 7},
            {spaces: [12], top: 0, numGuests: 0, checkSpacesNum: 8},
            {spaces: [13], top: 0, numGuests: 0, checkSpacesNum: 9},
            {spaces: [14], top: 0, numGuests: 0, checkSpacesNum: 10}
        )
        // Add an additional level of depth to each room for each extra row of
        // pawns scanned.
        for (let i = 0; i < rooms.length; i++) {
            for (let x = 1; x < (totalPawns / 4); x++) {
                rooms[i].spaces.unshift(rooms[i].spaces[0] + 4);
            }
            rooms[i].top = rooms[i].spaces.length;
            rooms[i].numGuests = rooms[i].spaces.length;
            checkSpaces[rooms[i].checkSpacesNum] = rooms[i].spaces[rooms[i].top - 1];
        }

        let currPath = Array<{to: number, from: number, energy: number}>();
        let reverse = false;
        let currPawn: {targetRoom: number, energyUse: number};
        let currRoom: {spaces: Array<number>, top: number, numGuests: number, checkSpacesNum: number};

        let totalEnergy = 0;
        let lowestEnergy = Infinity;
        let pawnsRemaining = totalPawns;

        // Scan to see if any pawns start out already solved.
        for (let currPawn of pawns) {
            currRoom = rooms[currPawn[1].targetRoom];
            for (let currSpace of currRoom.spaces) {
                if (board[currSpace] == currPawn[0]) {
                    board[currSpace] = board[currSpace] + "!";
                    pawnsRemaining--;
                    currRoom.numGuests--;
                    if (currRoom.numGuests == 0) {
                        checkSpaces[currRoom.checkSpacesNum] = -1;
                    }
                } else {
                    break;
                }
            }
        }
        let getSteps = function(to: number, from: number) {
            let currSteps = 0;
            
            // We don't want to check the starting point for occupancy, but
            // every point afterwards is fair game.            
            while (from >= 15) {
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
            while (to >= 15) {
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
                    if (i == from) { continue; }
                    if (board[i] && (i != from)) { return null; }
                }
                currSteps += to - from;
            } else {
                for (let i = to; i <= from; i++) {
                    if (i == from) { continue; }
                    if (board[i] && (i != from)) { return null; }
                }
                currSteps += from - to;
            }

            return currSteps;
        }

        let checkPawnToRoom = function() {
            for (let x = 0; x < checkSpaces.length; x++) {
                let i = checkSpaces[x];
                if ((i == -1) || !board[i]) {
                    continue;
                }
                // Check this pawn.
                currPawn = pawns.get(board[i]);
                currRoom = rooms[currPawn.targetRoom];
                if (currRoom.numGuests == 0) {
                    // Room only has target pawns in it, so this pawn is allowed
                    // to move into it.
                    let steps = getSteps(currRoom.spaces[currRoom.top], i);
                    if (steps !== null) {
                        let result = {to: currRoom.spaces[currRoom.top], from: i, energy: steps * currPawn.energyUse};
                        // Push this move.
                        currPath.push(result);
                        // Move the pawn to the new space
                        board[result.to] = board[result.from] + "!";
                        board[result.from] = undefined;
                        totalEnergy += result.energy;
                        // Update helper variables
                        pawnsRemaining--;
                        currRoom.top++;
                        checkSpaces[currRoom.checkSpacesNum] = (currRoom.numGuests == 0) ? -1 : currRoom.spaces[currRoom.top - 1];
                        if (x >= 7) {
                            // Pawn moved from another room, so make sure to update that room too.
                            currRoom = rooms[x - 7];
                            currRoom.numGuests--;
                            currRoom.top--;
                            checkSpaces[currRoom.checkSpacesNum] = (currRoom.numGuests == 0) ? -1 : currRoom.spaces[currRoom.top - 1];
                        }
                        return true;
                    }
                }
            }
            // No pawns can move to any rooms right now.
            return false;
        }

        let checkPawnToHallway = function(lastRoomSpace: number = 11, lastHallSpace: number = -1) {
            lastRoomSpace = (lastRoomSpace - 11) & 3;
            if (lastHallSpace >= 0) {
                // Move to next checkable space.
                lastHallSpace = checkSpaces.indexOf(lastHallSpace) + 1;
            } else {
                // If this is the first check of the path, start at the first hall space.
                lastHallSpace = 0;
            }
            if (lastHallSpace >= 7) {
                // When we move past the end of the hall, go back to space 0 and check the next room.
                lastHallSpace = 0;
                lastRoomSpace++;
            }
            for (let roomNum = lastRoomSpace; roomNum < 4; roomNum++) {
                currRoom = rooms[roomNum];
                let roomSpace = checkSpaces[currRoom.checkSpacesNum];
                if (roomSpace == -1) {
                    continue;
                }
                // Check this pawn.
                currPawn = pawns.get(board[roomSpace]);
                for (let checkSpaceNum = lastHallSpace; checkSpaceNum < 7; checkSpaceNum++) {
                    let hallSpace = checkSpaces[checkSpaceNum];
                    if (board[hallSpace]) {
                        // Skip this space if it's occupied.
                        continue;
                    } else {
                        // Try to go here. If it's possible, this is the move.
                        let steps = getSteps(hallSpace, roomSpace);
                        if (steps !== null) {
                            let result = {to: hallSpace, from: roomSpace, energy: steps * currPawn.energyUse};
                            // Push this move
                            currPath.push(result);
                            // Move the pawn to the new space
                            board[result.to] = board[result.from];
                            board[result.from] = undefined;
                            totalEnergy += result.energy;
                            // Update helper variables
                            currRoom.numGuests--;
                            currRoom.top--;
                            checkSpaces[currRoom.checkSpacesNum] = (currRoom.numGuests == 0) ? -1 : currRoom.spaces[currRoom.top - 1];
                            return true;
                        }
                    }
                }
                lastHallSpace = 0;
            }
            // No pawns can move to the hallway right now.
            return false;
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
                if (checkPawnToRoom()) {
                    continue;
                }
                
                
                // Try moving someone into the hallway.
                if (checkPawnToHallway()) {
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
                if (result.from >= 11) {
                    // This was a "guest" pawn moving out of a room, either to
                    // the hallway or to their home room.
                    currRoom = rooms[(result.from - 11) & 3];
                    currRoom.top++;
                    currRoom.numGuests++;
                    checkSpaces[currRoom.checkSpacesNum] = (currRoom.numGuests == 0) ? -1 : currRoom.spaces[currRoom.top - 1];
                }
                if (result.to >= 11) {
                    // This was a pawn moving into their home room, either from
                    // the hallway or from another room.
                    pawnsRemaining++;
                    currRoom = rooms[(result.to - 11) & 3];
                    currRoom.top--;
                    checkSpaces[currRoom.checkSpacesNum] = (currRoom.numGuests == 0) ? -1 : currRoom.spaces[currRoom.top - 1];
                } else {
                    // This was a move into the hallway. We now need to examine
                    // the next possibility of a pawn moving into a hallway.
                    if (checkPawnToHallway(result.from, result.to)) {
                        reverse = false;
                        continue;
                    }
                }
            }
        }
        appOut.value += `Output: ${lowestEnergy}\n`;
    }
};
