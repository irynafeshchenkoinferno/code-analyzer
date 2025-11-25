import { LogLevel } from "../const/logger";
import { Logger } from "./logger";

export class PromptValidation {
  private logger: Logger;

  constructor(logger?: Logger) {
    this.logger = logger || new Logger("[PromptValidation] ");
  }

  validatePrompt(prompt: any): string {
    try {
      if (!prompt || typeof prompt !== "string") {
        throw new Error("Invalid prompt: must be a non-empty string");
      }

      const trimmed = prompt.trim();
      this.logger.log(
        LogLevel.Info,
        `Prompt validated successfully: "${trimmed}"`
      );
      return trimmed;
    } catch (err: any) {
      this.logger.log(
        LogLevel.Error,
        `Prompt validation failed: ${err.message}`
      );
      throw err;
    }
  }
}
