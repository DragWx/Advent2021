namespace day06 {
    var appIn : HTMLTextAreaElement;
    var appOut : HTMLTextAreaElement;
    export function init (phase: number) {
        // Get our elements of interest
        appIn = document.getElementById("appIn") as HTMLTextAreaElement;
        appOut = document.getElementById("appOut") as HTMLTextAreaElement;
        return run;
    }

    function run (mode: number) {
        const fish = Array<Fish>();
        appOut.value = `== Phase ${mode} ==\n`;
        // Input is a CSV with timer values.
        appIn.value.split(",").forEach((currValue) => {
            fish.push(new Fish(parseInt(currValue.trim())));
        });
        appOut.value += `Start: ${fish.length}\n`;
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
