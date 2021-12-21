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
        var diceResult = 6;   // Dice roll always starts as `1+2+3`.
        var turns = 0;
        var winner = 0;
        while (true) {
            // Do turn
            var currPlayer = player[turns % 2];
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
        var p1Out = ((turns + 1) * 3) * player[0].score;
        switch (mode) {
            case 1:
                appOut.value += `Output: ${p1Out}\n`;
                break;
            case 2:
                appOut.value += `This is phase 2's output.\n`;
                break;
        }
    }
};
