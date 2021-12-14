namespace day14 {
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

    function doInsert(input: string, rules: Map<string, string>) {
        // Start with the first character of `input`.
        var output = input.substring(0,1);
        for (var i = 0; i < input.length - 1; i++) {
            // Look at pairs.
            var pair = input.substring(i, i+2);
            var insert = rules.get(pair) || "";
            output += insert + pair.slice(-1);
        }
        return output;
    }
    function doIncidence(input: string) {
        var counts = new Map<string, number>();
        for (var c of input) {
            if (counts.has(c)) {
                counts.set(c, counts.get(c) + 1);
            } else {
                counts.set(c, 1);
            }
        }
        var output = new Array<{element: string, count: number}>();
        counts.forEach((v, k) => { output.push({element: k, count: v}); });
        return output.sort((a, b) => a.count - b.count);
    }
    // A       A
    // A   B   A
    // A C B C A
    // ADCDBDCDA
    function doRecursiveInsert(left: string, right: string, rules: Map<string, string>, counts: Map<string, number>, cache: Map<string, Map<string, number>>, cachePoint: number, iterations: number) {
        // Figure out what we're inserting.
        var middle = rules.get(left + right);
        // Check if this particular pair at this depth was already computed.
        if (cache.has(iterations + left + right)) {
            // If it was, just add the results to the count.
            var cachedResults = cache.get(iterations + left + right);
            cachedResults.forEach((v, k) => { counts.set(k, (counts.get(k) || 0) + v); });
            return;
        }
        if ((iterations > 0) && middle) {
            // We need to recurse one level deeper.
            if ((cachePoint >= 4) && iterations == cachePoint) {
                // But first, we need to set up a new count container because we're
                // at a depth where we cache the result.
                var countsToCache = new Map<string, number>();
                // Recurse with fresh count container.
                doRecursiveInsert(left, middle, rules, countsToCache, cache, Math.floor(iterations * 0.67), iterations-1);
                doRecursiveInsert(middle, right, rules, countsToCache, cache, Math.floor(iterations * 0.67), iterations-1);
                // Add the results to the cache.
                cache.set(iterations + left + right, countsToCache);
                // And most importantly, add the results to the parent count container.
                countsToCache.forEach((v, k) => {counts.set(k, (counts.get(k) || 0) + v)});
            } else {
                // We're not caching the results at this depth, so just continue like usual.
                doRecursiveInsert(left, middle, rules, counts, cache, cachePoint, iterations-1);
                doRecursiveInsert(middle, right, rules, counts, cache, cachePoint, iterations-1)
            }
        } else {
            // We don't need to recurse any deeper, so now add `right` to counts.
            // As we unwind back up, we'll end up adding every character except the leftmost,
            // which is handled outside of our recursion.
            counts.set(right, (counts.get(right) || 0) + 1)
        }
    }
    function doInsertForIncidence(input: string, rules: Map<string, string>, iterations: number) {
        // This is like a combination of doInsert and doIncidence, except we
        // don't care what the final string output is, because it's !!HUGE!! and
        // we don't even need it for the puzzle solution.
        
        // We also take advantage of caching our results when we calculate.
        var counts = new Map<string, number>();
        // Key = depth + pair (e.g., "5XY")
        var cache = new Map<string, Map<string, number>>();
        // Start by counting the very first character (recursion will count the rest)
        counts.set(input.charAt(0), 1);
        for (var i = 0; i < input.length - 1; i++) {
            // Now do our fun recursive function for each pair in the input!
            // Don't worry, the computer *loves* it.
            doRecursiveInsert(input.charAt(i), input.charAt(i+1), rules, counts, cache, Math.floor(iterations * 0.67), iterations);
        }
        // Now finish the same way doIncidence does, by returning a sorted array.
        var output = new Array<{element: string, count: number}>();
        counts.forEach((v, k) => { output.push({element: k, count: v}); });
        return output.sort((a, b) => a.count - b.count);
    }
    function run (mode: number) {
        appOut.value = `== Phase ${mode} ==\n`;
        var readMode = 0;
        var polymer = "";
        var rules = new Map<string, string>();
        appIn.value.split("\n").forEach((inTxtRaw) => {
            if (!inTxtRaw || !inTxtRaw.trim()) {
                // If string is null, empty, or whitespace.
                readMode++;
                return;
            }
            var inTxt = inTxtRaw.trim();
            switch (readMode) {
                case 0:
                    // Template polymer.
                    polymer = inTxt;
                    break;
                case 1:
                    // Insertion pairs.
                    var curr = inTxt.split('->').map(x => x.trim());
                    rules.set(curr[0], curr[1]);
                    break;
            }
            
        });
        //appOut.value += `${polymer}\n`;
        //rules.forEach((v, k) => { appOut.value += `${k} -> ${v}\n` });

        switch (mode) {
            case 1:
                for (var i = 0; i < 10; i++) {
                    polymer = doInsert(polymer, rules);
                    //appOut.value += `${i+1}: ${polymer}\n`;
                }
                var incidence = doIncidence(polymer);
                //incidence.forEach(x => { appOut.value += `${x.element}: ${x.count}\n` });
                appOut.value += `Output: ${incidence[incidence.length-1].count - incidence[0].count}\n`;
                break;
            case 2:
                var incidence = doInsertForIncidence(polymer, rules, 40);
                //incidence.forEach(x => { appOut.value += `${x.element}: ${x.count}\n` });
                //appOut.value += `${i+1}: ${polymer}\n`;
                appOut.value += `Output: ${incidence[incidence.length-1].count - incidence[0].count}\n`;
                break;
        }
    }
};
