import path from "path";
import { loadSync } from "@grpc/proto-loader"
import { loadPackageDefinition, credentials } from "@grpc/grpc-js";

const PROTO_PATH = path.join(__dirname, "proto/analyzer.proto");

const packageDef = loadSync(PROTO_PATH);
const grpcObject = loadPackageDefinition(packageDef) as any;
const helloPackage = grpcObject.analyzer;

const client = new helloPackage.AnalyzerService(
  "localhost:50051",
  credentials.createInsecure()
);

client.SayHello({ name: "TypeScript" }, (err: any, response: any) => {
  if (err) {
    console.error("Error:", err);
  } else {
    console.log("Response:", response.message);
  }
});
