namespace day22 {
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
        let commands = Array<{targetState: boolean, start: Array<number>, end: Array<number>}>();
        let axis = new Map<string, number>();
        appIn.value.split("\n").forEach((inTxtRaw) => {
            if (!inTxtRaw || !inTxtRaw.trim()) {
                // If string is null, empty, or whitespace.
                return;
            }
            let inTxt = inTxtRaw.trim().toLowerCase();
            
            // Get on/off keyword
            let matches = inTxt.match(/^(on|off)\s+(.*)$/);
            if (matches) {
                // Figure out if we also need to set the axes.
                let needAxis = axis.size == 0;
                let start = Array<number>(axis.size);
                let end = Array<number>(axis.size);

                let targetState = matches[1] == "on" ? true : false;
                
                // Now do the ranges.
                let ranges = matches[2].split(',');
                for (var i = 0; i < ranges.length; i++) {
                    let match = ranges[i].match(/\s*(\w+)\s*=\s*(-?\d+)\.\.(-?\d+)/);
                    if (match) {
                        let coords = [parseInt(match[2]), parseInt(match[3])].sort((a,b) => a - b);
                        if (needAxis) {
                            // If we need axes, get them from this line. All other
                            // lines must have matching axes or else they will
                            // be thrown out.
                            axis.set(match[1], i);
                            start.push(coords[0]);
                            end.push(coords[1]);
                        } else {
                            // We have the axes, so match input axes with indices.
                            var index = axis.get(match[1])
                            if (index === undefined) {
                                appOut.value += "Bad input.\n";
                                return;
                            }
                            start[index] = coords[0];
                            end[index] = coords[1];
                        }
                    }
                }
                if (ranges.length == axis.size) {
                    commands.push({targetState, start, end});
                } else {
                    appOut.value += "Bad input.\n";
                    return;
                }
            }
        });
        //appOut.value += `${JSON.stringify(commands, null, 2)}\n`;

        // One by one, go through the input commands. They specify a region to
        // either add to or remove from our space.

        // Whenever the input region overlaps an existing region, we need to
        // subdivide the existing region into two or more regions, and then
        // we either add or don't add the input region to the space depending
        // on whether the region is to turn `on` or to turn `off`.
        let regions = new Array<{start: Array<number>, end: Array<number>}>();
        let didCollide: boolean;
        let fullyEncompassed: boolean;
        let collidedWith = new Array<{start: Array<number>, end: Array<number>}>();
        let command: {targetState: boolean, start: Array<number>, end: Array<number>};
        for (let commandIndex = 0; commandIndex < commands.length; commandIndex++) {
            collidedWith.length = 0;
            command = commands[commandIndex];
            // Figure out which regions this command overlaps, if any.
            for (let region = 0; region < regions.length; region++) {
                didCollide = true;
                fullyEncompassed = true;
                for (let c = 0; c < axis.size; c++) {
                    if ((command.start[c] > regions[region].end[c]) || (command.end[c] < regions[region].start[c])) {
                        didCollide = false;
                        break;
                    } else if (fullyEncompassed && ((command.start[c] > regions[region].start[c]) || (command.end[c] < regions[region].end[c]))) {
                        fullyEncompassed = false;
                    }
                }
                if (didCollide) {
                    if (fullyEncompassed) {
                        // Just remove the region because the command absorbs it.
                        regions.splice(region, 1);
                    } else {
                        // Mark this as a region we need to subdivide. We could
                        // do it here, but we'd end up redundantly
                        // collision-testing the subdivisions at the end.
                        collidedWith.push(regions.splice(region, 1)[0]);
                    }
                    region--;
                }
            }

            // Go through `collidedWith` and subdivide.
            // We're able to break this into a simpler problem in 2D.
            /*  _____________   
                |   | T |   |   
                |   |___|   |   Slice the existing region using the left and right
                | L |Com| R |   edges of the command. Then, slice the middle
                |   |___|   |   using the top and bottom edges of the command.
                |   | B |   |
                |___|___|___|    
            */
            // Now remove these new regions, L, R, T, and B, because they're
            // guaranteed to not collide with the command.

            // Perform this process using X,Y, then with X,Z, then Y,Z, and you'll
            // have successfully subdivided the region to either remove or add
            // the command region.

            // It turns out, we can simplify this even farther! Just look one
            // axis at a time. The way we subdivide, we create new regions which
            // are guaranteed to not be colliding, even though we're only
            // changing one coordinate at a time.

            for (let region = 0; region < collidedWith.length; region++) {
                for (let c = 0; c < axis.size; c++) {
                    if (collidedWith[region].start[c] < command.start[c]) {
                        // [ L ]
                        let newRegion = {start: [...collidedWith[region].start], end: [...collidedWith[region].end]};
                        newRegion.end[c] = command.start[c] - 1;
                        regions.push(newRegion);
                        collidedWith[region].start[c] = command.start[c];
                    }
                    if (collidedWith[region].end[c] > command.end[c]) {
                        // [ R ]
                        let newRegion = {start: [...collidedWith[region].start], end: [...collidedWith[region].end]};
                        newRegion.start[c] = command.end[c] + 1;
                        regions.push(newRegion);
                        collidedWith[region].end[c] = command.end[c];
                    }
                }
            }

            if (command.targetState) {
                // Add the region if the command is `on`.
                regions.push({start: command.start, end: command.end});
            }
        }

        let cells = 0;
        let skip: boolean;
        // Cut away everything outside of a -50..50 region on all axes.
        for (let region = 0; region < regions.length; region++) {
            skip = false;
            if (mode == 1) {
                for (let c = 0; c < axis.size; c++) {
                    if ((regions[region].end[c] < -50) || (regions[region].start[c] > 50)) {
                        // Throw out anything that's completely outside the window.
                        regions.splice(region, 1);
                        region--;
                        skip = true;
                        break;
                    } else {
                        // Truncate coordinates to the window.
                        if (regions[region].start[c] < -50) {
                            regions[region].start[c] = -50;
                        }
                        if (regions[region].end[c] > 50) {
                            regions[region].end[c] = 50;
                        }
                    }
                }
            }
            if (!skip) {
                let regionSize = 1;
                for (let c = 0; c < axis.size; c++) {
                    regionSize *= regions[region].end[c] - regions[region].start[c] + 1;
                }
                cells += regionSize;
            }
        }

        appOut.value += `Output ${cells}\n`;
    }
};
