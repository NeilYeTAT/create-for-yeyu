import readline from "node:readline";

const TRAIN_FRAMES = [
  [
    "      ====        ________                ___________",
    "  _D _|  |_______/        \\__I_I_____===__|_________|",
    "   |(_)---  |   H\\________/ |   |        =|___ ___|",
    "   /     |  |   H  |  |     |   |         ||_| |_||",
    "  |      |  |   H  |__--------------------| [___] |",
    "  | ________|___H__/__|_____/[][]~\\_______|       |",
    "  |/ |   |-----------I_____I [][] []  D   |=======|__",
    "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__",
    " \\_/      \\__/  \\__/  \\__/  \\__/      \\_/",
  ],
  [
    "      ====        ________                ___________",
    "  _D _|  |_______/        \\__I_I_____===__|_________|",
    "   |(_)---  |   H\\________/ |   |        =|___ ___|",
    "   /     |  |   H  |  |     |   |         ||_| |_||",
    "  |      |  |   H  |__--------------------| [___] |",
    "  | ________|___H__/__|_____/[][]~\\_______|       |",
    "  |/ |   |-----------I_____I [][] []  D   |=======|__",
    "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__",
    " \\_/      \\O/  \\O/  \\O/  \\O/      \\_/",
  ],
];

const SMOKE_FRAMES = [
  [
    "                (  ) (@@) ( )  (@)  ()    @@    O     @     O     @      O",
  ],
  ["             (@@@)       (    )      (@@@)   ()      @    ()     @     ()"],
  [
    "         (   )      (@@@@)     (  )    @@     ()      @    ()     @      @",
  ],
  ["      (@@)              (@@@)           O        ()     @      ()    @"],
];

export interface TrainAnimation {
  start: () => void;
  stop: (success: boolean, message: string) => void;
  updateMessage: (message: string) => void;
}

export function createTrainAnimation(initialMessage: string): TrainAnimation {
  let isRunning = false;
  let frameIndex = 0;
  let smokeIndex = 0;
  let position = 0;
  let message = initialMessage;
  let intervalId: NodeJS.Timeout | null = null;

  const terminalWidth = process.stdout.columns || 80;
  const trainWidth = 55;
  const startPosition = terminalWidth;

  function clearLines(count: number): void {
    for (let i = 0; i < count; i++) {
      readline.moveCursor(process.stdout, 0, -1);
      readline.clearLine(process.stdout, 0);
    }
  }

  function render(): void {
    const train = TRAIN_FRAMES[frameIndex % TRAIN_FRAMES.length];
    const smoke = SMOKE_FRAMES[smokeIndex % SMOKE_FRAMES.length];

    const offset = startPosition - position;
    const displayLines: string[] = [];

    for (const line of smoke) {
      const paddedLine =
        offset > 0
          ? " ".repeat(Math.max(0, offset)) + line
          : line.slice(-offset);
      displayLines.push(paddedLine.slice(0, terminalWidth));
    }

    for (const line of train) {
      const paddedLine =
        offset > 0
          ? " ".repeat(Math.max(0, offset)) + line
          : line.slice(-offset);
      displayLines.push(paddedLine.slice(0, terminalWidth));
    }

    displayLines.push("");
    displayLines.push(`  🚂 ${message}`);

    if (position > 0) {
      clearLines(displayLines.length);
    }

    for (const line of displayLines) {
      console.log(line);
    }

    frameIndex = (frameIndex + 1) % TRAIN_FRAMES.length;
    smokeIndex = (smokeIndex + 1) % SMOKE_FRAMES.length;
    position += 3;

    if (position > startPosition + trainWidth + 10) {
      position = 0;
    }
  }

  return {
    start(): void {
      if (isRunning) return;
      isRunning = true;
      process.stdout.write("\x1B[?25l");

      const totalLines = SMOKE_FRAMES[0].length + TRAIN_FRAMES[0].length + 2;
      for (let i = 0; i < totalLines; i++) {
        console.log("");
      }
      clearLines(totalLines);

      intervalId = setInterval(render, 100);
    },

    stop(success: boolean, finalMessage: string): void {
      if (!isRunning) return;
      isRunning = false;

      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      const totalLines = SMOKE_FRAMES[0].length + TRAIN_FRAMES[0].length + 2;
      clearLines(totalLines);

      process.stdout.write("\x1B[?25h");

      const icon = success ? "✔" : "✖";
      const color = success ? "\x1b[32m" : "\x1b[31m";
      console.log(`${color}${icon}\x1b[0m ${finalMessage}`);
    },

    updateMessage(newMessage: string): void {
      message = newMessage;
    },
  };
}
