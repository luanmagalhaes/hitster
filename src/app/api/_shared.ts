import { NextResponse } from "next/server";
import { ServiceError } from "@/lib/game/service";

export function playerToken(request: Request): string {
  const token = request.headers.get("x-player-token");

  if (!token) {
    throw new ServiceError("sessão expirada, entre na sala de novo", 401);
  }

  return token;
}

export async function handle<T>(action: () => Promise<T>) {
  try {
    return NextResponse.json(await action());
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("erro nao tratado na rota", error);

    return NextResponse.json({ error: "algo deu errado, tente de novo" }, { status: 500 });
  }
}
