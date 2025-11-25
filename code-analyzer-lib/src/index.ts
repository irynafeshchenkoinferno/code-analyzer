import { GrpcServer } from "./services/grpc.service";

const server = new GrpcServer("0.0.0.0:50051");
server.start();