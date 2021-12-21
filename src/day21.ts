namespace day21 {
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
        var player = Array<{position: number, score: number}>();
        appIn.value.split("\n").forEach((inTxtRaw) => {
            if (!inTxtRaw || !inTxtRaw.trim()) {
                // If string is null, empty, or whitespace.
                return;
            }
            var inTxt = inTxtRaw.trim();
            var r = inTxt.match(/^Player \d+ starting position: (\d+)/);
            if (r) {
                var startPosition = parseInt(r[1]);
                if (!isNaN(startPosition)) {
                    player.push({position: startPosition, score: 0});
                }
            }
        });
        switch (mode) {
            case 1:
                let diceResult = 6;   // Dice roll always starts as `1+2+3`.
                let turns = 0;
                let winner = 0;
                while (true) {
                    // Do turn
                    let currPlayer = player[turns % 2];
                    currPlayer.position = ((currPlayer.position + diceResult - 1) % 10) + 1;
                    currPlayer.score += currPlayer.position;
                    if ((winner = player.findIndex(x => x.score >= 1000)) != -1) {
                        break;
                    }
                    // Next dice roll
                    turns++;
                    diceResult = diceResult ? diceResult - 1 : 9;
                }
                player.splice(winner, 1);
                let p1Out = ((turns + 1) * 3) * player[0].score;
                appOut.value += `Output: ${p1Out}\n`;
                break;
            case 2:
                /*
                Get combinations first, then permutations of those combinations, then merge by sum.
                -- One number --
                3 = 111
                6 = 222
                9 = 333

                -- Two numbers --
                4 = 112, 121, 211
                5 = 113, 131, 311
                5 = 221, 212, 122
                7 = 223, 232, 322
                7 = 331, 313, 133
                8 = 332, 323, 233

                -- Three numbers --
                6 = 123, 132, 312, 321, 231, 213

                -- Incidence --
                3 (1)= 111
                4 (3)= 112, 121, 211
                5 (6)= 113, 131, 311, 221, 212, 122
                6 (7)= 222, 123, 132, 312, 321, 231, 213
                7 (6)= 223, 232, 322, 331, 313, 133
                8 (3)= 332, 323, 233
                9 (1)= 333
                */

                const universes = [1, 3, 6, 7, 6, 3, 1];
                // We need to find all possible "paths" to get to a state where
                // one player has a score >= 21. This is just like day 12, but
                // simpler because it's a 7-ary tree and all of our operations
                // are mathematically reversible.

                let wins = Array<number>(player.length).fill(0);
                
                let currPath = Array<number>();
                let reverse = false;
                while (!reverse || currPath.length) {
                    let currTurn = currPath.length;
                    let currPlayerNum = currTurn % 2;
                    let currPlayer = player[currPlayerNum];
                    if (!reverse) {
                        // New turn. Push a roll of 3.
                        currPath.push(3);
                    } else {
                        // Undo turn, then try the next possible roll, if any.
                        let roll = currPath.pop();
                        // Need to update these now.
                        currTurn = currPath.length;
                        currPlayerNum = currTurn % 2;
                        currPlayer = player[currPlayerNum];
                        
                        // Undo score and movement for current player.
                        currPlayer.score -= currPlayer.position;
                        currPlayer.position = ((currPlayer.position - roll + 9) % 10) + 1;
                            
                        if (roll < 9) {
                            // Still more possibilities, roll the next one.
                            currPath.push(roll + 1);
                            reverse = false;
                        } else {
                            // No more possibilities to roll, we're done with
                            // this branch, so go back even further.
                            continue;
                        }
                    }
                    // Now carry out the turn.
                    let diceResult = currPath[currPath.length - 1];
                    currPlayer.position = ((currPlayer.position + diceResult - 1) % 10) + 1;
                    currPlayer.score += currPlayer.position;

                    if (currPlayer.score >= 21) {
                        // If the player just won, record the win, but keep in
                        // mind how many universes have this same order of rolls.
                        let parallelUniverses = currPath.map(x => universes[x - 3]).reduce((p, v) => p * v, 1);
                        wins[currPlayerNum] += parallelUniverses;
                        // Now indicate that we go *back* from here.
                        reverse = true;
                    }
                }
                wins.sort((a,b) => b - a);

                appOut.value += `Output: ${wins[0]}\n`;
                break;
        }
    }
};
