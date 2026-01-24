export async function GET() {
  return Response.json(
    { 
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0"
    },
    { status: 200 }
  );
}
