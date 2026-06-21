import jwt from "jsonwebtoken";
import { WebSocket, WebSocketServer } from "ws";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface UserConnection {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: UserConnection[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === "string" || !decoded.userId) {
      return null;
    }

    return String(decoded.userId);
  } catch {
    return null;
  }
}

wss.on("connection", function connection(ws, request) {
  const url = request.url ?? "";
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") ?? "";
  const userId = checkUser(token);

  if (!userId) {
    ws.close();
    return;
  }

  const userConnection: UserConnection = {
    userId,
    rooms: [],
    ws,
  };

  users.push(userConnection);

  ws.on("message", async (data) => {
    const rawMessage = typeof data === "string" ? data : data.toString();
    const parsedData = JSON.parse(rawMessage) as {
      type: "join_room" | "leave_room" | "chat";
      roomId?: string;
      room?: string;
      message?: string;
    };

    if (parsedData.type === "join_room" && parsedData.roomId) {
      if (!userConnection.rooms.includes(parsedData.roomId)) {
        userConnection.rooms.push(parsedData.roomId);
      }
      return;
    }

    if (parsedData.type === "leave_room" && parsedData.roomId) {
      userConnection.rooms = userConnection.rooms.filter(
        (room) => room !== parsedData.roomId
      );
      return;
    }

    if (parsedData.type === "chat" && parsedData.roomId && parsedData.message) {
      await prismaClient.chat.create({
        data: {
          roomId: Number(parsedData.roomId),
          message: parsedData.message,
          userId,
        },
      });

      for (const user of users) {
        if (user.ws !== ws && user.rooms.includes(parsedData.roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message: parsedData.message,
              roomId: parsedData.roomId,
            })
          );
        }
      }
    }
  });

  ws.on("close", () => {
    const index = users.findIndex((user) => user.ws === ws);
    if (index !== -1) {
      users.splice(index, 1);
    }
  });
});
