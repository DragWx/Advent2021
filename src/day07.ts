namespace day07 {
    var appIn : HTMLTextAreaElement;
    var appOut : HTMLTextAreaElement;
    export function init (phase: number) {
        // Get our elements of interest
        appIn = document.getElementById("appIn") as HTMLTextAreaElement;
        appOut = document.getElementById("appOut") as HTMLTextAreaElement;
        return run;
    }

    function run (mode: number) {
        appOut.value = `== Phase ${mode} ==\n`;
        var positions = Array<number>();
        appIn.value.split(",").forEach((currValue) => {
            positions.push(parseInt(currValue));
        });
        positions = positions.sort((a, b) => a - b);
        
        var average = positions.reduce((p, v) => p + v, 0);
        average /= positions.length;
        average = Math.round(average);

        var median = positions[Math.round(positions.length / 2)];

        var outAvg = positions.reduce((p, v) => p + Math.abs(average - v), 0);
        var outMed = positions.reduce((p, v) => p + Math.abs(median - v), 0);

        appOut.value += `Average: ${average}\nMedian: ${median}\nOutput(Avg): ${outAvg}\nOutput(Med): ${outMed}\n`;
    }
};
