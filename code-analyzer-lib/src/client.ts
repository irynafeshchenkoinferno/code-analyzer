import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";

const PROTO_PATH = path.resolve(__dirname, "./proto/analyzer.proto");
const packageDef = protoLoader.loadSync(PROTO_PATH);
const grpcObj = grpc.loadPackageDefinition(packageDef) as any;
const aiPackage = grpcObj.ai;

const client = new aiPackage.AiAgentService("localhost:50051", grpc.credentials.createInsecure());

// Unary call
client.GetResponse({ prompt: "function add(a,b){return a+b;}" }, (err: any, response: any) => {
  console.log("Unary response:", response.text);
});

// Streaming call
const stream = client.StreamResponse({ prompt: "function add(a,b){return a+b;}" });
stream.on("data", (chunk: any) => console.log("Stream chunk:", chunk.text));
stream.on("end", () => console.log("Stream ended"));
