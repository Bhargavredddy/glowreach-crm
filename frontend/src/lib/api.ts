import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  gender: string;
  joinDate: string;
  ordersCount: number;
  totalSpent: number;
  orders?: any[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  rating: number;
}

export interface Order {
  id: string;
  customerId: string;
  productId: string;
  amount: number;
  category: string;
  purchaseDate: string;
  customer?: { name: string; email: string };
  product?: { name: string; brand: string };
}

export interface Campaign {
  id: string;
  campaignName: string;
  audienceDescription: string;
  channel: string;
  message: string;
  status: string;
  createdAt: string;
}

export interface CampaignPerformance {
  id: string;
  name: string;
  channel: string;
  status: string;
  message: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
}

export interface AnalyticsData {
  summary: {
    totalCustomers: number;
    totalOrders: number;
    totalCampaigns: number;
    totalRevenue: number;
  };
  campaignPerformance: CampaignPerformance[];
  funnel: Array<{ stage: string; count: number }>;
  segmentSales: Array<{ name: string; revenue: number; orders: number }>;
}

export interface AudienceResponse {
  filters: {
    category: string | null;
    minSpend: number | null;
    inactiveDays: number | null;
  };
  audienceSize: number;
  preview: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    gender: string;
    joinDate: string;
  }>;
}

export interface CampaignPreviewResponse {
  campaignName: string;
  recommendedChannel: 'WhatsApp' | 'Email';
  reason: string;
  message: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export const crmApi = {
  getCustomers: async (params?: { search?: string; gender?: string; city?: string }): Promise<Customer[]> => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  getOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data;
  },

  getProducts: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  generateAudience: async (prompt: string): Promise<AudienceResponse> => {
    const response = await api.post('/audience/generate', { prompt });
    return response.data;
  },

  createCampaign: async (campaign: {
    campaignName: string;
    audienceDescription: string;
    channel: string;
    message: string;
  }): Promise<Campaign> => {
    const response = await api.post('/campaigns/create', campaign);
    return response.data;
  },

  launchCampaign: async (campaignId: string, customerIds?: string[]): Promise<{ status: string; message: string; audienceSize: number }> => {
    const response = await api.post('/campaigns/launch', { campaignId, customerIds });
    return response.data;
  },

  getAnalytics: async (): Promise<AnalyticsData> => {
    const response = await api.get('/analytics');
    return response.data;
  },

  sendCopilotChat: async (history: ChatMessage[], prompt: string): Promise<{ reply: string }> => {
    const response = await api.post('/copilot/chat', { history, prompt });
    return response.data;
  },

  generateCampaignPreview: async (goal: string, audienceDescription: string): Promise<CampaignPreviewResponse> => {
    const response = await api.post('/campaigns/generate-preview', { goal, audienceDescription });
    return response.data;
  },
};
