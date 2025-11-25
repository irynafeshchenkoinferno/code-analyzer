import path from "path";
import {
  Server,
  ServerCredentials,
  ServerUnaryCall,
  sendUnaryData,
  loadPackageDefinition,
} from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { Logger } from "../utils/logger";
import { PromptValidation } from "../utils/validate";
import { AnalysisService } from "./analysis.service";
import { LogLevel } from "../const/logger";

type FileData = { path: string; content: string };

export class GrpcServer {
  private server: Server;
  private logger: Logger;
  private validator: PromptValidation;
  private aiPackage: any;
  private analysisService: AnalysisService;

  constructor(private address: string = "0.0.0.0:50051") {
    this.logger = new Logger("[AI Agent] ");
    this.validator = new PromptValidation(this.logger);
    this.analysisService = new AnalysisService(this.logger, this.validator);

    const protoPath = path.resolve(__dirname, "proto/analyzer.proto");
    const packageDef = loadSync(protoPath, {
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });
    const grpcObj = loadPackageDefinition(packageDef) as any;
    this.aiPackage = grpcObj.ai;

    this.server = new Server();
    this.server.addService(this.aiPackage.AiAgentService.service, {
      GetResponse: this.analyzeCodeRpc.bind(this),
      StreamAnalyze: this.streamAnalyze.bind(this),
    });
  }

  private analyzeCodeRpc(
    call: ServerUnaryCall<{ prompt: string }, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const prompt = this.validator.validatePrompt(call.request.prompt);
      const result = this.analysisService.analyzeCode(prompt);
      this.logger.log(LogLevel.Info, "Unary analysis executed");
      callback(null, { text: JSON.stringify(result) });
    } catch (err: any) {
      this.logger.log(LogLevel.Error, `Unary RPC error: ${err.message}`);
      callback({ code: 3, message: err.message } as any, null);
    }
  }

  private streamAnalyze(call: any, callback: any) {
    let fileCount = 0;
    const files: FileData[] = [];

    call.on("data", (file: FileData) => {
      if (!file.path || !file.content) {
        this.logger.log(
          LogLevel.Error,
          "Received invalid file object in stream"
        );
        return;
      }
      fileCount++;
      files.push(file);
      this.logger.log(LogLevel.Info, `Received file: ${file.path}`);
    });

    call.on("end", () => {
      this.logger.log(
        LogLevel.Info,
        `Streaming finished. Total files: ${fileCount}`
      );
      callback(null, { summary: "Project analyzed successfully", fileCount });
    });

    call.on("error", (err: any) => {
      this.logger.log(LogLevel.Error, `Stream error: ${err.message}`);
    });
  }

  public start() {
    this.server.bindAsync(
      this.address,
      ServerCredentials.createInsecure(),
      (err) => {
        if (err) {
          this.logger.log(
            LogLevel.Error,
            `Failed to bind server: ${err.message}`
          );
          process.exit(1);
        }
        this.logger.log(
          LogLevel.Info,
          `gRPC server running at ${this.address}`
        );
        this.server.start();
      }
    );

    process.on("SIGINT", () => {
      this.logger.log(LogLevel.Warn, "Shutting down gRPC server...");
      this.server.tryShutdown(() => {
        this.logger.log(LogLevel.Info, "Server closed");
        process.exit(0);
      });
    });
  }
}
