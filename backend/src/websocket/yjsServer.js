import { WebSocketServer } from 'ws';
import { setupWSConnection, setPersistence } from './yjsUtils.js';
import { mongoPersistence } from '../lib/yjsPersistence.js';

export const initYjsWebSocketServer = (server) => {
  setPersistence({
    bindState: mongoPersistence.bindState,
    writeState: mongoPersistence.writeState,
  });

  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const url = new URL(
      request.url,
      `http://${request.headers.host || "localhost"}`
    );

    if (url.pathname.startsWith("/yjs")) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on("connection", (ws, req) => {
    const url = new URL(
      req.url,
      `http://${req.headers.host || "localhost"}`
    );
    
    const docName = url.pathname.replace(/^\/yjs\/?/, "");

    console.log(` Client connected to room/docName: ${docName}`);
    setupWSConnection(ws, req, { docName, gc: true });
  });

  console.log(" Yjs WebSocket Server is active and attached to HTTP Server");
};