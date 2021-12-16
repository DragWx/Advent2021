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
        var getPacket = function () {
            var version = getBits(3);
            p1Score += version;
            var type = getBits(3);
            //appOut.value += `V${version} T${type}\n`;
            var numBits = 6;
            if (type == 4) {
                // Number literal, digits are encoded with 5 bits.
                // MSB is 0 on last digit, 1 on all others, and then 4 bits
                // per digit. Finally, the stream is padded to 4-bit boundary.
                var headerBit = 0;
                do {
                    headerBit = getBits(1);
                    getBits(4); // TODO: Store this.
                    numBits += 5;
                } while (headerBit);
            } else {
                // Operator.
                var lengthBit = getBits(1);
                numBits++;
                if (lengthBit == 0) {
                    // Next 15 bits are the total number of bits for my contents.
                    var bitsExpected = getBits(15);
                    numBits += 15;
                    var bitsRead = 0;
                    while (bitsRead < bitsExpected) {
                        var subPacket = getPacket();
                        bitsRead += subPacket.numBits;
                    }
                    numBits += bitsRead;
                } else {
                    // Next 11 bits are the total number of subpackets to look for.
                    var numSubPackets = getBits(11);
                    numBits += 11;
                    for (var i = 0; i < numSubPackets; i++) {
                        var subPacket = getPacket();
                        numBits += subPacket.numBits;
                    }
                }
            }
            return {version, type, numBits};
        }
        getPacket();

        switch (mode) {
            case 1:
                appOut.value += `Output: ${p1Score}\n`;
                break;
            case 2:
                appOut.value += `This is phase 2's output.\n`;
                break;
        }
    }
};
