import { loadPackageDefinition, credentials } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import path from "path";

const PROTO_PATH = path.resolve(__dirname, "./proto/analyzer.proto");
const packageDef = loadSync(PROTO_PATH);
const grpcObj = loadPackageDefinition(packageDef) as any;
const aiPackage = grpcObj.ai;

const client = new aiPackage.AiAgentService(
  "localhost:50051",
  credentials.createInsecure()
);

// Unary call
client.GetResponse(
  { prompt: "function add(a,b){return a+b;}" },
  (err: any, response: any) => {
    console.log("Unary response:", response.text);
  }
);

// // Streaming call
// const stream = client.StreamResponse({
//   prompt: "function add(a,b){return a+b;}",
// });
// stream.on("data", (chunk: any) => console.log("Stream chunk:", chunk.text));
// stream.on("end", () => console.log("Stream ended"));
