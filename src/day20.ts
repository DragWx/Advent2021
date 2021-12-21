namespace day20 {
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
    function toKey(x: number, y: number) {
        // X | (Y<<24), using multiplication because bit shifting is limited to 32 bits.
        // Handles the sign bits now.
        return (x + 0x800000) + ((y + 0x800000) * 0x1000000);
    }
    function fromKey(key: number) {
        var x = (key & 0xFFFFFF);
        var y = (key - x) / 0x1000000;
        return {x: x - 0x800000, y: y - 0x800000};
    }
    function getBit(input: Array<number>, bitNum: number) {
        var bitIndex = bitNum & 0x1F;
        var index = bitNum >>> 5;
        return ((input[index] || 0) & BIT_HELP[bitIndex]) != 0;
    };
    // Index = bit number.  [02] => 00100000...
    const BIT_HELP: Array<number> = function() {
        var currBit = 0x80000000;
        var output = new Array<number>(32);
        for (var i = 0; i < output.length; i++) {
            output[i] = currBit;
            currBit >>>= 1;
        }
        return output;
    }();
    // Index = bit number.  [02] => 11011111...
    const MASK_HELP = BIT_HELP.map(x => x ^ 0xFFFFFFFF);
    function run (mode: number) {
        appOut.value = `== Phase ${mode} ==\n`;
        var readMode = 0;
        var lookup = new Array<number>(16).fill(0);
        var bitmap = new Set<number>();
        var bitmapSize = {width: 0, height: 0, dotCount: 0};
        let currBitmapLine = 0;
        appIn.value.split("\n").forEach((inTxtRaw) => {
            if (!inTxtRaw || !inTxtRaw.trim()) {
                // If string is null, empty, or whitespace.
                readMode++;
                return;
            }
            let inTxt = inTxtRaw.trim();
            switch (readMode) {
                case 0:
                    // Lookup
                    let currBitPos = 0
                    let currCharPos = 0;
                    for (let c of inTxt) {
                        if (c == '#') {
                            lookup[currCharPos] |= BIT_HELP[currBitPos];
                        }
                        currBitPos++;
                        if (currBitPos >= BIT_HELP.length) {
                            currBitPos = 0;
                            currCharPos++;
                        }
                    }
                    break;
                case 1:
                    // Bitmap
                    let currKey = toKey(0,currBitmapLine);
                    for (let c of inTxt) {
                        if (c == '#') {
                            bitmap.add(currKey);
                        }
                        currKey++;
                    }
                    currBitmapLine++;
                    if (!bitmapSize.width) {
                        bitmapSize.width = inTxt.length;
                    }
                    break;
            }
        });
        bitmapSize.height = currBitmapLine;
        let border = 0;

        let numIterations = 2;
        if (mode == 2) {
            numIterations = 50;
        }
        for (let i = 0; i < numIterations; i++) {
            let buffer = new Set<number>();
            bitmapSize.dotCount = 0;
            for (let y = 0; y < bitmapSize.height+2; y++) {
                // We only need to completely fill the matrix at the start of each line.
                let currKey = toKey(0, y);
                let currMatrix = 0;
                currMatrix |= bitmap.has(currKey - 0x2000000) ? BIT_HELP[25] : 0;
                currMatrix |= bitmap.has(currKey - 0x1000000) ? BIT_HELP[28] : 0;
                currMatrix |= bitmap.has(currKey) ? BIT_HELP[31] : 0;

                if (border) {
                    currMatrix |= 0b110110110;
                }

                // currKey points at bottom right of window.
                for (let x = 0; x < bitmapSize.width+2; x++) {
                    if (border) {
                        if (y == 0) {
                            currMatrix |= 0b111111000;
                        } else if (y == 1) {
                            currMatrix |= 0b111000000;
                        }
                        
                        if (y == bitmapSize.height) {
                            currMatrix |= 0b000000111;
                        } else if (y == bitmapSize.height + 1) {
                            currMatrix |= 0b000111111;
                        }
                    }
                    //appOut.value += `${currMatrix.toString(2)}\n`;
                    if (getBit(lookup, currMatrix)) {
                        buffer.add(currKey);
                        bitmapSize.dotCount++;
                    }
                    currMatrix = (currMatrix << 1) & 0b110110110;   // Shift pixels over one
                    currKey++;  // Move right one

                    if (x >= bitmapSize.width-1) {
                        // When we approach the border, start showing it
                        if (border) {
                            currMatrix |= 0b001001001;
                        }
                    } else {
                        currMatrix |= bitmap.has(currKey - 0x2000000) ? BIT_HELP[25] : 0;   // Top right
                        currMatrix |= bitmap.has(currKey - 0x1000000) ? BIT_HELP[28] : 0;   // Center right
                        currMatrix |= bitmap.has(currKey            ) ? BIT_HELP[31] : 0;   // Bottom right    
                    }
                }
            }

            bitmap = buffer;
            bitmapSize.width += 2;
            bitmapSize.height += 2;
            if (border) {
                border = getBit(lookup, 511) ? 1 : 0;
            } else {
                border = getBit(lookup, 0) ? 1 : 0;
            }
        }

        let drawSize = 4;
        outCanvas.width = (bitmapSize.width) * drawSize;
        outCanvas.height = (bitmapSize.height) * drawSize;
        let ctx = outCanvas.getContext("2d");
        ctx.fillStyle = "#AAA";
        bitmap.forEach(k => {
            var coords = fromKey(k);
            ctx.fillRect(coords.x * drawSize, coords.y * drawSize, drawSize, drawSize);
        });

        appOut.value += `Output: ${bitmapSize.dotCount}\n`;

    }
};
