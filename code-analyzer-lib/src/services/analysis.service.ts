import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { Logger } from "../utils/logger";
import { LogLevel } from "../const/logger";
import { PromptValidation } from "../utils/validate";

export class AnalysisService {
  private logger: Logger;
  private promptValidator: PromptValidation;

  constructor(logger: Logger, promptValidator: PromptValidation) {
    this.logger = logger;
    this.promptValidator = promptValidator;
  }

  analyzeCodeRpc(
    call: ServerUnaryCall<{ prompt: string }, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const prompt = this.promptValidator.validatePrompt(call.request.prompt);
      const result = this.analyzeCode(prompt);

      this.logger.log(LogLevel.Info, "Unary analysis executed");

      callback(null, { text: JSON.stringify(result) });
    } catch (err: any) {
      this.logger.log(LogLevel.Error, err.message);
      callback({ code: 3, message: err.message } as any, null);
    }
  }

  analyzeCode(code: string) {
    const lines = code.split("\n").length;
    const functions = (code.match(/function\s+\w+/g) || []).length;

    return { lines, functions };
  }
}
