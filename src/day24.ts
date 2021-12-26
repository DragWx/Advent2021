namespace day24 {
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
    enum opcode {
        inp, add, mul, div, mod, eql
    }
    class Operation {
        // Operation to perform: dest <-(op)-- in
        public op: opcode;
        // Destination of the operation
        public dest: number;
        // Input of the operation
        public in: number;
        // If TRUE, `in` is a register number. Otherwise, `in` is a number literal.
        public indirect: boolean;
    }
    function run (mode: number) {
        appOut.value = `== Phase ${mode} ==\n`;
        let program = new Array<Operation>();
        let registerMap = new Map<string, number>([
            ["w", 0],
            ["x", 1],
            ["y", 2],
            ["z", 3],
        ]);
        appIn.value.split("\n").forEach((inTxtRaw) => {
            if (!inTxtRaw || !inTxtRaw.trim()) {
                // If string is null, empty, or whitespace.
                return;
            }
            let inTxt = inTxtRaw.trim().split(/\s/);
            let newOp = new Operation();
            newOp.op = opcode[inTxt[0]];
            if (newOp.op == undefined) {
                return;
            }
            newOp.dest = registerMap.get(inTxt[1]);
            if (registerMap.has(inTxt[2])) {
                newOp.in = registerMap.get(inTxt[2]);
                newOp.indirect = true;
            } else {
                if (inTxt[2] === undefined) {
                    newOp.in = null;
                } else {
                    newOp.in = parseInt(inTxt[2]);
                }
                newOp.indirect = false;
            }
            program.push(newOp);            
        });

        let relLine = 0;
        let digitNum = 0;
        let analysis = new Array<Array<number>>();
        let currAnalysis = new Array<number>();
        let zStack = new Array<number>();
        for (let instruction of program) {
            if (instruction.op == opcode.inp) {
                relLine = 0;
                if (currAnalysis.length > 0) {
                    analysis.push(currAnalysis);
                    currAnalysis = new Array<number>();
                    digitNum++;
                }
            }
            switch (relLine) {
                case 4:
                    if (instruction.in == 1) {
                        zStack.push(digitNum);
                        currAnalysis.push(-1);
                    } else {
                        currAnalysis.push(zStack.pop());
                    }
                    break;
                case 5:
                    currAnalysis.push(instruction.in);
                    break;
                case 15:
                    currAnalysis.push(instruction.in);
                    break;
            }
            relLine++;
        }
        if (currAnalysis.length > 0) {
            analysis.push(currAnalysis);
        }
        let serial = Array<number>(analysis.length);
        switch (mode) {
            case 1:
                for (let i = 0; i < analysis.length; i++) {
                    if (analysis[i][0] != -1) {
                        var relation = analysis[analysis[i][0]][2] + analysis[i][1];
                        appOut.value += `d${analysis[i][0]} + ${relation} == d${i}\n`;
                        if (relation > 0) {
                            serial[i] = 9;
                            serial[analysis[i][0]] = 9 - relation;
                        } else {
                            serial[i] = 9 + relation;
                            serial[analysis[i][0]] = 9;
                        }
                    }
                }
                appOut.value += `Output: ${serial.join('')}\n`;
                break;
            case 2:
                for (let i = 0; i < analysis.length; i++) {
                    if (analysis[i][0] != -1) {
                        var relation = analysis[analysis[i][0]][2] + analysis[i][1];
                        appOut.value += `d${analysis[i][0]} + ${relation} == d${i}\n`;
                        if (relation > 0) {
                            serial[i] = 1 + relation;
                            serial[analysis[i][0]] = 1;
                        } else {
                            serial[i] = 1;
                            serial[analysis[i][0]] = 1 - relation;
                        }
                    }
                }
                appOut.value += `Output: ${serial.join('')}\n`;
                break;
        }
    }
};
/*
-1-
inp w       ; W = Serial[0]             = [1..9]
mul x 0     ;   X = 0
add x z     ;   X = Z                   = 0
mod x 26    ;   X = Z % 26              = 0
div z 1     ;   nop
add x 12    ;   X = (Z % 26) + 12       = 12
eql x w     ;   X = (X == W) ? 1 : 0    = 0     (because  W == [1..9])
eql x 0     ; X = (X == 0) ? 1 : 0      = 1
mul y 0     ;   Y = 0
add y 25    ;   Y = 25
mul y x     ;   nop (because X = 1)
add y 1     ; Y++                       = 26
mul z y     ; Z *= Y (1)                 = 0     (because Z == 0)
mul y 0     ;   Y = 0
add y w     ;   Y = W                   = Serial[0] [1..9]
add y 15    ; Y = Serial[0] + 15        = [16..24]
mul y x     ;   nop (because X = 1)
add z y     ; Z = Serial[0] + 15        = [16..24]

-2-
inp w       ; W = Serial[1]             = [1..9]
mul x 0     ;   X = 0
add x z     ;   X = Serial[0] + 15      = [16..24]
mod x 26    ;   X = (Serial[0] + 15) % 26 = nop because 26 > [16..24]
div z 1     ;   nop
add x 14    ;   X = Serial[0] + 29      = [30..39]
eql x w     ;   X = (X == W) ? 1 : 0    = 0     (because [30..39] doesn't overlap [1..9])
eql x 0     ; X = (X == 0) ? 1 : 0      = 1
mul y 0     ;   Y = 0
add y 25    ;   Y = 25
mul y x     ;   nop because X = 1
add y 1     ; Y = 26
mul z y     ; Z = (Serial[0] + 15) * 26 = [416, 442, 468, ..., 624]
mul y 0     ;   Y = 0
add y w     ;   Y = Serial[1]           = [1..9]
add y 12    ; Y = Serial[1] + 12        = [13..21]
mul y x     ;   nop because X = 1
add z y     ; Z = ((Serial[0] + 15) * 26)  +  (Serial[1] + 12)

-3-
inp w       ; W = Serial[2]             = [1..9]
mul x 0     ;   X = 0
add x z     ;   X = ((Serial[0] + 15) * 26) + (Serial[1] + 12)
mod x 26    ; X = Serial[1] + 12        <- (((Serial[0] + 15) * 26) + (Serial[1] + 12)) % 26
div z 1     ;   nop
add x 11    ;   X = Serial[1] + 23      = [24..32]
eql x w     ;   X = (X == W) ? 1 : 0    = 0     (because [24.32] doesn't overlap [1..9])
eql x 0     ; X = (X == 0) ? 1 : 0      = 1
mul y 0     ;   Y = 0
add y 25    ;   Y = 25
mul y x     ;   nop (X = 1)
add y 1     ; Y = 26
mul z y     ; Z = (((Serial[0] + 15) * 26) + (Serial[1] + 12)) * 26
mul y 0     ;   Y = 0
add y w     ;   Y = Serial[2]
add y 15    ;   Y = Serial[2] + 15
mul y x     ;   nop (X = 1)
add z y     ; Z = ((((Serial[0] + 15) * 26) + (Serial[1] + 12)) * 26) + (Serial[2] + 15)

-4-
inp w       ; W = Serial[3]             = [1..9]
mul x 0     ;   X = 0
add x z     ;   X = ((((Serial[0] + 15) * 26) + (Serial[1] + 12)) * 26) + (Serial[2] + 15)
mod x 26    ; X = Serial[2] + 15
div z 26    ; Z = ((Serial[0] + 15) * 26) + (Serial[1] + 12)
add x -9    ;   X = Serial[2] + 6
eql x w     ;   X = (Serial[2] + 6) == (Serial[3]) ? 1 : 0
eql x 0     ; X = (Serial[2] + 6) != (Serial[3]) ? 1 : 0
mul y 0
add y 25    ; Y = 25
mul y x
add y 1     ; Y = (Serial[2] + 6) != (Serial[3]) ? 26 : 1
mul z y     ; Z = (Serial[2] + 6) != (Serial[3]) ?   (((Serial[0] + 15) * 26) + (Serial[1] + 12)) * 26   :   ((Serial[0] + 15) * 26) + (Serial[1] + 12)
mul y 0
add y w     ;   Y = Serial[3]
add y 12    ;   Y = Serial[3] + 12
mul y x     ; Y = (Serial[2] + 6) != (Serial[3]) ? (Serial[3] + 12) : 0
add z y     ; Z = (Serial[2] + 6) != (Serial[3]) ? ((((Serial[0] + 15) * 26) + (Serial[1] + 12)) * 26) + (Serial[3] + 12)    :    ((Serial[0] + 15) * 26) + (Serial[1] + 12)


Z is like a stack, where every element is (* 26).
    - Push: Z = (Z * 26) + new
    - Peek: Z = Z % 26
    - Pop:  Z = Z / 26      // Truncation drops the top element.

The serial input is pushed onto Z along with a random constant `Y_Const`.
After reading from serial:
    if Z is popped, a random negative constant `X_Const` is added to it
        (forming `serial + Y_Const - X_Const`).
        This is checked against the current serial digit for a match.
    if Z is NOT popped, some redundant operations happen, and when
        checked against the current serial digit, it never matches.
    If a match did NOT happen, `serial + Y-Const` is pushed onto Z.
The program needs to finish with Z == 0. That means, there can't be anything
pushed onto it, so all matches need to take the "matched" path.



When a new input is read into W:
    Z is peeked onto X.
    Z is either popped or left alone:
        If left alone (`div z 1`):
            A constant > 9 is added to X.
        If popped (`div z 26`):
            A constant < 0 (X_Const) is added to X.
    X is checked against W.
        If Z was left alone, this will never match.
        If Z was popped, this may match.
    If (X == W)
        Push W + Y_Const onto Z.
        

*/
