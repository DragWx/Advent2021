namespace day05 {
    var appIn : HTMLTextAreaElement;
    var appOut : HTMLTextAreaElement;
    export function init (phase: number) {
        // Get our elements of interest
        appIn = document.getElementById("appIn") as HTMLTextAreaElement;
        appOut = document.getElementById("appOut") as HTMLTextAreaElement;
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
        // The key is a composite of X and Y: X | (Y<<16)
        var collisionPoints = new Map<number, number>();
        // Add a collision to the given coordinates.
        var collide = function (x: number, y: number) {
            var key = (x & 0xFFFF) | ((y & 0xFFFF) << 16);
            if (collisionPoints.has(key)) {
                collisionPoints.set(key, collisionPoints.get(key) + 1);
            } else {
                collisionPoints.set(key, 1);
            }
        }
        lines.forEach((my, i, all) => {
            if (i < all.length - 1) {
                var toCheck = lines.slice(i+1);
                toCheck.forEach(your => {
                    var myStart: number, myEnd: number, myPosition: number;
                    var yourStart: number, yourEnd: number, yourPosition: number;
                    if (my.orientation == Orientation.horizontal) {
                        myStart = my.left;
                        myEnd = my.right;
                        myPosition = my.top;
                    } else {
                        myStart = my.top;
                        myEnd = my.bottom;
                        myPosition = my.left;
                    }
                    if (your.orientation == Orientation.horizontal) {
                        yourStart = your.left;
                        yourEnd = your.right;
                        yourPosition = your.top;
                    } else {
                        yourStart = your.top;
                        yourEnd = your.bottom;
                        yourPosition = your.left;
                    }
                    if (my.orientation == your.orientation) {
                        // Lines are parallel, so there's either no collision,
                        // or there's 1 or more points overlapping.
                        if (myPosition == yourPosition) {
                            if ((yourEnd >= myStart) && (yourStart <= myEnd)) {
                                // An overlap is happening. Figure out who's left is
                                // farthest to the right, and whose right is farthest
                                // to the left.
                                var ovrStart: number, ovrEnd: number;
                                if (yourStart <= myStart) {
                                    ovrStart = myStart;
                                } else {
                                    ovrStart = yourStart;
                                }
                                if (yourEnd >= myEnd) {
                                    ovrEnd = myEnd;
                                } else {
                                    ovrEnd = yourEnd;
                                }
                                // Add a collision for all points between ovrStart and ovrEnd.
                                for (var currPos = ovrStart; currPos <= ovrEnd; currPos++) {
                                    if (my.orientation == Orientation.horizontal) {
                                        collide(currPos, my.top);
                                    } else {
                                        collide(my.left, currPos);
                                    }
                                }
                            }
                        }
                    } else if (my.orientation != your.orientation) {
                        // Lines are perpendicular. There's either no collision,
                        // or collision on exactly one point.
                        if ((yourPosition >= myStart) && (yourPosition <= myEnd)
                        && (yourStart <= myPosition) && (yourEnd >= myPosition)) {
                            if (my.orientation == Orientation.horizontal) {
                                collide(your.left, my.top);
                            } else {
                                collide(my.left, your.top);
                            }
                        }
                    }
                });
            }
        });

        appOut.value = `== Phase ${mode} ==\nOutput: ${collisionPoints.size}`;
    }
    enum Orientation {
        "horizontal",
        "vertical",
        "diagonal"
    };
    class Line {
        public left: number;
        public top: number;
        public right: number;
        public bottom: number;

        public orientation: Orientation;

        constructor(left: number, top: number, right: number, bottom: number) {
            this.left = left;
            this.top = top;
            this.right = right;
            this.bottom = bottom;

            if (top < bottom) {
                this.top = top;
                this.bottom = bottom;
            } else {
                this.top = bottom;
                this.bottom = top;
            }
            if (left < right) {
                this.left = left;
                this.right = right;
            } else {
                this.left = right;
                this.right = left;
            }

            if (left == right) {
                this.orientation = Orientation.vertical;
            } else if (top == bottom) {
                this.orientation = Orientation.horizontal;
            } else {
                this.orientation = Orientation.diagonal;
            }
        }
    }
};
