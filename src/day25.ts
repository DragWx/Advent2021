namespace day25 {
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
    function toKey(x: number, y: number) {
        // X | (Y<<24), using multiplication because bit shifting is limited to 32 bits.
        return (x & 0xFFFFFF) + ((y & 0xFFFFFF) * 0x1000000);
    }
    function fromKey(key: number) {
        var x = key & 0xFFFFFF
        return {x: x, y: (key - x) / 0x1000000};
    }

    function run (mode: number) {
        appOut.value = `== Phase ${mode} ==\n`;
        let currRowNum = 0;
        // [east, south]
        let cucumbers = new Array<Set<number>>(2);
        let movement = [[1,0], [0,1]];
        let width = -1;
        let height = 0;
        for (let i = 0; i < cucumbers.length; i++) {
            cucumbers[i] = new Set<number>();
        }
        appIn.value.split("\n").forEach((inTxtRaw) => {
            if (!inTxtRaw || !inTxtRaw.trim()) {
                // If string is null, empty, or whitespace.
                return;
            }
            let inTxt = inTxtRaw.trim();
            for (let currColNum = 0; currColNum < inTxt.length; currColNum++) {
                switch (inTxt.charAt(currColNum)) {
                    case ">":
                        cucumbers[0].add(toKey(currColNum, height));
                        break;
                    case "v":
                        cucumbers[1].add(toKey(currColNum, height));
                        break;
                }
            }
            height++;
            if (width == -1) {
                width = inTxt.length;
            }
        });

        let steps = 0;
        let hadMovement = true;
        let canMove: boolean;
        while (hadMovement) {
            debugger;
            steps++;
            hadMovement = false;
            for (let i = 0; i < cucumbers.length; i++) {
                let newSet = new Set<number>();
                for (let c of cucumbers[i]) {
                    let pos = fromKey(c);
                    // Apply cucumber type's movement.
                    pos.x += movement[i][0];
                    if (pos.x >= width) { pos.x = 0; }
                    pos.y += movement[i][1];
                    if (pos.y >= height) { pos.y = 0; }
                    let newKey = toKey(pos.x, pos.y);

                    // Check if the destination is occupied
                    canMove = true;
                    for (let i = 0; i < cucumbers.length; i++) {
                        if (cucumbers[i].has(newKey)) {
                            canMove = false;
                            break;
                        }
                    }
                    if (canMove) {
                        hadMovement = true;
                        newSet.add(newKey);
                    } else {
                        newSet.add(c);
                    }
                }
                cucumbers[i] = newSet;
            }
        }

        switch (mode) {
            case 1:
                appOut.value += `Output: ${steps}\n`;
                break;
            case 2:
                appOut.value += `This is phase 2's output.\n`;
                break;
        }
    }
};
