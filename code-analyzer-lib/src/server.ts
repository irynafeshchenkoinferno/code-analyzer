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

const PROTO_PATH = path.resolve(__dirname, "../src/proto/analyzer.proto");
const packageDef = loadSync(PROTO_PATH);
const grpcObj = loadPackageDefinition(packageDef) as any;
const aiPackage = grpcObj.ai;

function analyzeCodeRpc(
  call: ServerUnaryCall<{ prompt: string }, any>,
  callback: sendUnaryData<any>
) {
  const result = analyzeCode(call.request.prompt);
  callback(null, { text: JSON.stringify(result) });
}

const server = new Server();
server.addService(aiPackage.AiAgentService.service, {
  GetResponse: analyzeCodeRpc,
});

const address = "0.0.0.0:50051";
server.bindAsync(address, ServerCredentials.createInsecure(), (err) => {
  if (err) throw err;
  console.log(`gRPC server running at ${address}`);
});
