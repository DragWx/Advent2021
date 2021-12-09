namespace day05 {
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
        const r = new RegExp(/^(\d+),(\d+) -> (\d+),(\d+)$/);
        var lines = Array<Line>();
        // Parse input.
        appIn.value.split("\n").forEach((currLine, i) => {
            var matches = currLine.match(r);
            if (matches?.length == 5) {
                lines.push(new Line(parseInt(matches[1]), parseInt(matches[2]), parseInt(matches[3]), parseInt(matches[4])));
            }
        });
        if (mode == 1) {
            // For phase 1, ignore diagonal lines.
            lines = lines.filter(x => (x.orientation == Orientation.horizontal) || (x.orientation == Orientation.vertical));
        }

        // Collision detection, baybeeeeeee
        /* We're checking lines, so there's three possibilities for each pair:
            1) No collision
            2) Collision at exactly one point
            3) Collision at all points (both lines are the same)
        */
        // The key is a composite of X and Y: X | (Y<<24)
        var collisionPoints = new Map<number, number>();
        // Add a collision to the given coordinates.
        var collide = function (x: number, y: number) {
            // Need to do it this way because bitwise operators are limited to 32 bits.
            var key = (x & 0xFFFFFF) + ((y & 0xFFFFFF) * 0x1000000);
            if (collisionPoints.has(key)) {
                collisionPoints.set(key, collisionPoints.get(key) + 1);
            } else {
                collisionPoints.set(key, 1);
            }
        }
        var translateCoords = function (x: number, y: number, flip: boolean, swap: boolean, skew: boolean, reverse: boolean): {x: number, y: number} {
            var newX = x;
            var newY = y;
            if (reverse) {
                if (skew) {
                    newY += newX;
                }
                if (swap) {
                    var temp = newX;
                    newX = newY;
                    newY = temp;
                }
                if (flip) {
                    // (1/2) Once upon a time, this was newX = -x.
                    newX = -newX;
                }
            } else {
                if (flip) {
                    // (2/2) ...because *this* was newX = -x and I copy pasted it. It took forever to debug.
                    newX = -newX;
                }
                if (swap) {
                    var temp = newX;
                    newX = newY;
                    newY = temp;
                }
                if (skew) {
                    newY -= newX;
                }
            }
            return {x: newX, y: newY};
        }
        var translateLine = function (line: Line, flip: boolean, swap: boolean, skew: boolean, reverse: boolean): Line {
            var coord1 = translateCoords(line.left, line.leftY, flip, swap, skew, reverse);
            var coord2 = translateCoords(line.right, line.rightY, flip, swap, skew, reverse);
            return new Line(coord1.x, coord1.y, coord2.x, coord2.y);
        }

        //var debugOut = "";
        lines.forEach((lineA, i) => {
            var toCheck = lines.slice(i+1);
            if (toCheck.length == 0) {
                return;
            }
            toCheck.forEach(lineB => {
                // Before doing anything else, perform bounding box collision
                // detection between both lines.
                if ((lineB.left > lineA.right) || (lineB.right < lineA.left) || (lineB.top > lineA.bottom) || (lineB.bottom < lineA.top)) {
                    // There's no possible way that these two lines are
                    // overlapping, no further calculations needed.
                    return;
                }

                // We have three translations available (performed in this order):
                // - Flip: Horizontal flip by negating X. Affects diagonals but not H/V
                // - Swap: Switch X and Y coordinates. Affects H/V but not diagonals.
                // - Skew: Subtract X from Y. Turns DR into H.

                // We'll use them to ensure "my" line is always horizontal, so
                // we can perform the following optimizations:
                // H - H   : The only parallel line comparison.
                // H - V   : Perpendicular intersection.
                // H - DR  : Intersection.
                // *H - UR : Flip, becomes H - DR.
                // *V - V  : Swap, becomes H - H.
                // *V - DR : Swap, skew, becomes H - DR.
                // *V - UR : Swap, flip, becomes H - DR.
                // *DR - DR: Skew, becomes H - H.
                // DR - UR : Handle specially, only case where "your" line is UR.
                // *UR - UR: Flip, skew, becomes H - H.
                
                // 10 cases down to 4. We can use the orientation of "your" line
                // to determine which check to perform.

                const inputLines = [lineA, lineB];
                var coordFlip = false;  // Negate X
                var coordSwap = false;  // Swap X and Y
                var coordSkew = false;  // Subtract X from Y
                var my: Line;
                var your: Line;

                //debugOut += `A: ${lineA.left},${lineA.leftY} -> ${lineA.right},${lineA.rightY}: ${Orientation[lineA.orientation]}\n`;
                //debugOut += `B: ${lineB.left},${lineB.leftY} -> ${lineB.right},${lineB.rightY}: ${Orientation[lineB.orientation]}\n\n`;
                
                // We're doing a bunch of queries, starting by picking the first line.
                if (my = inputLines.find(x => x.orientation == Orientation.horizontal)) {
                    // One of the lines is horizontal.
                    // H - H, V, DR, UR
                    inputLines.splice(inputLines.indexOf(my), 1);
                    // The only invalid configuration is H - UR, so check for that
                    if (inputLines[0].orientation == Orientation.upRight) {
                        // H - UR
                        coordFlip = true;
                        // --> H - DR
                    }
                    // At this point, we're guaranteed to have H - H, H - V, or H - DR.
                } else if (my = inputLines.find(x => x.orientation == Orientation.vertical)) {
                    // Neither line is horizontal, but one of them is vertical.
                    // V - V, DR, UR
                    inputLines.splice(inputLines.indexOf(my), 1);
                    coordSwap = true;
                    // --> H - H, DR, UR
                    // At this point, the only invalid configuration is H - UR, so check for that
                    if (inputLines[0].orientation == Orientation.upRight) {
                        // H - UR
                        coordFlip = true;
                        // --> H - DR
                    }
                    // At this point, we're guaranteed to have either H - H, or H - DR.
                } else if (my = inputLines.find(x => x.orientation == Orientation.downRight)) {
                    // Both lines are diagonal, one is down-right.
                    // DR - DR, UR
                    inputLines.splice(inputLines.indexOf(my), 1);
                    if (inputLines[0].orientation == Orientation.downRight) {
                        // DR - DR
                        coordSkew = true;
                        // --> H - H
                    }
                    // We have either H - H or DR - UR.
                } else if (my = inputLines.find(x => x.orientation == Orientation.upRight)) {
                    // If we get here, both lines must be up-right.
                    // UR - UR
                    inputLines.splice(inputLines.indexOf(my), 1);
                    coordFlip = true;
                    // --> DR - DR
                    coordSkew = true;
                    // --> H - H
                }
                my = translateLine(my, coordFlip, coordSwap, coordSkew, false);
                your = translateLine(inputLines.shift(), coordFlip, coordSwap, coordSkew, false);

                //debugOut += `A': ${my.left},${my.leftY} -> ${my.right},${my.rightY}: ${Orientation[my.orientation]}\n`;
                //debugOut += `B': ${your.left},${your.leftY} -> ${your.right},${your.rightY}: ${Orientation[your.orientation]}\n`;
                //debugOut += "==========\n";

                // My line is always horizontal. The orientation of your line
                // determines which kind of check to perform.

                // Remember, if we applied any transformations to the input lines,
                // we need to UNDO that transformation on the output coordinates!
                var outCoords: {x: number, y: number};
                switch (your.orientation) {
                    case Orientation.horizontal:
                        // Parallel lines. This is the only case capable of generating multiple points.
                        if (your.top == my.top) {
                            // Figure out: rightmost left edge, leftmost right edge, collision is between these two edges.
                            var rangeStart = (your.left > my.left) ? your.left : my.left;
                            var rangeEnd = (your.right < my.right) ? your.right : my.right;
                            for (var rangeX = rangeStart; rangeX <= rangeEnd; rangeX++) {
                                outCoords = translateCoords(rangeX, my.top, coordFlip, coordSwap, coordSkew, true);
                                collide(outCoords.x, outCoords.y);
                            }
                        }
                        break;
                    case Orientation.vertical:
                        // Perpendicular lines. This is the only case where collision is guaranteed.
                        // Your.left between My.left and My.right.
                        outCoords = translateCoords(your.left, my.top, coordFlip, coordSwap, coordSkew, true);
                        collide(outCoords.x, outCoords.y);
                        break;
                    case Orientation.downRight:
                        // Intersection at 45 degrees.
                        // Like perpendicular, except instead of Your.left, we use (Your.left + (My.top - Your.top)). My.top is guaranteed between Your.top and Your.bottom.
                        var checkX = your.left + (my.top - your.top);
                        if ((checkX >= my.left) && (checkX <= my.right)) {
                            outCoords = translateCoords(checkX, my.top, coordFlip, coordSwap, coordSkew, true);
                            collide(outCoords.x, outCoords.y);
                        }
                        break;
                    case Orientation.upRight:
                        // X-shaped collision.
                        //                    11                1 1
                        // We might get this: 11  and not this:  2    <-- Only one of those is overlapping!
                        //                   1  1               1 1
                        if ((your.left - my.left) <= (your.bottom - my.top)
                            && (your.right - my.left) >= (your.top - my.top)) {
                            // The lines cross.
                            var crossPoint = ((my.right - my.left) / 2) + ((your.bottom - my.bottom) + (your.left - my.left)) / 2;
                            if ((crossPoint % 1 == 0) && (my.left + crossPoint >= my.left) && (my.left + crossPoint <= my.right)) {
                                outCoords = translateCoords(my.left + crossPoint, my.top + crossPoint, coordFlip, coordSwap, coordSkew, true);
                                collide(outCoords.x, outCoords.y);
                            }
                        }
                        break;
                }
            });
        });
        /* FAILING INPUT
        494,864 -> 494,484
        639,430 -> 99,970
        709,56 -> 709,626
        795,489 -> 599,685
        */

        /*debugOut += "== Collisions ==\n";
        collisionPoints.forEach((v, k) => {
            debugOut += `${k & 0xFFFFFF}, ${(k >> 24) & 0xFFFFFF}: ${v}\n`;
        });*/
        //appOut.value = debugOut;
        appOut.value = `== Phase ${mode} ==\nOutput: ${collisionPoints.size}\n`;
    }
    enum Orientation {
        "horizontal",
        "vertical",
        "downRight",
        "upRight"
    };
    class Line {
        public left: number;
        public top: number;
        public right: number;
        public bottom: number;
        public leftY: number;
        public rightY: number;

        public orientation: Orientation;
        public isDiagonal: boolean;

        constructor(x1: number, y1: number, x2: number, y2: number) {
            var leftY: number, rightY: number;
            if (x1 < x2) {
                this.left = x1;
                this.right = x2;
                this.leftY = y1;
                this.rightY = y2
            } else {
                this.left = x2;
                this.right = x1;
                this.leftY = y2;
                this.rightY = y1;
            }
            if (y1 < y2) {
                this.top = y1;
                this.bottom = y2;
            } else {
                this.top = y2;
                this.bottom = y1;
            }

            if (x1 == x2) {
                this.orientation = Orientation.vertical;
                this.isDiagonal = false;
            } else if (y1 == y2) {
                this.orientation = Orientation.horizontal;
                this.isDiagonal = false;
            } else if (this.leftY < this.rightY) {
                this.orientation = Orientation.downRight;
                this.isDiagonal = true;
            } else {
                this.orientation = Orientation.upRight;
                this.isDiagonal = true;
            }
        }
    }
};
