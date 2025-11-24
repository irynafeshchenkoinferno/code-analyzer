import path from "path";
import { loadSync } from "@grpc/proto-loader";
import {
  loadPackageDefinition,
  ServerUnaryCall,
  sendUnaryData,
  Server,
  ServerCredentials,
} from "@grpc/grpc-js";

const PROTO_PATH = path.join(__dirname, "proto/analyzer.proto");

const packageDef = loadSync(PROTO_PATH, {
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const grpcObject = loadPackageDefinition(packageDef) as any;
const analyzerPackage = grpcObject.analyzer;

// Service implementation
function sayHello(
  call: ServerUnaryCall<{ name: string }, any>,
  callback: sendUnaryData<{ message: string }>
) {
  callback(null, { message: `Hello, ${call.request.name}!` });
}

// Start server
const server = new Server();
server.addService(analyzerPackage.AnalyzerService.service, {
  SayHello: sayHello,
});

server.bindAsync("0.0.0.0:50051", ServerCredentials.createInsecure(), () => {
  console.log("gRPC server running at port 50051");
  server.start();
});
