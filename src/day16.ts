namespace day16 {
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
        var inTxt = appIn.value.split("\n")[0].trim();
        var currCharPos = 0;
        var bitBuffer = 0;  // This buffer will never contain more than 3 bits.
        var bitBufferLen = 0;   // This will never be > 3.
        var p1Score = 0;
        var getBits = function (numBits: number) {
            var output = 0;

            // Consume bit buffer if there are bits in it.
            var bufferBitsNeeded = Math.min(bitBufferLen, numBits);
            if (bufferBitsNeeded) {
                output = (output << bitBufferLen) | (bitBuffer >> (3 - bufferBitsNeeded));
                bitBufferLen -= bufferBitsNeeded;
                bitBuffer = (bitBuffer << bufferBitsNeeded) & 0x7;
                numBits -= bufferBitsNeeded;
            }

            // After consuming bit buffer, try consuming full characters.
            var numCharsNeeded = Math.floor(numBits / 4);
            if (numCharsNeeded) {
                var numBitsUsed = numCharsNeeded * 4
                var valueFromStream = parseInt(inTxt.slice(currCharPos, currCharPos + numCharsNeeded), 16);
                output = (output << numBitsUsed) | valueFromStream;
                numBits -= numBitsUsed;
                currCharPos += numCharsNeeded;
            }

            // After consuming full characters, consume any remaining bits needed.
            if (numBits) {
                bitBuffer = parseInt(inTxt.charAt(currCharPos), 16);
                bitBufferLen = 4 - numBits;
                output = (output << numBits) | (bitBuffer >> bitBufferLen);
                bitBuffer = (bitBuffer << (numBits - 1)) & 0x7;
                currCharPos++;
            }

            return output;
        }
        var flushBitBuffer = function () {
            // Empty the bit buffer.
            bitBuffer = 0;
            bitBufferLen = 0;
        }
        var getPacket = function (depth = 0) {
            var contents: number = undefined;
            var version = getBits(3);
            p1Score += version;
            var type = getBits(3);
            /*if (type != 4) {
                appOut.value += "\n";
                for (var i = 0; i < depth; i++) {
                    appOut.value += "  ";
                }
            }*/
            //appOut.value += ["+[", "*[", "min[", "max[", "", ">[", "<[", "==["][type];
            //appOut.value += `V${version} T${type} `;
            var numBits = 6;
            if (type == 4) {
                // Number literal, digits are encoded with 5 bits.
                // MSB is 0 on last digit, 1 on all others, and then 4 bits
                // per digit. Finally, the stream is padded to 4-bit boundary.
                var headerBit = 0;
                contents = 0;
                do {
                    headerBit = getBits(1);
                    contents = (contents * 0x10) + getBits(4);
                    numBits += 5;
                } while (headerBit);
                //appOut.value += `${contents} `;
            } else {
                // Operator.
                var subPackets = Array<number>();
                var lengthBit = getBits(1);
                numBits++;
                if (lengthBit == 0) {
                    // Next 15 bits are the total number of bits for my contents.
                    var bitsExpected = getBits(15);
                    numBits += 15;
                    var bitsRead = 0;
                    while (bitsRead < bitsExpected) {
                        var subPacket = getPacket(depth + 1);
                        bitsRead += subPacket.numBits;
                        subPackets.push(subPacket.contents);
                    }
                    numBits += bitsRead;
                } else {
                    // Next 11 bits are the total number of subpackets to look for.
                    var numSubPackets = getBits(11);
                    numBits += 11;
                    for (var i = 0; i < numSubPackets; i++) {
                        var subPacket = getPacket(depth + 1);
                        numBits += subPacket.numBits;
                        subPackets.push(subPacket.contents);
                    }
                }
                switch (type) {
                    case 0: // Sum
                        contents = subPackets.reduce((p, v) => p + v, 0);
                        break;
                    case 1: // Product
                        contents = subPackets.reduce((p, v) => p * v, 1);
                        break;
                    case 2: // Minimum
                        contents = subPackets.reduce((p, v) => (v < p) ? v : p, subPackets[0]);
                        break;
                    case 3: // Maximum
                        contents = subPackets.reduce((p, v) => (v > p) ? v : p, subPackets[0]);
                        break;
                    case 5: // Greater than
                        contents = (subPackets[0] > subPackets[1]) ? 1 : 0;
                        break;
                    case 6: // Less than
                        contents = (subPackets[0] < subPackets[1]) ? 1 : 0;
                        break;
                    case 7: // Equal to
                        contents = (subPackets[0] == subPackets[1]) ? 1 : 0;
                        break;
                }
                /*appOut.value += "\n";
                for (var i = 0; i < depth; i++) {
                    appOut.value += "  ";
                }
                appOut.value += `]=${contents} `;*/
            }
            return {numBits, contents};
        }
        var result = getPacket();

        switch (mode) {
            case 1:
                appOut.value += `Output: ${p1Score}\n`;
                break;
            case 2:
                appOut.value += `Output: ${result.contents}\n`;
                break;
        }
    }
};
