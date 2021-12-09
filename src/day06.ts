namespace day06 {
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
        const fish = Array<Fish>();
        const betterFish = Array<number>(9);
        appOut.value = `== Phase ${mode} ==\n`;
        // Input is a CSV with timer values.
        appIn.value.split(",").forEach((currValue) => {
            fish.push(new Fish(parseInt(currValue.trim())));
        });
        appOut.value += `Start: ${fish.length}\n`;
        switch (mode) {
            case 1:
                for (var i = 0; i < 80; i++) {
                    var newFish = 0;
                    fish.forEach(x => {
                        if (x.runDay()) {
                            newFish++;
                        }
                    });
                    while (newFish > 0) {
                        fish.push(new Fish(8));
                        newFish--;
                    }
                    appOut.value += `Day ${i + 1}: ${fish.length}\n`;
                }
                break;
            case 2:
                // We've only got 8 timer states to worry about.
                for (var i = 0; i < betterFish.length; i++) {
                    betterFish[i] = 0;
                }
                fish.forEach(x => betterFish[x.timer]++);
                for (var i = 0; i < 256; i++) {
                    var temp: number;
                    // Get 0, shift everything down one.
                    temp = betterFish.shift();
                    // Push this number of fish to the end (8)
                    betterFish.push(temp);
                    // Add these fish back to 6.
                    betterFish[6] += temp;
                    if ((i % 10) == 9) {
                        appOut.value += `Day ${i + 1}: ${betterFish.reduce((p, v) => p + v, 0)}\n`;
                    }
                }
                appOut.value += `End: ${betterFish.reduce((p, v) => p + v, 0)}\n`;
                break;
        }

    }
    class Fish {
        public timer: number;
        constructor(timer: number) {
            this.timer = timer;
        }
        public runDay(): boolean {
            if (this.timer == 0) {
                this.timer = 6;
                return true;
            }
            this.timer--;
            return false;
        }
    }
};
