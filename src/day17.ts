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
            bottom: 0
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
                appOut.value += `This is phase 2's output.\n`;
                break;
        }
    }
};
