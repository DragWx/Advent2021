namespace day10 {
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
        const bracketPairs: Map<string, string> = new Map([
            ['(', ')'],
            ['[', ']'],
            ['{', '}'],
            ['<', '>']
        ]);
        const closeBracketScores: Map<string, number> = new Map([
            [')', 3],
            [']', 57],
            ['}', 1197],
            ['>', 25137]
        ])
        var score = 0;
        appIn.value.split("\n").forEach((inTxtRaw) => {
            if (!inTxtRaw || !inTxtRaw.trim()) {
                // If string is null, empty, or whitespace.
                return;
            }
            var inTxt = inTxtRaw.trim();
            var bracketStack = new Array<string>();
            for (var i = 0; i < inTxt.length; i++) {
                var inChar = inTxt.charAt(i)
                if (closeBracketScores.get(inChar) === undefined) {
                    // Not a close bracket, try open bracket.
                    var expectedBracket = bracketPairs.get(inChar);
                    if (expectedBracket !== undefined) {
                        bracketStack.push(expectedBracket);
                    }    
                } else {
                    // Close bracket. Make sure it's the expected one.
                    var expectedBracket = bracketStack.pop();
                    if (inChar != expectedBracket) {
                        // Found an unexpected closing bracket.
                        score += closeBracketScores.get(inChar);
                        return;
                    }
                }
            }
        });
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
