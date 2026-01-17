
import { connect } from "mongoose";

export default async function ConnectDb() {
try {
if (!process.env.mongodb_uri) {
throw new Error("mongodb_uri is not defined in .env file");
}

await connect(process.env.mongodb_uri);

console.log("✅ MongoDB connected successfully!!");
console.log(`📍 Database: ${process.env.mongodb_uri}`);
return true;
} catch (error) {
console.error("❌ MongoDB Connection Error:");
console.error(`   Error Message: ${error.message}`);
console.error(`   URI: ${process.env.mongodb_uri}`);

if (error.message.includes("mongodb_uri is not defined")) {
console.error("\n⚠️  SOLUTION:");
console.error("   1. Copy .env.example to .env");
console.error("   2. Update mongodb_uri in .env file");
console.error("   3. Make sure MongoDB is running");
console.error("   4. Restart the server");
} else if (error.code === "ECONNREFUSED") {
console.error("\n⚠️  SOLUTION:");
console.error("   MongoDB server is not running.");
console.error("   Please start MongoDB:");
console.error("   - Windows: mongod");
console.error("   - macOS: brew services start mongodb-community");
console.error("   - Docker: docker run -d -p 27017:27017 mongo");
}

process.exit(1);
}
}
