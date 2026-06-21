import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { CreateRoomSchema, CreateUserSchema, SignInSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import { middleware, type AuthRequest } from "./middleware";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/signup", async (req, res) => {
    const parsedData = CreateUserSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400).json({
            message: "Invalid input"
        });
        return;
    }

    try {
        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data.username,
                password: parsedData.data.password,
                name: parsedData.data.name,
                photo: "",
            },
        });

        res.json({
            userId: user.id,
        });
    } catch (error) {
        console.error("Signup failed", error);

        if (isUniqueConstraintError(error)) {
            res.status(409).json({
                message: "User already exists with this username",
            });
            return;
        }

        res.status(500).json({
            message: "Could not create user",
        });
    }
});

app.post("/signin", async (req, res) => {
    const parsedData = SignInSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400).json({
            message: "Invalid input"
        });
        return;
    }

    const user = await prismaClient.user.findFirst({
        where: {
            email: parsedData.data.username,
            password: parsedData.data.password,
        },
    });

    if (!user) {
        res.status(403).json({
            message: "Not authorized",
        });
        return;
    }

    const token = jwt.sign(
        {
            userId: user.id,
        },
        JWT_SECRET
    );

    res.json({
        token,
    });
});

app.post("/room", middleware, async (req: AuthRequest, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400).json({
            message: "Invalid input"
        });
        return;
    }

    if (!req.userId) {
        res.status(403).json({
            message: "Unauthorized",
        });
        return;
    }

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: req.userId,
            },
        });

        res.json({
            roomId: room.id,
        });
    } catch (error) {
        console.error("Room creation failed", error);

        if (isUniqueConstraintError(error)) {
            res.status(409).json({
                message: "Room already exists with this name",
            });
            return;
        }

        res.status(500).json({
            message: "Could not create room",
        });
    }
});

app.get("/chats/:roomId", async (req, res) => {
    const roomId = Number(req.params.roomId);

    if (Number.isNaN(roomId)) {
        res.status(400).json({
            messages: [],
        });
        return;
    }

    try {
        const messages = await prismaClient.chat.findMany({
            where: {
                roomId,
            },
            orderBy: {
                id: "asc",
            },
            take: 1000,
        });

        res.json({
            messages,
        });
    } catch {
        res.json({
            messages: [],
        });
    }
});

app.get("/room/:slug", async (req, res) => {
    const room = await prismaClient.room.findFirst({
        where: {
            slug: req.params.slug,
        },
    });

    res.json({
        room,
    });
});

app.listen(3001);

function isUniqueConstraintError(error: unknown) {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
    );
}
