import { LogLevel } from "../const/logger";
import { FileData } from "../models/file";
import { Logger } from "../utils/logger";

export class StreamService {
  private logger: Logger;
  constructor(logger: Logger) {
    this.logger = logger;
  }

  streamAnalyze(call: any, callback: any) {
    let fileCount = 0;
    const receivedFiles: FileData[] = [];

    call.on("data", (file: FileData) => {
      if (!file.path || !file.content) {
        this.logger.log(LogLevel.Error, "Received invalid file object");
        return;
      }

      fileCount++;
      receivedFiles.push(file);

      this.logger.log(LogLevel.Info, `Received file: ${file.path}`);
    });

    call.on("end", () => {
      this.logger.log(LogLevel.Info, "File streaming finished");

      callback(null, {
        summary: `Project analyzed successfully`,
        fileCount,
      });
    });

    call.on("error", (err: any) => {
      this.logger.log(LogLevel.Error, `Stream error: ${err.message}`);
    });
  }
}
