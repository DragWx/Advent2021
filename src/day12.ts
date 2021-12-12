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
        var checkCave = function (caveName: string, currPath: Array<string>, revisitSmallAllowed: boolean) {
            if (caveName == "end") {
                // If I'm the `end` cave, success! Add currPath to the list and terminate this route.
                validPaths.push([...currPath, caveName]);
                return true;
            }

            var toCheck: Array<string>;
            // Where we're allowed to go from here depends on `revisitSmallAllowed`.
            if (revisitSmallAllowed) {
                // We can go anywhere from here, except back to `start`.
                toCheck = caves.get(caveName).filter(x => x != "start");
            } else {
                // From here, we can always go to any big cave, but we can only go to small caves not already visited.
                toCheck = caves.get(caveName).filter(x => (currPath.indexOf(x) == -1) || (x == x.toUpperCase()));
            }

            // If `revisitSmallAllowed` was true, and we're about to visit a small cave already in the path,
            // we are no longer allowed to revisit any small caves after that.
            toCheck.forEach(cave => { checkCave(cave, [...currPath, caveName], revisitSmallAllowed && ((cave == cave.toUpperCase()) || (currPath.indexOf(cave) == -1))); });
            // If we reach this point, there's nothing left to check from here.
            return false;
        }

        // Kickstart the whole process by checking "start".

        switch (mode) {
            case 1:
                checkCave("start", [], false);
                //validPaths.forEach(path => { appOut.value += `${path.join(',')}\n`; });
                appOut.value += `Output: ${validPaths.length}\n`;
                break;
            case 2:
                checkCave("start", [], true);
                //validPaths.forEach(path => { appOut.value += `${path.join(',')}\n`; });
                appOut.value += `Output: ${validPaths.length}\n`;
                break;
        }
    }
};
