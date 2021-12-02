namespace day02 {
    var appIn : HTMLTextAreaElement;
    var appOut : HTMLTextAreaElement;
    export function init (phase: number) {
        // Get our elements of interest
        appIn = document.getElementById("appIn") as HTMLTextAreaElement;
        appOut = document.getElementById("appOut") as HTMLTextAreaElement;
        return run;
    }

    function run (mode: number) {
        var inCommands = Array<Command>();
        // Parse the input into command and number.
        appIn.value.split("\n").forEach(currLine => {
            var r = currLine.split(/\s+/);
            if ((r[0].toLowerCase() in CommandName)
                && !isNaN(parseInt(r[1]))) {
                var newCommand = new Command();
                newCommand.command = CommandName[r[0].toLowerCase()];
                newCommand.amount = parseInt(r[1]);
                inCommands.push(newCommand);
            }
        });
        var position = 0;
        var depth = 0;
        var aim = 0;
        switch (mode) {
            case 1: // Phase 1
                inCommands.forEach(x => {
                    switch (x.command) {
                        case CommandName.forward:
                            position += x.amount;
                            break;
                        case CommandName.down:
                            depth += x.amount;
                            break;
                        case CommandName.up:
                            depth -= x.amount;
                            break;
                    }
                });
                break;
            case 2: // Phase 2
                inCommands.forEach(x => {
                    switch (x.command) {
                        case CommandName.forward:
                            position += x.amount;
                            depth += aim * x.amount;
                            break;
                        case CommandName.down:
                            aim += x.amount;
                            break;
                        case CommandName.up:
                            aim -= x.amount;
                            break;
                    }
                });
                break;        
        }
        appOut.value = `== Phase ${mode} ==\nPosition: ${position}\nDepth: ${depth}\nOutput: ${position * depth}`;
    }
    enum CommandName {
        "forward",
        "down",
        "up"
    }
    class Command {
        public command: CommandName;
        public amount: number;
    }
};
