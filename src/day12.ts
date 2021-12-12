namespace day12 {
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
        const caves = new Map<string, Array<string>>();

        appOut.value = `== Phase ${mode} ==\n`;
        appIn.value.split("\n").forEach((inTxtRaw) => {
            if (!inTxtRaw || !inTxtRaw.trim()) {
                // If string is null, empty, or whitespace.
                return;
            }
            var inTxt = inTxtRaw.trim();
            // A line of input is <cave1>-<cave2>. An all-caps cave is a "big"
            // cave, and a no-caps cave is "small".
            // A big cave can be visited multiple times, but a small cave can
            // only be visited once.
            // NOTE: I'm assuming the puzzle input is acyclic.

            var inCaves = inTxt.split('-');

            // Add [1] to [0] and [0] to [1].
            inCaves.forEach((x, i) => {
                var connections = caves.get(x);
                if (connections === undefined) {
                    caves.set(x, [inCaves[i ^ 1]]);
                } else {
                    connections.push(inCaves[i ^ 1]);
                }
            });
        });

        var validPaths = new Array<Array<string>>();
        // I don't usually like recursive functions but I can't think of a less complicated way.
        var checkCave = function (caveName: string, currPath: Array<string>) {
            if (caveName == "end") {
                // If I'm the `end` cave, success! Add currPath to the list and terminate this route.
                validPaths.push([...currPath, caveName]);
                return true;
            }

            // Check all my edges which are big, or are small and not in the path already.
            var toCheck = caves.get(caveName).filter(x => (currPath.indexOf(x) == -1) || (x == x.toUpperCase()));

            toCheck.forEach(cave => { checkCave(cave, [...currPath, caveName]); });
            // If we reach this point, there's nothing left to check from here.
            return false;
        }

        // Kickstart the whole process by checking "start".
        checkCave("start", []);

        switch (mode) {
            case 1:
                //validPaths.forEach(path => { appOut.value += `${path.join(',')}\n`; });
                appOut.value += `Output: ${validPaths.length}\n`;
                break;
            case 2:
                appOut.value += `This is phase 2's output.\n`;
                break;
        }
    }
};
