"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const node_dns_1 = __importDefault(require("node:dns"));
node_dns_1.default.setDefaultResultOrder("ipv4first");
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL n'est pas définie dans les variables d'environnement");
}
const adapter = new adapter_pg_1.PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
exports.prisma = new client_1.PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
});
//# sourceMappingURL=prisma.js.map