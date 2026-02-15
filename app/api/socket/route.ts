import { Server as NetServer } from "http";
import { NextRequest } from "next/server";
import { Socket as NetSocket } from "net";
import { initIO } from "@/app/lib/socket";

interface SocketWithIO extends NetSocket {
  server: NetServer & {
    io?: any;
  };
}

interface NextApiResponseWithSocket extends NetServer {
  socket: SocketWithIO;
}

export async function GET(req: NextRequest) {
  try {
    const res = req as any;
    
    if ((res.socket as any)?.server?.io) {
      console.log("Socket already initialized");
      return new Response(JSON.stringify({ success: true, message: "Socket already initialized" }), {
        status: 200,
      });
    }

    const httpServer: NetServer = (res.socket as any)?.server;
    
    if (!httpServer) {
      return new Response(JSON.stringify({ error: "No HTTP server found" }), {
        status: 500,
      });
    }

    const io = initIO(httpServer);
    (res.socket as any).server.io = io;

    console.log("Socket initialized successfully");
    return new Response(JSON.stringify({ success: true, message: "Socket initialized" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error initializing socket:", error);
    return new Response(JSON.stringify({ error: "Failed to initialize socket" }), {
      status: 500,
    });
  }
}
