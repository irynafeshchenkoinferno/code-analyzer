import path from "path";
import {
  loadPackageDefinition,
  ServerUnaryCall,
  sendUnaryData,
  Server,
  ServerCredentials,
} from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { analyzeCode } from "./analyzer";

const PROTO_PATH = path.join(__dirname, "proto/analyzer.proto");
const packageDef = loadSync(PROTO_PATH);
const grpcObj = loadPackageDefinition(packageDef) as any;
const aiPackage = grpcObj.ai;

const files: any[] = [];

function analyzeCodeRpc(
  call: ServerUnaryCall<{ prompt: string }, any>,
  callback: sendUnaryData<any>
) {
  const result = analyzeCode(call.request.prompt);
  callback(null, { text: JSON.stringify(result) });
}

function streamAnalyze(call: any, callback: any) {
  let fileCount = 0;

  call.on("data", (file: any) => {
    fileCount++;
    files.push(file);

    console.log(`Received file: ${file.path}`);
  });

  call.on("end", () => {
    console.log("Streaming finished");
    callback(null, {
      summary: `Project analyzed successfully`,
      fileCount
    });
  });
}

const server = new Server();
server.addService(aiPackage.AiAgentService.service, {
  GetResponse: analyzeCodeRpc,
  StreamAnalyze: streamAnalyze
});


const address = "0.0.0.0:50051";
server.bindAsync(address, ServerCredentials.createInsecure(), (err) => {
  if (err) throw err;
  console.log(`gRPC server running at ${address}`);
});
