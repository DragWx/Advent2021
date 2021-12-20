namespace day19 {
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
    function getKey(x: number, y: number) {
        // X | (Y<<24), using multiplication because bit shifting is limited to 32 bits.
        return (x & 0xFFFFFF) + ((y & 0xFFFFFF) * 0x1000000);
    }
    function fromKey(key: number) {
        var x = key & 0xFFFFFF
        return {x: x, y: (key - x) / 0x1000000};
    }
    // This function is SLOW because of the garbage collector!
    /*function checkCoords(a: Array<number>, b: Array<number>) {
        // Check if the coordinates in `a` are also in `b`, in any order.
        var sortedA = a.map((v, i) => { return {v, i}; }).sort((a, b) => a.v - b.v);
        var sortedB = b.map((v, i) => { return {v, i}; }).sort((a, b) => a.v - b.v);
        for (var i = 0; i < sortedA.length; i++) {
            if (sortedA[i].v != sortedB[i].v) {
                return null;
            }
        }
        // All of the coordinates match. Now filter to coordinates with
        // unique values.
        sortedA = sortedA.filter(x => sortedA.filter(y => x.v == y.v).length == 1);
        // Return the order the coordinates in B matched, compared to the order in A.
        var results = new Array<number>(a.length).fill(-1);
        sortedA.forEach((v, i) => results[sortedA[i].i] = sortedB[i].i);
        return results;
    }*/
    function checkCoords(a: Array<number>, b: Array<number>) {
        // Check if the coordinates in `a` are also in `b`, in any order.
        var results = new Array<number>(a.length);
        var currResult = 0;
        for (var i = 0; i < a.length; i++) {
            currResult = b.indexOf(a[i]);
            if (currResult == -1) {
                return null;
            }
            if (results.indexOf(currResult) != -1) {
                results[results.indexOf(currResult)] = -currResult - 1;
                results[i] = -currResult - 1;
            } else if (results.indexOf(-currResult - 1) != -1) {
                results[i] = -currResult - 1;
            } else {
                results[i] = currResult;
            }
        }
        for (var i = 0; i < results.length; i++) {
            if (results[i] < 0) {
                results[i] = -1;
            }
        }
        //appOut.value += `${a.join(',')} - ${b.join(',')} - ${results.join(',')}\n`;
        return results;
    }

    function findBeacons(coordsA: Array<Array<number>>, coordsB: Array<Array<number>>) {
        // Require at least 12 matches, unless there's less than 12 coordinates,
        // in which case, require them all to match.
        const minimumMatchesRequired = Math.min(Math.min(coordsA.length, coordsB.length), 2);

        // The first thing we'll do is, we'll make our best guess as to which
        // coordinates *might* match, and we'll use this guess to figure out how
        // to straighten out `coordsB` to match the orientation of `coordsA`, so
        // we can figure out what *actually* matches.
        let results: {aOffset: Array<number>, bOffset: Array<number>, matches: Array<{a: number, b: number, bOrder: Array<number>}>};
        let exitEarly = false;
        let bHadMatch = false;
        let missesA = coordsA.length - (minimumMatchesRequired - 1);
        for (let anchorA of coordsA) {
            // Create a new coordinate list where all coordinates are translated
            // by anchorA. Also, ignore all signs.
            let a = coordsA.map((coords, i) => { return {coords: coords.map((coord, i) => Math.abs(coord - anchorA[i])), index: i}; });
            let missesB = coordsB.length - (minimumMatchesRequired - 1);
            bHadMatch = false;
            for (let anchorB of coordsB) {
                // Same translation but on B.
                let b = coordsB.map((coords, i) => { return {coords: coords.map((coord, i) => Math.abs(coord - anchorB[i])), index: i}; });
                let matches = Array<{a: number, b: number, bOrder: Array<number>}>();
                // Find which coordinates in translated `a` are also in translated `b`.
                // The compare function will return which order the coordinates
                // matched in, which will help us later.
                a.forEach(fromA => {
                    let coordOrder: Array<number>;
                    let bIndex = b.findIndex(fromB => {
                        coordOrder = checkCoords(fromA.coords, fromB.coords);
                        return coordOrder;
                    });
                    if (bIndex != -1) {
                        matches.push({a: fromA.index, b: b[bIndex].index, bOrder: coordOrder});
                        b.splice(bIndex, 1);
                    }
                });
                // Remember the highest number of matches we've found.
                if (matches.length >= minimumMatchesRequired) {
                    bHadMatch = true;
                    if ((!results) || (matches.length > results.matches.length)) {
                        results = {aOffset: anchorA, bOffset: anchorB, matches: matches};
                    } else if (matches.length == results.matches.length) {
                        // When we find two sets of identical results, we can stop.
                        let done = true;
                        for (let i = 0; i < matches.length; i++) {
                            if ((matches[i].a != results.matches[i].a) || (matches[i].b != results.matches[i].b)) {
                                done = false;
                                break;
                            }
                        }
                        if (done) {
                            exitEarly = true;
                            break;
                        }
                    }
                } else {
                    // Didn't match enough.
                    missesB--;
                    if (missesB <= 0) {
                        // If we get here, there are no longer enough coordinates
                        // remaining to satisfy `minimumMatchesRequired`, so we
                        // can move to the next `A`.
                        break;
                    }
                }
                // NOTE: There's an edge case where the largest match list contains
                // one or more false positives, which will defeat the short circuit.
                // However, that's ok, because we'll still wind up with something
                // correct-ish, it'll just take longer.
            }
            if (exitEarly) {
                break;
            } else if (!bHadMatch) {
                missesA--;
                if (missesA <= 0) {
                    // If we get here, none of the coordinates in `A` so far
                    // have resulted in `minimumMatchesRequired` number of
                    // matches in `B`, and we've reached the point where there
                    // aren't enough coordinates left to check to satisfy that,
                    // so we can stop now.
                    break;
                }
            }
        }
        if (!results) {
            return null;
        }
        // Right now, `results` contains our best guess as to which coordinates
        // *might* match. This list might contain false positives because our
        // use of `Math.abs()`, so we really *do* need to figure out how to
        // "fix" `coordsB` so the coordinate order and signage is the same as
        // `coordsA`, so we can can come up with an accurate list of matches.

        // Go through the matches and figure out what the most common "bOrder" is.
        // Remember, that was the order the coordinates matched in. When multiple
        // coordinates have the same value, the order will be `-1` for all, so
        // we ignore those.
        let bOrderTotals = new Array<number>(coordsB[0].length).fill(0);
        let bOrderCounts = new Array<number>(coordsB[0].length).fill(0);
        results.matches.forEach(x => {
            x.bOrder.forEach((y,i) => {
                if (y != -1) {
                    bOrderTotals[i] += y;
                    bOrderCounts[i]++;
                }
            });
        });

        // Now get the coordinate order by figuring out what the most common
        // mapping to each coordinate was.
        let bOrder = bOrderCounts.map((count,i) => (count > 0) ? Math.round(bOrderTotals[i] / count) : -1);

        // If any coordinate order is `-1`, then there was too much ambiguity to
        // figure out, and we cannot continue.
        if (bOrder.indexOf(-1) != -1) {
            return null;
        }

        //appOut.value += `bOrder: ${bOrder.join(',')}\n`;

        // Use that to reorder the coordinates to match what they are in A.
        // Translate A and B to the same origin.
        let fixedA = coordsA.map(coords => coords.map((coord,i) => coords[i] - results.aOffset[i]));
        let fixedB = coordsB.map(coords => coords.map((coord,i) => {
            return coords[bOrder[i]] - results.bOffset[bOrder[i]];
        }));

        // Take the matches (via index), figure out how the signs compare the
        // most commonly, and use that to fix the signs in B.

        // `<0`: Flip the sign, `=0`: We don't know yet, `>0`: Leave sign alone.
        let signs = new Array<number>(coordsB[0].length).fill(0);
        results.matches.forEach(match => {
            let a = fixedA[match.a];
            let b = fixedB[match.b];
            let r = new Array<number>(a.length);
            let valid = true;
            for (let i = 0; i < a.length; i++) {
                if ((a[i] != 0) && (b[i] != 0)) {
                    if ((a[i] > 0) == (b[i] > 0)) {
                        // Same sign
                        r[i] = 1;
                    } else {
                        // Different sign
                        r[i] = -1;
                    }
                } else if ((a[i] == 0) && (b[i] == 0)) {
                    // Can't tell
                    r[i] = 0;
                } else {
                    // One is zero, the other isn't, meaning this isn't actually
                    // a match.
                    valid = false;
                    break;
                }
            }
            if (valid) {
                // Only count the results if we haven't definitely ruled this
                // out from being a match.
                r.forEach((s, i) => {
                    signs[i] += r[i];
                });
            }
        });

        //appOut.value += `${JSON.stringify(signs)}\n`;

        // If `signs` contains a 0, then the data is too ambiguous to fix.
        if (signs.indexOf(0) != -1) {
            return null;
        }

        // Use `signs` to fix the signs in B.
        fixedB = fixedB.map(coords => coords.map((coord, i) => (signs[i] > 0) ? coord : -coord));

        // At this point, `fixedB` represents the same coordinate space as
        // `coordsA`, so now we can go through and find *definite* matches.

        let matches = Array<{indexA: number, indexB: number}>();
        let a = fixedA.map((coords, i) => { return {coords: coords, index: i}; });
        let b = fixedB.map((coords, i) => { return {coords: coords, index: i}; });
        a.forEach(fromA => {
            var indexFromB = b.findIndex(fromB => fromB.coords.every((coordFromB, i) => fromA.coords[i] == coordFromB));
            if (indexFromB != -1) {
                // Found a match.
                matches.push({indexA: fromA.index, indexB: b[indexFromB].index});
                b.splice(indexFromB, 1);
            }
        });

        if (matches.length >= minimumMatchesRequired) {
            // Finally, return which entries are common between the two arrays,
            // along with the transformations necessary for B to convert it to
            // the same coordinate space as A.
            return {matches, bOrder, signs: signs.map(x => (x > 0) ? 1 : -1)};
        }
        return null;
    }

    function run (mode: number) {
        // [scanner][beacon][coordinate]
        var scanner = new Array<Array<Array<number>>>();
        scanner.push(new Array<Array<number>>());

        appOut.value = `== Phase ${mode} ==\n`;

        appIn.value.split("\n").forEach((inTxtRaw) => {
            if (!inTxtRaw || !inTxtRaw.trim()) {
                // If string is null, empty, or whitespace.

                // Create new beacon container if we haven't already.
                if (scanner[scanner.length - 1].length) {
                    scanner.push(new Array<Array<number>>());
                }
                return;
            }
            var inTxt = inTxtRaw.trim();

            // Parse coordinates as numbers, then add to current scanner.
            var coords = inTxt.split(',').map(x => parseInt(x.trim()));
            if (!coords.some(x => isNaN(x))) {
                // Only add if all coordinates are actually numbers.
                scanner[scanner.length - 1].push(coords);
            }
        });
        if (scanner[scanner.length - 1].length == 0) {
            scanner.pop();
        }

        // Each sensor has its own orientation and offset, so the coordinate
        // data is essentially randomized as to which axis is which, positive
        // or negative, and what constant is added to all coordinates relative
        // to where they are in world space.

        // `findBeacons` will return a list which shows which entry in one array
        // matched which entry in the other array, as well as the operations
        // necessary to convert the second array into the same coordinate space
        // as the first array.

        // [current = key(scanner, beacon)][next = key(scanner, beacon) | null].
        // `current` is where you are now, `next` is where you go next, and will
        // be `null` when you've encountered the first time the beacon was
        // discovered.
        var aliases = new Map<number, number>();
        // getKey(ToHere, FromHere)
        var scannerPositions = new Map<number, Array<number>>();
        // getKey(Source, Destination) --> Convert source coordinates to destination coordinate systems
        var scannerTranslations = new Map<number, {bOrder: Array<number>, signs: Array<number>}>();
        
        for (let scannerIndexA = 0; scannerIndexA < scanner.length; scannerIndexA++) {
            let beaconsA = scanner[scannerIndexA];
            for (let scannerIndexB = scannerIndexA + 1; scannerIndexB < scanner.length; scannerIndexB++) {
                //appOut.value += `${scannerIndexA},${scannerIndexB}\n`;
                let beaconsB = scanner[scannerIndexB];
                let results = findBeacons(beaconsA, beaconsB);
                
                if (results) {
                    // Try to calculate `B`'s position based on `A`.
                    let BfromAKey = getKey(scannerIndexB, scannerIndexA);

                    let offsetA = beaconsA[results.matches[0].indexA];
                    let offsetB = beaconsB[results.matches[0].indexB].map((v,i,a) => a[results.bOrder[i]] * results.signs[i]);

                    let BfromA = offsetB.map((x,i) => offsetA[i] - x);
                    scannerPositions.set(BfromAKey, BfromA);
                    scannerTranslations.set(BfromAKey, {bOrder: results.bOrder, signs: results.signs});

                    // Now `A` based on `B`.
                    let AfromBKey = getKey(scannerIndexA, scannerIndexB);

                    let reverseOrder = results.bOrder.map((x,i,a) => a.indexOf(i));
                    /*offsetB = beaconsB[results.matches[0].indexB];
                    offsetA = beaconsA[results.matches[0].indexA].map((v,i,a) => a[reverseOrder[i]] * results.signs[reverseOrder[i]]);
                    
                    let AfromB = offsetA.map((x,i) => offsetB[i] - x);*/
                    
                    // Just take distance from A to B and negate it, then do the translation.
                    scannerPositions.set(AfromBKey, BfromA.map((v,i,a) => a[reverseOrder[i]] * results.signs[reverseOrder[i]] * -1));
                    scannerTranslations.set(AfromBKey, {bOrder: reverseOrder, signs: results.signs.map((v, i, a) => a[reverseOrder[i]])});
                }

                // Fill out the aliases between the two sensors.
                beaconsA.forEach((beaconA, beaconIndexA) => {
                    let match = results?.matches.find(match => match.indexA == beaconIndexA);
                    let currKeyA = getKey(beaconIndexA, scannerIndexA);
                    // When a scanner is `A`, all beacons not currently aliased
                    // to another scanner are marked as unique to it.
                    if (!aliases.has(currKeyA)) {
                        aliases.set(currKeyA, null);
                    }
                    if (match) {
                        let currKeyB = getKey(match.indexB, scannerIndexB);
                        // When a scanner is `B`, everything common to it an `A` are
                        // marked as being an alias to `A`, if it's not already an alias
                        // to somewhere else.
                        if (!aliases.has(currKeyB)) {
                            let destination = aliases.get(currKeyA);
                            aliases.set(currKeyB, (destination === null) ? currKeyA : destination);
                        }
                    }
                });        
            }
        }
        // Finish filling out aliases.
        scanner[scanner.length-1].forEach((beaconA, beaconIndexA) => {
            let currKeyA = getKey(beaconIndexA, scanner.length-1);
            // When a scanner is `A`, all beacons not currently aliased
            // to another scanner are marked as unique to it.
            if (!aliases.has(currKeyA)) {
                aliases.set(currKeyA, null);
            }
        });

        // Use a BFS to fill in the rest of the sensor positions and translations.
        let unknowns = new Array<{start: number, target: number, attempts: number}>();
        for (let startScanner = 0; startScanner < scanner.length; startScanner++) {
            for (let targetScanner = startScanner+1; targetScanner < scanner.length; targetScanner++) {
                if (!scannerPositions.has(getKey(targetScanner, startScanner))) {
                    // We don't have the position of `targetScanner` from scanner `startScanner`.
                    unknowns.push({start: startScanner, target: targetScanner, attempts: 0});
                }
            }
        }
        let lastAttempts = 0;
        while (unknowns.length) {
            let currUnknown = unknowns.shift();
            if (currUnknown.attempts != lastAttempts) {
                // This was so I could put a breakpoint here.
                lastAttempts = currUnknown.attempts;
                if (lastAttempts >= 20) {
                    // Failsafe...
                    break;
                }
            }

            let startScanner = currUnknown.start;
            let targetScanner = currUnknown.target;
            let nextPath = new Array<Array<number>>();
            let resultPath: Array<number>;
            // Start at the start scanner.
            nextPath.push([startScanner]);
            while (nextPath.length) {
                // Get next scanner.
                let currPath = nextPath.shift();
                let currScanner = currPath[currPath.length-1];
                if (currScanner == targetScanner) {
                    // We found a path that reaches the start scanner.
                    resultPath = currPath;
                    break;
                }
                // Push all scanners you can reach from this scanner.
                for (let i = 0; i < scanner.length; i++) {
                    if (scannerPositions.has(getKey(i, currScanner)) && (currPath.indexOf(i) == -1)) {
                        nextPath.push([...currPath, i]);
                    }
                }
            }
            if (resultPath) {
                let currPos = new Array<number>(scanner[0][0].length).fill(0);
                let currSigns = new Array<number>(currPos.length).fill(1);
                let currOrder = new Array<number>(currPos.length).fill(0);
                currOrder.forEach((x,i) => currOrder[i] = i);
                while (resultPath.length) {
                    let currScanner = resultPath.pop();
                    let prevScanner = resultPath[resultPath.length-1];
                    if (prevScanner === undefined) {
                        let BfromAKey = getKey(targetScanner, currScanner);
                        scannerPositions.set(BfromAKey, currPos);
                        scannerTranslations.set(BfromAKey, {bOrder: currOrder, signs: currSigns});

                        let AfromBKey = getKey(currScanner, targetScanner);
                        let reverseOrder = currOrder.map((x,i,a) => a.indexOf(i));
                        scannerPositions.set(AfromBKey, currPos.map((v,i,a) => a[reverseOrder[i]] * currSigns[reverseOrder[i]] * -1));
                        scannerTranslations.set(AfromBKey, {bOrder: reverseOrder, signs: currSigns.map((v, i, a) => a[reverseOrder[i]])});
                        //appOut.value += `Calculated: Order:${currOrder.join(',')} Signs:${currSigns.join(',')}\n`;
                        break;
                    }
                    let currDistance = scannerPositions.get(getKey(currScanner, prevScanner));
                    let currTranslation = scannerTranslations.get(getKey(currScanner, prevScanner));
                    currPos = currDistance.map((x,i,a) => (currPos[currTranslation.bOrder[i]] * currTranslation.signs[i]) + a[i]);
        
                    currOrder = currOrder.map((x,i,a) => a[currTranslation.bOrder[i]]);
                    currSigns = currSigns.map((x,i,a) => a[currTranslation.bOrder[i]] * currTranslation.signs[i]);
                }
            } else {
                currUnknown.attempts++;
                unknowns.push(currUnknown);
            }
        }


        //let compareTranslation = scannerTranslations.get(getKey(4, 0));
        //appOut.value += `Check: Order:${compareTranslation.bOrder.join(',')} Signs:${compareTranslation.signs.join(',')}\n`;
        
        /*[...aliases.entries()].sort((a,b) => a[0] - b[0]).forEach(x => {
            var a = fromKey(x[0]);
            var b = (x[1] !== null) ? fromKey(x[1]) : null;
            appOut.value += `S:${a.y} B:${a.x} -> ${(b !== null) ? ("S:" + b.y + " B:" + b.x) : '-'}\n`;
        });*/

        /*[...scannerPositions.entries()].sort((a,b) => a[0] - b[0]).filter(x => fromKey(x[0]).y == 0).forEach(x => {
            let scannerNums = fromKey(x[0]);
            appOut.value += `From ${scannerNums.y}, position of ${scannerNums.x}: ${x[1].join(',')}\n`;
        });*/

        // Phase 1
        var uniqueBeacons = [...aliases.entries()].filter(x => x[1] === null).map(x => x[0]);


        // Phase 2
        // I'm sure there's a better way but I just don't know enough math.
        var positions = [...scannerPositions.entries()].filter(x => fromKey(x[0]).y == 0).map(x => x[1]);
        positions.push(new Array<number>(scanner[0][0].length).fill(0)); // for scanner 0, which is serving as the origin.
        var distances = new Array<number>();
        for (var x = 0; x < positions.length; x++) {
            for (var y = x+1; y < positions.length; y++) {
                var result = 0;
                for (var i = 0; i < positions[x].length; i++) {
                    result += Math.abs(positions[x][i] - positions[y][i]);
                }
                distances.push(result);
            }
        }

        //appOut.value += `${distances.join(',')}\n`;
        var p2Output = Math.max.apply([], distances);

        switch (mode) {
            case 1:
                appOut.value += `Output: ${uniqueBeacons.length} unique beacons.\n`;
                break;
            case 2:
                appOut.value += `Output: ${p2Output}\n`;
                break;
        }
    }
};
