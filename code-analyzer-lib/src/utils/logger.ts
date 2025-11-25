import { LogLevel } from "../const/logger";

export class Logger {
  private prefix: string;

  constructor(prefix: string = "") {
    this.prefix = prefix;
  }

  private format(level: LogLevel, msg: string) {
    const emoji =
      level === LogLevel.Info ? "ℹ️" : level === LogLevel.Warn ? "⚠️" : "❌";
    const timestamp = new Date().toISOString();
    return `${timestamp} ${emoji} ${this.prefix}${msg}`;
  }

  log(type: LogLevel, msg: string) {
    console.log(this.format(type, msg));
  }
}
