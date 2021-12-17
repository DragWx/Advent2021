namespace day17 {
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
        var target = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            width: 0,
            height: 0
        };
        var parseResults = inTxt.match(/x=(-?\d+)\.\.(-?\d+)/);
        var a = parseInt(parseResults[1]);
        var b = parseInt(parseResults[2]);
        if (a < b) {
            target.left = a,
            target.right = b
        } else {
            target.left = b,
            target.right = a
        }

        var parseResults = inTxt.match(/y=(-?\d+)\.\.(-?\d+)/);
        var a = parseInt(parseResults[1]);
        var b = parseInt(parseResults[2]);
        if (a > b) {
            target.top = a,
            target.bottom = b
        } else {
            target.top = b,
            target.bottom = a
        }

        target.width = Math.abs(target.right - target.left);
        target.height = Math.abs(target.bottom - target.top);

        // ***** NONE OF THIS WAS TESTED WITH POSITIVE Y REGIONS OR NEGATIVE X REGIONS! *****

        //appOut.value += `X:${target.left} -> ${target.right}, Y:${target.top} -> ${target.bottom}\n`;

        // Positive Y is UP, negative Y is DOWN.

        // Fire a projectile with a velocity of <vX, vY>. For each step:
        // 1. Apply X velocity to X position, then Y velocity to Y position.
        // 2. Move X velocity closer to 0 by 1.
        // 3. Add 1 to Y velocity.

        // The goal is for the projectile to eventually end up in the target
        // region bounded by `left`, `right`, `top`, and `bottom` following
        // any number of steps, without missing it or passing through it.


        switch (mode) {
            case 1:
                // - Phase 1 - Find the velocity which maximizes Y and
                // successfully reaches the target region.

                // Y will always travel some distance up, and then the same
                // distance back down to Y=0. The absolute maximum velocity I
                // can shoot upwards with will cause the following:
                // Y=0, Y>0, ..., Y=0, Y=bottom

                // Compute the triangle number of `bottom - 1` to get the answer.

                var output = 0;
                for (var vY = (-target.bottom) - 1; vY > 0; vY--) {
                    output += vY;
                }

                appOut.value += `Output: ${output}\n`;
                break;
            case 2:
                // - Phase 2 - Figure out every possible velocity value which
                // will result in the probe reaching the target region.

                // For targets below Y=0, for each Y position in the target,
                // you can calculate a negative `vY` value `nvY` which will
                // reach the target in `N > 0` steps.
                
                // Since we're constricted to integers only, if want `N` steps,
                // changing `vY` will move `Y` by a factor of `N`.

                // How many steps does it take to surpass the target when
                // `vY = -1`? Take the minimum of that and the target region's
                // height, and you get the maximum amount of `N` steps you need
                // to consider when calculating `nvY` values.
                
                // Each `nvY` has a positive equivalent `pvY = (-vY - 1)` which
                // will eventually trace the same Y<0 positions, but after a
                // delay of `((2 * pvY) + 1)`.


                var mapPush = function(map: Map<number, Array<number>>, key: number, value: number) {
                    var currArray = map.get(key);
                    if (currArray === undefined) {
                        map.set(key, [value]);
                    } else {
                        if (currArray.indexOf(value) == -1) {
                            currArray.push(value);
                        }
                    }
                }
                // Y velocities by number of steps it takes to reach target Y region
                var vYs = new Map<number, Array<number>>();
                var currHarmonic = 1;
                var currOffset = 1;
                var alignedTop = target.top;
                var alignedBottom = target.bottom;
                while (true) {
                    // Adjust top and bottom to align with grid of possible Y positions for this harmonic.
                    alignedTop = (Math.floor((target.top + (currOffset % currHarmonic)) / currHarmonic) * currHarmonic) - (currOffset % currHarmonic);
                    if (alignedTop > -currOffset) {
                        alignedTop = -currOffset;
                    }
                    alignedBottom = (Math.ceil((target.bottom + (currOffset % currHarmonic)) / currHarmonic) * currHarmonic) - (currOffset % currHarmonic);
                    if (alignedTop < alignedBottom) {
                        break;
                    }
                    
                    for (var i = alignedTop; i >= alignedBottom; i -= currHarmonic) {
                        var currYV = ((i + currOffset) / currHarmonic) - 1;
                        mapPush(vYs, currHarmonic, currYV);
                        // Now do the complement.
                        var pvY = -currYV - 1;
                        var pvYSteps = currHarmonic + (2 * pvY) + 1;
                        mapPush(vYs, pvYSteps, pvY);
                    }

                    // Go to next harmonic.
                    currHarmonic++;
                    currOffset += currHarmonic;
                }
                var sortedVY = Array.from(vYs.keys()).sort((a, b) => a - b);

                //appOut.value += "-- Y --\n";
                //sortedVY.forEach(k => { appOut.value += `${k}: ${vYs.get(k).join(',')}\n`; });

                // We now have a list of Y velocities, along with which step
                // numbers the object will be incident with the target Y region.

                // X is simpler because there's only half an arc, and then the
                // object stops. This means that there will be situations where
                // the object enters the target X region and remains there
                // indefinitely. We'll represent that with a negative step number.

                // X velocities by number of steps it takes to reach target Y region
                var vXs = new Map<number, Array<number>>();
                currHarmonic = 1;
                currOffset = 1;
                var alignedLeft = target.left;
                var alignedRight = target.right;
                while (true) {
                    // Adjust top and bottom to align with grid of possible Y positions for this harmonic.
                    alignedLeft = (Math.ceil((target.left - (currOffset % currHarmonic)) / currHarmonic) * currHarmonic) + (currOffset % currHarmonic);
                    if (alignedLeft < currOffset) {
                        alignedLeft = currOffset;
                    }
                    alignedRight = (Math.floor((target.right - (currOffset % currHarmonic)) / currHarmonic) * currHarmonic) + (currOffset % currHarmonic);
                    if (alignedLeft > alignedRight) {
                        break;
                    }
                    
                    for (var i = alignedLeft; i <= alignedRight; i += currHarmonic) {
                        var currXV = ((i + currOffset) / currHarmonic) - 1;
                        mapPush(vXs, currHarmonic, currXV);
                    }

                    // Go to next harmonic.
                    currHarmonic++;
                    currOffset += currHarmonic;
                }
                
                //appOut.value += "-- X --\n";
                //vXs.forEach((v, k) => { appOut.value += `${k}: ${v.join(',')}\n`; });

                // A `vY` will always cause the object to enter *and then exit*
                // the target Y region.
                // If `vX == N`, and `vX` reaches the target X region,
                // the object will not leave it.

                // All combinations of a vX and vY with the same `N` is an answer.
                // If `vX == N`, all `vY` where `vY.N >= vX.N` are answers, because
                //   this represents a `vX` where the object's X *comes to a stop*
                //   inside the target X region.

                var answersMap = new Map<number, Array<number>>();
                vXs.forEach((vXsForThisStep, currStep) => {
                    var vYsForThisStep = vYs.get(currStep);
                    if (vYsForThisStep) {
                        vXsForThisStep.forEach(vX => {
                            if (vX == currStep) {
                                var vYsForThisAndLaterSteps = sortedVY.filter(step => step >= currStep).map(step => vYs.get(step));
                                vYsForThisAndLaterSteps.forEach(vYStep => {
                                    vYStep.forEach(vY => {
                                        mapPush(answersMap, vX, vY);
                                    })
                                });
                            } else {
                                vYsForThisStep.forEach(vY => {
                                    mapPush(answersMap, vX, vY);
                                });
                            }
                        });
                    }
                });
                var answers = new Array<{vX: number, vY: number}>();
                answersMap.forEach((ys, x) => {
                    ys.forEach(y => {
                        answers.push({vX: x, vY: y});
                    });
                });
                answers.sort((a, b) => {
                    var aKey = (a.vX + 0x8000) + ((a.vY + 0x8000) * 0x10000);
                    var bKey = (b.vX + 0x8000) + ((b.vY + 0x8000) * 0x10000);
                    return aKey - bKey;
                });


                //answers.forEach(answer => { appOut.value += `${answer.vX},${answer.vY}    ` });
                //appOut.value += "\n";

                appOut.value += `Output: ${answers.length}\n`;
                break;
        }
        /*
        target area: x=20..30, y=-10..-5
        20,-10   21,-10   22,-10   23,-10   24,-10   25,-10   26,-10   27,-10   28,-10   29,-10   30,-10
        20,-9    21,-9    22,-9    23,-9    24,-9    25,-9    26,-9    27,-9    28,-9    29,-9    30,-9
        20,-8    21,-8    22,-8    23,-8    24,-8    25,-8    26,-8    27,-8    28,-8    29,-8    30,-8
        20,-7    21,-7    22,-7    23,-7    24,-7    25,-7    26,-7    27,-7    28,-7    29,-7    30,-7
        20,-6    21,-6    22,-6    23,-6    24,-6    25,-6    26,-6    27,-6    28,-6    29,-6    30,-6
        20,-5    21,-5    22,-5    23,-5    24,-5    25,-5    26,-5    27,-5    28,-5    29,-5    30,-5

        11,-4    12,-4    13,-4    14,-4    15,-4
        11,-3    12,-3    13,-3    14,-3    15,-3
        8, -2    9, -2    10,-2    11,-2    12,-2    13,-2    14,-2    15,-2
        7, -1    8, -1    9, -1    10,-1    11,-1

        6, 0     7, 0     8, 0     9, 0
        6, 1     7, 1     8, 1
        6, 2     7, 2
        6, 3     7, 3
        6, 4     7, 4
        6, 5     7, 5
        6, 6     7, 6
        6, 7     7, 7
        6, 8     7, 8
        6, 9     7, 9
        */
    }
};
