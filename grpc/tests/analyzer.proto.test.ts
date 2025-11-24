import path from "path";
import { loadSync } from "@grpc/proto-loader"
import { loadPackageDefinition, ServiceClientConstructor } from "@grpc/grpc-js";

const PROTO_PATH = path.resolve(__dirname, "../src/proto/analyzer.proto");

type AnalyzerPackage = {
  AnalyzerService: ServiceClientConstructor;
};

type GrpcObj = {
  analyzer: AnalyzerPackage;
};

describe("Analyzer proto file", () => {
  let grpcObj: GrpcObj;

  beforeAll(() => {
    const packageDef = loadSync(PROTO_PATH, {
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });
    grpcObj = loadPackageDefinition(packageDef) as GrpcObj;
  });

  it("should have 'analyzer' package", () => {
    expect(grpcObj.analyzer).toBeDefined();
  });

  it("should have 'AnalyzerService' service", () => {
    const analyzerPackage = grpcObj.analyzer;
    expect(analyzerPackage.AnalyzerService).toBeDefined();
    expect(analyzerPackage.AnalyzerService.service).toBeDefined();
  });

  it("should have SayHello RPC method", () => {
    const serviceMethods = grpcObj.analyzer.AnalyzerService.service;
    expect(serviceMethods.SayHello).toBeDefined();
    expect(typeof serviceMethods.SayHello).toBe("object");
  });
});
