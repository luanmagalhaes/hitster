export const statusMessages: Record<number, string> = {
  400: "Esse pedido não fazia sentido para a sala.",
  401: "Sua sessão nesta sala não vale mais. Entre de novo.",
  403: "Essa ação não é sua para fazer agora.",
  404: "Não encontrei essa sala.",
  409: "Isso não cabe no momento da partida.",
  422: "Faltou preencher algo.",
  429: "Muitos toques seguidos. Espere um instante.",
  500: "A sala tropeçou aqui do lado do servidor.",
  502: "A sala está fora do ar por um instante.",
  503: "A sala está fora do ar por um instante.",
  504: "A sala demorou demais para responder.",
};

export const fallbackMessage = "Algo deu errado. Tente de novo.";
export const unreadableMessage = "A sala respondeu de um jeito que não entendi.";
export const offlineMessage = "Você está sem internet. A partida continua esperando.";
export const unreachableMessage = "Não conseguimos falar com a sala. Tentando de novo.";

export function messageForStatus(status: number): string {
  return statusMessages[status] ?? fallbackMessage;
}

export function networkMessage(online: boolean): string {
  return online ? unreachableMessage : offlineMessage;
}
