function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`variável de ambiente ausente: ${name}`);
  }

  return value;
}

export function supabaseUrl(): string {
  return required(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL");
}

export function supabasePublishableKey(): string {
  return required(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
}

export function supabaseSecretKey(): string {
  return required(process.env.SUPABASE_SECRET_KEY, "SUPABASE_SECRET_KEY");
}
