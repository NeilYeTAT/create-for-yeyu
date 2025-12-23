import os from "node:os";

export function cowsay(text: string): string {
  const lines = text.split("\n");
  const maxLength = Math.max(...lines.map((line) => line.length));
  const paddedLines = lines.map((line) => line.padEnd(maxLength));

  const top = " " + "_".repeat(maxLength + 2);
  const bottom = " " + "-".repeat(maxLength + 2);

  let bubble: string[];
  if (paddedLines.length === 1) {
    bubble = [top, `< ${paddedLines[0]} >`, bottom];
  } else {
    bubble = [top];
    paddedLines.forEach((line, index) => {
      if (index === 0) {
        bubble.push(`/ ${line} \\`);
      } else if (index === paddedLines.length - 1) {
        bubble.push(`\\ ${line} /`);
      } else {
        bubble.push(`| ${line} |`);
      }
    });
    bubble.push(bottom);
  }

  const cow = [
    "        \\   ^__^",
    "         \\  (oo)\\_______",
    "            (__)\\       )\\/\\",
    "                ||----w |",
    "                ||     ||",
  ];

  return [...bubble, ...cow].join("\n");
}

export function getFormattedDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const weekday = weekdays[now.getDay()];

  return `${year}-${month}-${day} ${weekday}`;
}

export function getGreetingMessage(): string {
  const username = os.userInfo().username;
  const date = getFormattedDate();

  return `Hello, ${username}!\nToday is ${date}`;
}
