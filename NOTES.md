This file assumes you're already familiar with [each day's puzzle](https://adventofcode.com/2021).
# General
I chose TypeScript because I wanted to use a language that didn't require much configuration and boilerplate code to get running, since `<irony>`I didn't want to dump a lot of time into something that was supposed to be a quick daily challenge`</irony>`. Added bonus: I get an HTML/CSS frontend for free. I also briefly considered C++.

# Day 1, 2
I spent most of my time setting up my dev environment, figuring out the project structure, and working on an extremely festive and pretty and not at all garish UI. There were plans to allow the input/output change layouts depending on what the day's puzzle required, but after a few days, it seemed like it wouldn't be necessary, the puzzles seem constrained to "here's your input, I just want a number as the output".

# Day 3
I got turned around on phase 2 because I forgot, when you want to calculate the average value of a list, and you're removing items from the list, the number you divide your sum by needs to update.

# Day 4
Phase 1 went perfecty but it turns out it was a fluke that it did, because in order to determine the order the boards won, I counted the number of markers on each board, instead of the number of *turns* each board had. Phase 2 wanted the board which won *last*, and by only counting markers, I ended up with several. I'm not sure why my first instinct was to count markers instead of turns, but that's what happened.

# Day 5
This was when I decided to make a commit after passing phase 1 on each day, because this puzzle's code needed to be completely written between phases. There's a ton of comments and calculations going on here, but my solution to phase 2 was to treat it like collision detection in a game. It wasn't until the next day that I realized most people were probably just plotting the lines as they're scanned in, either in a giant array or in some kind of sparse matrix or hashmap.

There were two difficulties:
1. X-shaped collisions are complicated.
   - I came up with ways to simplify all of the types of intersections, and my initial solution for X-shaped collisions was to skew the Y axis so that the down-right line became horizontal, and the up-right line doubled its slope (I already use this skew transformation to check whether parallel diagonal lines are overlapping).
   - This wasn't the right approach though, because it just wouldn't work. We're doing a pixel-style collision test, so an X intersection will cycle between collision and non-collision as you increase X or Y by one, and the skew method spoils this.
   - I ended up talking myself through a "mathy" way to figure out whether two diagonal lines intersect, and figuring out an equation to determine which coordinate the intersection happens on. This is what worked.
2. There was a bug in my coordinate translation code.
   - Even with the corrected X-intersections, the output was still short on some intersections.
   - To get an idea of what the output was *supposed* to be, I brute forced the intersections by plotting the lines as they were scanned in, using a `Map` where each key was a coordinate.
   - A discrepancy between the output of the plot and the output of the collision detection was observed. The input was trimmed until it was just 4 lines which created the discrepancy. (I kept them in the comments)
      - I would delete lines in batches of 10 and rerun the solution, adding lines back in whenever the lines I removed caused the outputs to converge.
   - All of the failing collisions were vertical / up-right. These situations are converted into horizontal/down-right by doing a flip and a swap.
   - There's a comment in the code where the bug was. The coordinate translation function would translate correctly, but would fail to correctly *undo* the translation when there was both a flip and a swap, because I had copy-pasted the code, and "flip" was operating on the wrong variable. There'd be no issue if the flip was by itself or with a skew.

And finally, phase 2 passed. I was up until 4am the night-of, and then all the next day, up until an hour before day 6 unlocked, working on this one puzzle. That's just how it goes sometimes.

# Day 6
I interpreted the puzzle too literally by writing a class to represent the lanternfish. At 80 iterations, it was fine, but when phase two asked for 256 iterations, haha that won't scale at all! :D

The laternfish have no properties aside from their timer value, so they can be represented by a queue instead. The problem was, I initialized the queue to 8 spaces. I needed 9. Because 0 to 8 is 9 spaces. :D That was much easier to fix than the previous day!

# Day 7
This puzzle requires knowledge of statistics and analytics. I did take statistics in college, but that was over a decade ago and I'm super rusty. Still, I randomly tried calculating the mean and the median of the input data, and it lined up perfectly with the puzzle's demo input, and I passed phase 1 pretty quickly.

Phase 2, on the other hand, is where I think everyone got tripped up. I tried just swapping the median with the mean, and it didn't arrive at the correct solution. What's tragic is, it was only one off! I figured, if you plotted the fuel consumption for every possible position, the results would have a bell-shaped curve where the minimum was close to the mean. There might be other variations that can throw off a minimum-finding algorithm, but the most minimal minimum was probably close to the mean, because that minimized the distance the farthest outliers would need to travel.

I ended up just starting at the mean and printing a bunch of values surrounding it, and hand-picking the minimum value, and that's how I passed phase 2. But I still wanted to know what the non-brute force solution was.

After looking it up, and seeing some great explanations from people smarter than I am, this puzzle plays with `L1-norms` and `L2-norms`. These are two different magnitudes for vectors: the L1-norm is the Manhattan distance (sum of X and Y), and the L2-norm is the Euclidean distance (pythagorean theorem). The `median` is how you minimize the L1-norm, and the `mean` is how you minimize the L2-norm (that was my takeaway anyway). However, in phase two, the fuel consumption isn't squared, it's the triangle sum (1 + 2 + 3 + ... + N-1 + N) instead. Therefore, we're working with a "norm" which is kinda between L1 and L2. I'm sure there's an actual math formula which can figure out the minimal value exactly, but the `mean` still gets you close enough, though there's still a slight error you have to deal with. Since this puzzle wants you to round, this manifests as rounding in the "wrong" direction.

This is why the `mean` is *almost but not quite* the correct value, and why we all got thrown off by rounding. However, knowing that the mean is slightly off, and that we need to round, and that we're dealing with something *between* an L1 and L2 norm, we can take the `mean`, round towards the `median` and that'll probably be right most of the time. At least, that's probably the direction you'd need to go anyway. To figure it out exactly, some kind of iterative function would be helpful, and I'd try something like a binary search algorithm initially.

That's all extra though. Thankfully, the puzzle is done, but I learned something.

# Day 8
What an interesting way to think of 7-segment displays! As a kid, I noticed that `2` was the only digit where the bottom right segment was unlit, and I never knew when that random tidbit of information would ever come in handy. It turns out, you only need to know two discrete segments in order to decode all of the digits: bottom-right and bottom-left.

My difficulty here was, I kept thinking of XOR by default, even when what I *actually* wanted to do was a bitwise AND with an inverse mask. Anyway, check it out:

- `1`, `4`, `7`, and `8` are free, because they all have a unique amount of lit segments (2, 4, 3, and 7 respectively). You knew this already because the puzzle tells you.
- You have two groups of unknowns:
   - Unknowns with 5 segments lit: `2`, `3`, `5`.
   - Unknowns with 6 segments lit: `0`, `6`, `9`. (nice)
- `2` is the only digit where the bottom-right segment is unlit. Let's call that segment `BR`.
   - Find the segment which is present in all except one digit. This is `BR`.
   - Find the only digit which lacks `BR`. This is `2`.
- When you find `2`, take the inverse of its segments (as `~2`) and use it as a mask on the remaining two 5-segment unknowns (as `n`):
   - If `n AND ~2` gives you just segment `BR`, then you've found `3`.
   - If `n AND ~2` gives you segment `BR` and one other segment, then you've found `5`.
- When you have `3` and `5`, take the inverse of `3`'s segments (as `~3`) and mask `2` with it.
   - `2 AND ~3` gives you the bottom-left segment, which we'll call `BL`.
- All 5-segment unknowns are now known, leaving just the 6-segment unknowns.
   - Create a `6` mask by adding segment `BL` to `5`, and use that to find which unknown is `6`.
   - Create a `9` mask by taking `8` (or a mask with all segments) and subtracting `BL` from it. Use this to find which unknown is `9`.
   - The last remaining unknown is therefore `0`, by process of elimination.
- Congratulations, you've decoded all digits!

This was fun to puzzle out, even though I now know there are more efficient solutions.

# Day 9
I started out with something like how GIF dithering works, where the cells are checked as they're scanned in, where you only have the cells to the left, and the cells on the upper rows available (and then I was going to scan through the results and finish checking the right and bottom neighbors of each).

However, the logic was much simpler if the *previous* line is checked as the current line is scanned in, with the current cell being the bottom neighbor (and then don't forget to scan the last line when the scan-in is complete).

Phase 2 was just a matter of adding the floodfill algorithm on the results of phase 1, while trusting that the puzzle input would exactly match the puzzle's description of the input without any faults. :D (That is, each region is bounded by `9`s and there's exactly one low point per region)

Surprisingly straightforward, no issues, no difficulties, I didn't get mixed up, it's nice to have a day like that, huh?

# Day 10
To match brackets, you need to keep track of which opening brackets you've encountered, and in what order. A `stack` is convenient for this.

For now, just assume each opening bracket has one unique closing bracket, but with the side note that in reality, [some languages are more complicated](https://github.com/microsoft/vscode/pull/132504). :P

When you encounter an opening bracket, push the corresponding closing bracket on the stack.

When you encounter a closing bracket, pop the stack and check, does your current character match what you popped off the stack?
- If it does, you're good! Keep parsing.
- If it's *different*, then you've just found a mismatched closing bracket.

If you successfully parse the entire line and don't find any mismatched brackets, your `stack` will conveniently contain all of the closing brackets required to complete the line, and in the correct order!

I really like how phase 2 is scored: For each remaining bracket:
1. Multiply the running score by 5.
2. Add 1, 2, 3, or 4 to the score, depending on which bracket it is.

This is very similar to bit shifting, except instead of bits, you're dealing with values which are between \[0..4\], all stored in a single number. If you multiply by 2 and only have values between 0 and 1, *then* you have bit shifting, but what happens [if you don't limit yourself to integers?](https://en.wikipedia.org/wiki/Arithmetic_coding)

# Day 11
Another puzzle where it's helpful to use a `stack`! Iterate over your grid of octopuses, and when one flashes, mark it as `flashed` and add all 8 neighboring octopuses (if they exist) to a stack. Once you're finished looking at the whole grid, keep popping octopuses off of your stack (and iterating on them) until the stack finally becomes empty. Count how many are marked as `flashed`, reset those to `0`, and you're done with one step.

Part 2 is as straightforward as running until every single octopus in the grid is marked `flashed` at the end of the step.

You know, repeatedly popping a self-refilling stack until it's empty is a lot like the `floodfill` algorithm I used in puzzle 9-2. This is the third day in a row requiring stacks, I wonder how much more complicated things will get? Especially when day 5 was the one that was *my* most complicated one. :P

# Day 12
This is a `graph traversal` puzzle, and my solution involves a recursive `depth-first search` where the search doesn't terminate until we run out of valid nodes to check.

Normally, when you traverse a graph, you need to keep track of which nodes you've already visited, but we also need some way of *rewinding* that information when we backtrack to check the other branches. This is why I went with a recursive function even though I normally don't like those.

An immutable snapshot of the current "state" is passed to each recursive call:
- The current path from `start` to here
   - Allows us to print the path without needing to trace back to `start`
   - Contains all of the visited nodes so far
- Whether we're still allowed to revisit "small cave" nodes or not
- Create a new, "updated" snapshot to pass to the next recursive call

Because each call contains its own snapshot of the state, we get the "rewinding" property we want when the DFS backtracks to traverse the next branch.

For this one, it actually took me an hour just to come up with a way to solve the puzzle at all, but once I figured it out, it was 30 minutes of code-writing to implement, and then another 30 minutes for phase 2. This was the first one I needed to write on a notepad to figure out. :P

My solution for phase 2 is, so far, the only one that noticably takes a second or two to complete. All of my other solutions so far are instant on my machine. I wonder if there's a way to improve this?

# Day 13
When you think about it, a fold is kinda like a horizontal or vertical flip that only affects the dots on half the canvas, so that's how I handled this one.

For a fold across an `X` position, pretend you want to horizontally flip a rectangular region with a width of `(X * 2)`, except you only modify the dots whose `X` coordinate is greater than the flip position. The `width` of the canvas then shrinks to the `X` position the fold happened at.

You do the same thing for vertical folds, but with `Y` instead of `X`.

I only kept track of dot coordinates, I didn't plot anything until phase 2 required a printout. Like day 5, coordinates were serialized into a single 48-bit integer each: `(X | (Y << 24))`. When you sort this, it sorts the coordinates into raster order, which is convenient when you plot by sequential printing.

# Day 14
Phase 1 is easy, if you only need 10 iterations, you can just scan your input string again and again, evolving it each time, until you've done it 10 times, and you'll get your result in less than a second.

Phase 2 is a doozy, because the puzzle asks for 40 iterations. Well, a string of 2 characters will become a string of about **1,099,511,627,777** characters (if I did my math right), so phase 1's solution is immediately out.

If you approach phase 2 with a divide-and-conquer algorithm (i.e, recursion), you can calculate the character counts without needing to calculate a string in the interim.

There's another neat trick, too: imagine you're at recursion depth 10. A pair of characters becomes `1024` characters to look at. If you get the pair `'XY'`, you can be assured that there will be several `'XY'` pairs appearing within these 1024 characters. Once we've computed the character counts for the pair `'XY'` at depth `10`, if we can just save those counts, we can call them back up later, whenever we're at depth `10` and find another `'XY'`, letting us skip the recursion for this pair.

That's right, caching. The solution I came up with sets up several recursion depths as "checkpoints" where we cache the results. I started with `(total iterations) / 2`, but wound up with `(total iterations) * 0.67`, where each checkpoint creates an additional checkpoint at `(current depth) * 0.67`.

It probably could be simpler, like setting a checkpoint every 10 levels, but this was the first thing that ended up working, so I stopped there. It still takes a second to actually get the answer back, but that's much better than having to wait overnight.

This really surprised me, because I was totally stumped until I started thinking about stuff like "is there some kind of *compression* I can do to remove the redundancy in the string?"

UPDATE: After looking at the solutions others came up with, the better solution doesn't involve recursion at all! Start by scanning the input and counting how many times each unique pair appears. That's becomes your *real* starting input. For the current step, scan through your array of pairs, and check against the rules to see what each pair expands into. For example, if there's two `AA`s, and `AA -> ABA`, then the next input will contain two `AB`s, and two `BA`s. Now scan again on the next input, and so on until you've reached the number of iterations you need. Finally, in the final array of unique pairs and their counts, count how many times each character appears in each pair, scaled by the pair's counter. I hate that I didn't think of this, but I'm happy I know it now, and by extension, happy I'm doing this advent. :P

# Day 15
I literally just used the A* pathfinding algorithm straight out of Wikipedia. I can't code the algorithm from memory but I knew it was the correct algorithm to try first.

In university, my algorithms class went over Dijkstra's algorithm, which aims to find the smallest-costing path through a graph, where each edge between nodes has a "cost" associated with it, and A* is an improved version with a better heuristic (so you check fewer nodes), and also the algorithm you learn about when you research pathfinding algorithms for video games.

A 2D grid is just like a graph with edges: when each cell has a "cost" associated with it, we can think of it the same way as the "cost" to cross an edge to enter one node from another. A grid without costs would just cost "1", like if you simply want to minimize how many nodes you need to visit, or how many cells to walk across.

# Day 16
I deal with serial protocols and bitstreams for my dayjob, so this wasn't anything special for me. Most of the time was spent writing the logic for taking a hex stream and consuming it bit-by-bit, since you can only read 4 bits at a time, and you need to keep track of the remainder, etc.

Phase 2 would've been super quick except I was incompletely decoding my number literals (Only the final digit actually got returned, rather than the full number with all the digits)! That apparently took me an hour to debug, but it shouldn't have:
1. Phase 1 passed, so the correct amount of packets were being decoded in the correct order without errors.
2. All of the operator tests passed. 
3. When examining the debugging output, all the calculations went off without a hitch. (This is what took the most time)
4. The only possible thing remaining was the decoding of number literals.

Got there eventually!

# Day 17
I solved phase 1 with just math, but still coded a function to compute the triangle sum anyway.

Phase 2 was the real challenge, and my comments within the program explain my thought process for how I got to my solution. Basically, I took the example, and also some graph paper, and looked for patterns.
First, split the problem into X axis and Y axis, just like collision detection. You can take the target region and compute all velocities which will reach there in `N` steps, if you shoot **in the direction of the target**.

I don't know of any fancy formulas, I just experimented until I came up with a formula which worked. The algorithm computes all velocities which will reach the target in `1` step, then in `2` steps, then `3`, and so on.

An extra step for the `Y` axis is, all **upwards velocities** will go up, then come back down to exactly `Y=0`, and then will proceed down the exact same path as one of the **downwards velocities**, so for each downwards velocity you calculate, you also can calculate an upwards "complement" which does the same thing, but with a predictable delay.

The result of these calculations is two lists, one for `X` and `Y`, which contain the velocities which reach the target region after `N` steps, for each value of `N`. If one velocity will **pass through the region over multiple steps**, that velocity will appear in each `N` it's inside the region.

Finally, you combine these two lists on their `N` values. All combinations of X and Y velocities which are inside the target region during the same step number are valid answers, which is why the list is grouped by step number.

There's an extra case for X velocities, if `velocity.X == currStepNum`, that represents a velocity where `object.X` **comes to a stop** inside the target region, which means `object.X` stays in the target region for `currStepNum` and then **all steps following**.
- That means, when `velocity.X == currStepNum`, all valid answers are all `velocity.Y` values inside the target Y region on all step numbers `N` where `currStepNum >= N`. (a.k.a., "this step and then all steps after this")

This is the second puzzle where I needed to stop and finish the next day, because it was getting too late at night. I usually try to finish these in the same night, but I'm starting to feel the effects of how much sleep I'm losing by doing that. Take care of yourselves, folks. :D

# Day 18
This is big and complicated and I hate it. :D

I just ignored the nested structure and scanned each equation as a flat array of numbers, and then a flat array of depths. I did it that way because part of the operations requires distributing values to adjacent numbers regardless of depth. As it turns out, you don't need to keep track of grouping, because only *pairs* can increase depth, so if you're looking for pairs above a depth of 4, the first index you find in your scan will *always* be the left half of a pair.

Sadly, I couldn't come up with anything clever for phase 2 after staring at it for almost two hours, so I just made it look at all permutations of equations to find which one had the biggest magnitude. It worked, but it won't scale well. Sometimes, you simply have to go with what works, and then come back to optimize it later.

# Day 19
This was the first one where I couldn't finish phase 1 in the same night, and I finally finished phase 2 about 2.5 hours into day 20 having been released, which I'm definitely not starting tonight.

Anyway, I didn't know where to start with this, but I did know I needed to compare two points while ignoring signs and coordinate ordering, and the idea for what to do stemmed from that.

Take two lists of points, `listA` and `listB`. Select two coordinates, `A` and `B` and subtract their values from `listA` and `listB` respectively, then check how many points match between the two lists. If `A` and `B` turned out to be the same `beacon`, then all of the other beacons common between the two lists will show up as matches. I looked for the pair of points which generated the largest list of matches and went with that.

This list of results is just *our best guess* of which points *might* match, there's still more work to do.

The function for checking if two points have the same coordinates does so by looking to see if each *value* in `A` exists somewhere in `B`. The return isn't just `true` or `false`, but the *order the coordinates matched in*, substituting a `-1` for coordinates which were duplicates (e.g., (1, 1, 5), (4, 8, 4)), and returning `null` if the points don't match at all.

Go through the matches and figure out which coordinate order appeared the most often. The `-1`s were just so points with duplicate coordinates could still contribute the position of the non-duplicate coordinate. Unless the data is very ambiguous, this should arrive at the coordinate order you need to use to translate `B` into `A`.

With an updated version of `listA` and `listB` with the same origin (the `beacon` which appeared in both lists and created our list of matches, since that so far is the only thing we know is **definitely** a match), and the same coordinate ordering (which comes from the previous step), go through the list of matches again.

Since they have the same coordinate ordering and the same origins, the coordinates for each matching beacon should be the same, *except for signs*. Figure out, between `A` and `B`, which coordinates seem to always have flipped signs, and which don't. This will tell you how to fix the signs in `listB`. Remember that `0` doesn't have any sign, so ignore those.

When you fix the signs in `listB`, it will now represent the same coordinate space as `listA`, so now is the time to repeat the scan to see which points match in both lists, and this time, the results are accurate and won't potentially contain false positives like the first scan.

My original implementation of the coordinate checker was actually *really slow* with large sets of data, and I had to use FireFox's profiler to figure this out and why; the garbage collector was going crazy. I left the original in there, commented out, next to the more efficient implementation. Long story short, don't use the `sort`, `filter`, etc functions of `arrays` in very hot code.

Phase 2 was another lengthy challenge, like phase 1.

For each `scanner`, take a known common `beacon` between them, and figure out the difference between their coordinates. This will give you the position of one scanner, relative to the other.

Let's say you have three scanners, `1` and `2` overlap, `2` and `3` overlap, but `1` and `3` *do not* overlap. To figure out the position of `3` relative to `1`, you have to use `2`.

Hopefully you saved the translations you figured out in phase 1 in order to convert between each list's coordinate space, because you'll need them for this. Take the position of `3` from `2`, which should be in `2`'s coordinate space. Then convert this to `1`'s coordinate space, and add to it the position of `2` from `1`.

It's necessary to have a way to figure out a `path` from a start scanner to a target scanner, because once you get that path, you walk from the target to the start, adding positions and converting between coordinate spaces each time.

With all the blanks filled in, it's a matter of actually taking the manhattan distances between every combination of points from the one `scanner` we picked to be the `origin`, and picking the biggest distance.

I'm sure there's a clever mathy way to figure it out quickly, but I think this marathon has gone far enough for today.

Definitely the hardest day so far, but day 5 isn't far behind.

# Day 20
I tried a really fancy solution first and, like most I imagine, completely overlooked the part where the image is supposed to be (virtually) infinite, and it wasn't until I looked closely at the lookup table of the puzzle input that I saw that fully blank and fully filled regions flash back and forth with each iteration, and that includes the border.

The strange thing is, I had a crazy amount of difficulty getting my offsets, edges, and other cutoffs lined up correctly, and I kept submitting wrong answers, I think maybe 8?

I'm sure this is an easy puzzle, but my brain must still be fried from yesterday. I spent all day on this, and was very close to giving up and just not finishing the advent based on how much time I just put into it the past few days.

That's what burnout is and why it's important to pace yourself if you're a programmer professionally; your office hours end for a good reason.

# Day 21
This one was finally simple. For phase 1, note that your dice rolls always result in a movement of 6, then 5, then 4, and so on.

Phase 2 was a slightly nicer version of day 12 if you can believe it. We want to find every "path" of dice rolls which leads to any player getting a score `>= 21`, but unlike day 12, the graph is a tree instead, which is *much* more predictable to scan.

We can use a depth-first search again, and it's nice because:
- We only move forwards or backwards.
- Player position and score is modified by reversible math.
- The math depends only on current state and current turn, no information from previous states is necessary.

Probably the hardest part was figuring out how to count universes:
- Figure out all permutations (with repetition) of making three rolls of 1, 2, or 3, then group them by *unique* sum.
- Count how many ways you get to one sum, and that's how many universes that sum generates.

So, for our search:
- The path is made of the *summed value* rolled during each turn. 
- When you get to a target (any player reaches the target score):
   - Look at the current path.
   - Convert the dice sums to the number of universes each sum generates.
   - Multiply them all together.
   - Add that product to the number of wins that player has so far.

Now just do that until you run out of possibilities (i.e, you're finished scanning the final edge of the root node and now there's nothing left) and that's phase 2 done.

This was a nice change from the cognitive overhead of the previous two days. :P
