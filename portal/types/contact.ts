export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface ContactsResponse {
  success: boolean;
  data: Contact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: {
    message: string;
    status: number;
    data: unknown;
  };
}

export interface ContactFilters {
  page?: number;
  limit?: number;
  search?: string;
}
