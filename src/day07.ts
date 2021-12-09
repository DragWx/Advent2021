namespace day07 {
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
        var positions = Array<number>();
        appIn.value.split(",").forEach((currValue) => {
            positions.push(parseInt(currValue));
        });
        switch (mode) {
            case 1:                
                positions = positions.sort((a, b) => a - b);
                
                var average = positions.reduce((p, v) => p + v, 0);
                average /= positions.length;
                average = Math.round(average);

                var median = positions[Math.round(positions.length / 2)];

                var outAvg = positions.reduce((p, v) => p + Math.abs(average - v), 0);
                var outMed = positions.reduce((p, v) => p + Math.abs(median - v), 0);

                appOut.value += `Average: ${average}\nMedian: ${median}\nOutput(Avg): ${outAvg}\nOutput(Med): ${outMed}\n`;
                break;
            case 2:
                var doSum = function (input: number) {
                    return (input * (input + 1))/2;
                }
                var calculate = function (input: Array<number>, position: number): number {
                    return input.reduce((p, v) => p + doSum(Math.abs(position - v)), 0);
                }

                positions = positions.sort((a, b) => a - b);
                
                var average = positions.reduce((p, v) => p + v, 0);
                average /= positions.length;
                average = Math.round(average);

                var median = positions[Math.round(positions.length / 2)];

                appOut.value += `Average: ${average}\nMedian: ${median}\n`;

                var outAvg = calculate(positions, average);
                var outMed = calculate(positions, median);
                for (var i = average - 5; i <= average + 5; i++) {
                    appOut.value += `Using ${i}: ${calculate(positions, i)}\n`;
                }

                //appOut.value += `Average: ${average}\nMedian: ${median}\nOutput(Avg): ${outAvg}\nOutput(Med): ${outMed}\n`;
                break;
        }
    }
};
