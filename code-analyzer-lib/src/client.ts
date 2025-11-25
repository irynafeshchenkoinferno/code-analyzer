import { loadPackageDefinition, credentials } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import path from "path";
import fs from "fs";

const PROTO_PATH = path.resolve(__dirname, "./proto/analyzer.proto");
const packageDef = loadSync(PROTO_PATH);
const grpcObj = loadPackageDefinition(packageDef) as any;
const aiPackage = grpcObj.ai;

const client = new aiPackage.AiAgentService(
  "localhost:50051",
  credentials.createInsecure()
);

function* walk(dir: string): Generator<string> {
  for (let file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      yield* walk(full);
    } else {
      if (!full.includes("node_modules")) yield full;
    }
  }
}

// Unary call
client.GetResponse(
  { prompt: "function add(a,b){return a+b;}" },
  (err: any, response: any) => {
    console.log("Unary response:", response.text);
  }
);

const stream = client.StreamAnalyze((err: any, res: any) => {
  if (err) console.error(err);
  else console.log("AI Response:", res);
});


for (const filePath of walk(process.cwd())) {
  const content = fs.readFileSync(filePath, "utf-8");
  stream.write({ path: filePath, content });
}

stream.end();

// // Streaming call
// const stream = client.StreamResponse({
//   prompt: "function add(a,b){return a+b;}",
// });
// stream.on("data", (chunk: any) => console.log("Stream chunk:", chunk.text));
// stream.on("end", () => console.log("Stream ended"));
