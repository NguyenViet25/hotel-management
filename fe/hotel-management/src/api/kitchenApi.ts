import axios from "./axios";

// GetFoodsByWeekRequest
export interface GetFoodsByWeekRequest {
  startDate: string; // DateTime -> string (ISO format)
  hotelId: string; // Guid -> string
}

// GetFoodsByWeekResponse
export interface GetFoodsByWeekResponse {
  startDate: string; // DateTime -> string (ISO format)
  endDate: string; // DateTime -> string (ISO format)
  foodsByDays: FoodsByDay[];
}

// FoodsByDayItem
export interface FoodsByDayItem {
  id: string; // Guid
  name: string;
  quantity: number;
  unitPrice: number; // decimal -> number
}

// FoodsByDay
export interface FoodsByDay {
  date: string; // DateTime -> string
  shoppingOrderId: string;
  foodsByDayItems: FoodsByDayItem[];
}

// ShoppingListRequestDto
export interface ShoppingListRequestDto {
  orderDate: string; // DateTime -> string
  hotelId: string; // Guid -> string
  notes?: string | null;
  shoppingItems?: ShoppingItemDto[] | null;
}

export interface ShoppingDto {
  id: string; // Guid -> string
  orderDate: string; // DateTime -> ISO string
  hotelId: string; // Guid -> string
  notes?: string | null;
  shoppingItems?: ShoppingItemDto[] | null;
}

// ShoppingItemDto
export interface ShoppingItemDto {
  id?: string; // Guid -> string
  name: string;
  shoppingOrderId?: string;
  quantity: string;
  unit: string;
}

export enum QualityStatus {
  NotRated = 0,
  Good = 1,
  Acceptable = 2,
  Poor = 3,
  Expired = 4,
}

export interface ItemResponse<T> {
  isSuccess: boolean;
  message: string | null;
  data: T;
}

const kitchenApi = {
  async generateShoppingList(
    payload: ShoppingListRequestDto
  ): Promise<ItemResponse<ShoppingListRequestDto>> {
    const res = await axios.post("/kitchen/shopping", payload);
    return res.data;
  },

  async getShoppingOrderDetails(
    id: string
  ): Promise<ItemResponse<ShoppingDto>> {
    const res = await axios.get(`/kitchen/shopping/${id}`);
    return res.data;
  },

  async getFoodsByWeek(
    params: GetFoodsByWeekRequest
  ): Promise<ItemResponse<GetFoodsByWeekResponse>> {
    const queryParams = new URLSearchParams();
    queryParams.append("hotelId", params.hotelId.toString());
    queryParams.append("startDate", params.startDate);
    const res = await axios.get(
      `/kitchen/foods-by-week?${queryParams.toString()}`
    );
    return res.data;
  },
};

export default kitchenApi;
