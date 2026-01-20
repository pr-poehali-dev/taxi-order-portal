const API_URLS = {
  drivers: 'https://functions.poehali.dev/bf00e5b5-d757-44ff-b76e-68cdd9ed98b8',
  orders: 'https://functions.poehali.dev/4ce1ec9f-d368-4972-bd23-f89e3ba65518'
};

export interface Driver {
  id: number;
  name: string;
  phone: string;
  car: string;
  car_number: string;
  rating: number;
  coords: number[];
  is_active: boolean;
}

export interface Order {
  id?: number;
  driver_id?: number;
  passenger_name: string;
  passenger_phone: string;
  from_address: string;
  to_address: string;
  from_latitude?: number;
  from_longitude?: number;
  to_latitude?: number;
  to_longitude?: number;
  price?: number;
  status?: string;
  rating?: number;
}

export const api = {
  async getDrivers(): Promise<Driver[]> {
    const response = await fetch(API_URLS.drivers);
    if (!response.ok) throw new Error('Failed to fetch drivers');
    return response.json();
  },

  async getOrders(): Promise<Order[]> {
    const response = await fetch(API_URLS.orders);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  async createOrder(order: Order): Promise<{ id: number; status: string }> {
    const response = await fetch(API_URLS.orders, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
  },

  async updateOrder(id: number, data: Partial<Order>): Promise<{ success: boolean }> {
    const response = await fetch(API_URLS.orders, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data })
    });
    if (!response.ok) throw new Error('Failed to update order');
    return response.json();
  }
};
