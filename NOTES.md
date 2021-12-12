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
