import axios from "./axios";

export interface ShoppingListRequestDto {
  startDate?: string; // ISO datetime
  endDate?: string; // ISO datetime
  menuItemIds?: string[];
}

export interface ShoppingListItemDto {
  ingredientName: string;
  totalQuantity: number;
  unit: string;
  relatedMenuItems: string[];
}

export interface ShoppingListDto {
  id: string;
  generatedDate: string;
  startDate?: string;
  endDate?: string;
  items: ShoppingListItemDto[];
}

export enum QualityStatus {
  Good = 0,
  Acceptable = 1,
  Poor = 2,
  Expired = 3,
}

export interface IngredientQualityCheckDto {
  ingredientName: string;
  status: QualityStatus;
  notes?: string;
  needsReplacement?: boolean;
  replacementQuantity?: number;
  replacementUnit?: string;
}

export interface IngredientQualityCheckResultDto
  extends IngredientQualityCheckDto {
  id: string;
  checkedDate: string;
  checkedByUserName: string;
}

export interface ItemResponse<T> {
  isSuccess: boolean;
  message: string | null;
  data: T;
}

const kitchenApi = {
  async generateShoppingList(
    payload: ShoppingListRequestDto
  ): Promise<ItemResponse<ShoppingListDto>> {
    const res = await axios.post("/admin/kitchen/shopping-list", payload);
    return res.data;
  },

  async checkIngredientQuality(
    payload: IngredientQualityCheckDto
  ): Promise<ItemResponse<IngredientQualityCheckResultDto>> {
    const res = await axios.post(
      "/admin/kitchen/ingredient-quality-check",
      payload
    );
    return res.data;
  },
};

export default kitchenApi;
