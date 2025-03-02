// lib/types.ts
export interface Message {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string | null;
    userId: string;
    username: string;
    userImageUrl: string;
  }