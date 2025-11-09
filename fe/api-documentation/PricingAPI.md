# Pricing API Documentation

## Overview
- Base path: `/api/admin/pricing`
- Auth: All endpoints require authentication (`Authorize`).
- Purpose: Configure and compute room pricing via base price, day-of-week price, date-range price, surcharge rules, discount rules, and price calculation.

## Common Response
All endpoints return a standard envelope:

```ts
interface ApiResponse<T = any> {
  success: boolean;
  message?: string | null;
  data?: T | null;
  errors?: Record<string, string[]> | null;
  meta?: any;
}
```

Assumptions:
- `guid` values are serialized as strings.
- `DateTime` are ISO 8601 strings.
- Field names use camelCase in JSON.

## Endpoints Summary
| Method | URL | Action |
|--------|-----|--------|
| POST | `/api/admin/pricing/base-price` | SetBasePrice |
| GET  | `/api/admin/pricing/base-price` | GetBasePrice |
| GET  | `/api/admin/pricing/base-prices/hotel/{hotelId}` | GetBasePricesByHotel |
| POST | `/api/admin/pricing/day-of-week-price` | SetDayOfWeekPrice |
| POST | `/api/admin/pricing/day-of-week-prices/bulk` | SetBulkDayOfWeekPrices |
| GET  | `/api/admin/pricing/day-of-week-prices` | GetDayOfWeekPrices |
| DELETE | `/api/admin/pricing/day-of-week-price` | RemoveDayOfWeekPrice |
| POST | `/api/admin/pricing/date-range-price` | CreateDateRangePrice |
| PUT  | `/api/admin/pricing/date-range-price/{id}` | UpdateDateRangePrice |
| DELETE | `/api/admin/pricing/date-range-price/{id}` | DeleteDateRangePrice |
| GET  | `/api/admin/pricing/date-range-price/{id}` | GetDateRangePriceById |
| GET  | `/api/admin/pricing/date-range-prices` | GetDateRangePrices |
| POST | `/api/admin/pricing/surcharge-rule` | CreateSurchargeRule |
| PUT  | `/api/admin/pricing/surcharge-rule/{id}` | UpdateSurchargeRule |
| DELETE | `/api/admin/pricing/surcharge-rule/{id}` | DeleteSurchargeRule |
| GET  | `/api/admin/pricing/surcharge-rules/hotel/{hotelId}` | GetSurchargeRulesByHotel |
| POST | `/api/admin/pricing/discount-rule` | CreateDiscountRule |
| PUT  | `/api/admin/pricing/discount-rule/{id}` | UpdateDiscountRule |
| DELETE | `/api/admin/pricing/discount-rule/{id}` | DeleteDiscountRule |
| GET  | `/api/admin/pricing/discount-rule/{id}` | GetDiscountRuleById |
| GET  | `/api/admin/pricing/discount-rules` | GetDiscountRules |
| GET  | `/api/admin/pricing/discount-code/validate` | ValidateDiscountCode |
| GET  | `/api/admin/pricing/overview` | GetPricingOverview |
| POST | `/api/admin/pricing/calculate` | CalculatePrice |

---

## Base Price Management

### Set Base Price
- URL: `/api/admin/pricing/base-price`
- Method: `POST`
- Description: Configure the default base price for a room type in a hotel.

Request Body (SetBasePriceDto):
```ts
interface SetBasePriceDto {
  hotelId: string;    // guid
  roomTypeId: string; // guid
  price: number;      // decimal
}
```

Responses:
- 200 OK: `ApiResponse<BasePriceDto>`
- 400 Bad Request: validation errors

Schema (BasePriceDto):
```ts
interface BasePriceDto {
  id: string;         // guid
  hotelId: string;    // guid
  roomTypeId: string; // guid
  roomTypeName: string;
  price: number;
}
```

### Get Base Price
- URL: `/api/admin/pricing/base-price`
- Method: `GET`
- Description: Get base price for a specific hotel and room type.

Query Parameters:
| Name | Type | Required | Example |
|------|------|----------|---------|
| `hotelId` | string (guid) | Yes | `c8b43c4b-...` |
| `roomTypeId` | string (guid) | Yes | `77b20a1c-...` |

Responses:
- 200 OK: `ApiResponse<BasePriceDto>`
- 404 Not Found

### Get Base Prices by Hotel
- URL: `/api/admin/pricing/base-prices/hotel/{hotelId}`
- Method: `GET`
- Description: Get all base prices configured in a hotel.

Route Parameters:
- `hotelId` (string/guid) required

Responses:
- 200 OK: `ApiResponse<BasePriceDto[]>`
- 400 Bad Request

---

## Day of Week Price Management

### Set Day-of-Week Price
- URL: `/api/admin/pricing/day-of-week-price`
- Method: `POST`
- Description: Configure a price for a specific day of week.

Request Body (SetDayOfWeekPriceDto):
```ts
interface SetDayOfWeekPriceDto {
  hotelId: string;    // guid
  roomTypeId: string; // guid
  dayOfWeek: number;  // 0=Sunday..6=Saturday
  price: number;
}
```

Responses:
- 200 OK: `ApiResponse<DayOfWeekPriceDto>`
- 400 Bad Request

Schema (DayOfWeekPriceDto):
```ts
interface DayOfWeekPriceDto {
  id: string;         // guid
  hotelId: string;    // guid
  roomTypeId: string; // guid
  roomTypeName: string;
  dayOfWeek: number;  // 0..6
  dayName: string;    // localized name
  price: number;
}
```

### Set Bulk Day-of-Week Prices
- URL: `/api/admin/pricing/day-of-week-prices/bulk`
- Method: `POST`
- Description: Configure multiple day-of-week prices in one request.

Request Body (BulkDayOfWeekPriceDto):
```ts
interface DayPriceDto { dayOfWeek: number; price: number; }

interface BulkDayOfWeekPriceDto {
  hotelId: string;    // guid
  roomTypeId: string; // guid
  dayPrices: DayPriceDto[];
}
```

Responses:
- 200 OK: `ApiResponse` (no data payload)
- 400 Bad Request

### Get Day-of-Week Prices
- URL: `/api/admin/pricing/day-of-week-prices`
- Method: `GET`
- Description: List all day-of-week prices for a hotel and room type.

Query Parameters:
| Name | Type | Required |
|------|------|----------|
| `hotelId` | string (guid) | Yes |
| `roomTypeId` | string (guid) | Yes |

Responses:
- 200 OK: `ApiResponse<DayOfWeekPriceDto[]>`
- 400 Bad Request

### Remove Day-of-Week Price
- URL: `/api/admin/pricing/day-of-week-price`
- Method: `DELETE`
- Description: Remove a configured day-of-week price.

Query Parameters:
| Name | Type | Required |
|------|------|----------|
| `hotelId` | string (guid) | Yes |
| `roomTypeId` | string (guid) | Yes |
| `dayOfWeek` | number | Yes |

Responses:
- 200 OK: `ApiResponse` (message indicates success)
- 400 Bad Request

---

## Date Range Price Management

### Create Date Range Price
- URL: `/api/admin/pricing/date-range-price`
- Method: `POST`
- Description: Create a price for a specific date range (holidays, events).

Request Body (CreateDateRangePriceDto):
```ts
interface CreateDateRangePriceDto {
  hotelId: string;    // guid
  roomTypeId: string; // guid
  startDate: string;  // ISO date
  endDate: string;    // ISO date
  price: number;
  description?: string;
}
```

Responses:
- 201 Created: `ApiResponse<DateRangePriceDto>`
- 400 Bad Request

Schema (DateRangePriceDto):
```ts
interface DateRangePriceDto {
  id: string;         // guid
  hotelId: string;    // guid
  roomTypeId: string; // guid
  roomTypeName: string;
  startDate: string;  // ISO date
  endDate: string;    // ISO date
  price: number;
  description: string;
  isActive: boolean;  // current date in range
}
```

### Update Date Range Price
- URL: `/api/admin/pricing/date-range-price/{id}`
- Method: `PUT`
- Description: Update dates and price of an existing range.

Route Parameters:
- `id` (string/guid) required

Request Body (UpdateDateRangePriceDto):
```ts
interface UpdateDateRangePriceDto {
  startDate: string;  // ISO date
  endDate: string;    // ISO date
  price: number;
  description?: string;
}
```

Responses:
- 200 OK: `ApiResponse<DateRangePriceDto>`
- 400 Bad Request
- 404 Not Found

### Delete Date Range Price
- URL: `/api/admin/pricing/date-range-price/{id}`
- Method: `DELETE`
- Description: Delete a date-range price.

Route Parameters:
- `id` (string/guid) required

Responses:
- 200 OK: `ApiResponse` (message indicates success)
- 400 Bad Request
- 404 Not Found

### Get Date Range Price by Id
- URL: `/api/admin/pricing/date-range-price/{id}`
- Method: `GET`

Responses:
- 200 OK: `ApiResponse<DateRangePriceDto>`
- 404 Not Found

### List Date Range Prices
- URL: `/api/admin/pricing/date-range-prices`
- Method: `GET`
- Description: List date-range prices with optional filtering and pagination.

Query Parameters (DateRangePriceQueryDto):
| Name | Type | Required | Example |
|------|------|----------|---------|
| `hotelId` | string (guid) | No | `c8b43c4b-...` |
| `roomTypeId` | string (guid) | No | `77b20a1c-...` |
| `startDate` | string (ISO) | No | `2025-12-20` |
| `endDate` | string (ISO) | No | `2025-12-31` |
| `page` | number | No (default 1) | `1` |
| `pageSize` | number | No (default 10) | `10` |

Responses:
- 200 OK: `ApiResponse<DateRangePriceDto[]>`
- 400 Bad Request

---

## Surcharge Rule Management

### Create Surcharge Rule
- URL: `/api/admin/pricing/surcharge-rule`
- Method: `POST`
- Description: Create a surcharge rule for early check-in, late check-out, or extra guest.

Request Body (CreateSurchargeRuleDto):
```ts
// SurchargeType: 0=EarlyCheckIn, 1=LateCheckOut, 2=ExtraGuest
interface CreateSurchargeRuleDto {
  hotelId: string;    // guid
  surchargeType: number; // enum as int
  amount: number;     // decimal; currency amount or percentage
  isPercentage: boolean;
}
```

Responses:
- 201 Created: `ApiResponse<SurchargeRuleDto>`
- 400 Bad Request

Schema (SurchargeRuleDto):
```ts
interface SurchargeRuleDto {
  id: string;         // guid
  hotelId: string;    // guid
  surchargeType: number; // enum
  surchargeTypeName: string;
  amount: number;
  isPercentage: boolean;
  displayAmount: string; // e.g., "10%" or currency formatted
}
```

### Update Surcharge Rule
- URL: `/api/admin/pricing/surcharge-rule/{id}`
- Method: `PUT`

Route Parameters:
- `id` (string/guid) required

Request Body (UpdateSurchargeRuleDto):
```ts
interface UpdateSurchargeRuleDto {
  amount: number;
  isPercentage: boolean;
}
```

Responses:
- 200 OK: `ApiResponse<SurchargeRuleDto>`
- 400 Bad Request
- 404 Not Found

### Delete Surcharge Rule
- URL: `/api/admin/pricing/surcharge-rule/{id}`
- Method: `DELETE`

Responses:
- 200 OK: `ApiResponse` (message indicates success)
- 400 Bad Request
- 404 Not Found

### List Surcharge Rules by Hotel
- URL: `/api/admin/pricing/surcharge-rules/hotel/{hotelId}`
- Method: `GET`

Route Parameters:
- `hotelId` (string/guid) required

Responses:
- 200 OK: `ApiResponse<SurchargeRuleDto[]>`
- 400 Bad Request

---

## Discount Rule Management

### Create Discount Rule
- URL: `/api/admin/pricing/discount-rule`
- Method: `POST`

Request Body (CreateDiscountRuleDto):
```ts
interface CreateDiscountRuleDto {
  hotelId: string;  // guid
  code: string;
  amount: number;   // decimal
  isPercentage: boolean;
  validFrom?: string | null; // ISO date
  validTo?: string | null;   // ISO date
  description?: string;
}
```

Responses:
- 201 Created: `ApiResponse<DiscountRuleDto>`
- 400 Bad Request

Schema (DiscountRuleDto):
```ts
interface DiscountRuleDto {
  id: string;         // guid
  hotelId: string;    // guid
  code: string;
  amount: number;
  isPercentage: boolean;
  validFrom?: string | null; // ISO date
  validTo?: string | null;   // ISO date
  isActive: boolean;
  description: string;
  displayAmount: string;     // e.g., "10%"
  isCurrentlyValid: boolean; // computed
}
```

### Update Discount Rule
- URL: `/api/admin/pricing/discount-rule/{id}`
- Method: `PUT`

Route Parameters:
- `id` (string/guid) required

Request Body (UpdateDiscountRuleDto):
```ts
interface UpdateDiscountRuleDto {
  code: string;
  amount: number;
  isPercentage: boolean;
  validFrom?: string | null; // ISO date
  validTo?: string | null;   // ISO date
  isActive: boolean;
  description?: string;
}
```

Responses:
- 200 OK: `ApiResponse<DiscountRuleDto>`
- 400 Bad Request
- 404 Not Found

### Delete Discount Rule
- URL: `/api/admin/pricing/discount-rule/{id}`
- Method: `DELETE`

Responses:
- 200 OK: `ApiResponse` (message indicates success)
- 400 Bad Request
- 404 Not Found

### Get Discount Rule by Id
- URL: `/api/admin/pricing/discount-rule/{id}`
- Method: `GET`

Responses:
- 200 OK: `ApiResponse<DiscountRuleDto>`
- 404 Not Found

### List Discount Rules
- URL: `/api/admin/pricing/discount-rules`
- Method: `GET`

Query Parameters (DiscountRuleQueryDto):
| Name | Type | Required | Example |
|------|------|----------|---------|
| `hotelId` | string (guid) | No | `c8b43c4b-...` |
| `code`    | string | No | `WINTER10` |
| `isActive` | boolean | No | `true` |
| `onlyValid` | boolean | No | `true` |
| `page` | number | No (default 1) | `1` |
| `pageSize` | number | No (default 10) | `10` |

Responses:
- 200 OK: `ApiResponse<DiscountRuleDto[]>`
- 400 Bad Request

### Validate Discount Code
- URL: `/api/admin/pricing/discount-code/validate`
- Method: `GET`

Query Parameters:
| Name | Type | Required |
|------|------|----------|
| `hotelId` | string (guid) | Yes |
| `code` | string | Yes |

Responses:
- 200 OK: `ApiResponse<DiscountRuleDto>`
- 400 Bad Request: missing code or invalid

---

## Comprehensive Pricing

### Pricing Overview
- URL: `/api/admin/pricing/overview`
- Method: `GET`
- Description: Get configured pricing overview for a room type.

Query Parameters:
| Name | Type | Required |
|------|------|----------|
| `hotelId` | string (guid) | Yes |
| `roomTypeId` | string (guid) | Yes |

Responses:
- 200 OK: `ApiResponse<PricingOverviewDto>`
- 400 Bad Request

Schema (PricingOverviewDto):
```ts
interface PricingOverviewDto {
  roomTypeId: string;
  roomTypeName: string;
  basePrice?: number | null;
  dayOfWeekPrices: DayOfWeekPriceDto[];
  activeDateRangePrices: DateRangePriceDto[];
  surchargeRules: SurchargeRuleDto[];
}
```

### Calculate Price
- URL: `/api/admin/pricing/calculate`
- Method: `POST`
- Description: Calculate final price across configured rules and options.

Request Body (PriceCalculationRequestDto):
```ts
interface PriceCalculationRequestDto {
  hotelId: string;      // guid
  roomTypeId: string;   // guid
  checkInDate: string;  // ISO date
  checkOutDate: string; // ISO date
  guestCount: number;   // default 1
  discountCode?: string | null;
  earlyCheckIn?: boolean; // default false
  lateCheckOut?: boolean; // default false
}
```

Responses:
- 200 OK: `ApiResponse<PriceCalculationResultDto>`
- 400 Bad Request: invalid date range, missing base price, etc.

Schema (PriceCalculationResultDto):
```ts
interface PriceBreakdownDto {
  date: string;       // ISO date
  dayName: string;    // e.g., Monday
  price: number;
  priceSource: string; // "Base" | "DayOfWeek" | "DateRange"
}

interface PriceCalculationResultDto {
  baseAmount: number;       // sum of nightly prices before adjustments
  breakdown: PriceBreakdownDto[];
  surchargeAmount: number;  // total surcharges applied
  discountAmount: number;   // total discounts applied
  totalAmount: number;      // final payable amount
  discountCode?: string | null;
  appliedSurcharges: string[]; // names of surcharges applied
}
```

---

## TypeScript Models (for FE codegen)
```ts
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string | null;
  data?: T | null;
  errors?: Record<string, string[]> | null;
  meta?: any;
}

export interface SetBasePriceDto { hotelId: string; roomTypeId: string; price: number; }
export interface BasePriceDto { id: string; hotelId: string; roomTypeId: string; roomTypeName: string; price: number; }

export interface SetDayOfWeekPriceDto { hotelId: string; roomTypeId: string; dayOfWeek: number; price: number; }
export interface DayPriceDto { dayOfWeek: number; price: number; }
export interface BulkDayOfWeekPriceDto { hotelId: string; roomTypeId: string; dayPrices: DayPriceDto[]; }
export interface DayOfWeekPriceDto { id: string; hotelId: string; roomTypeId: string; roomTypeName: string; dayOfWeek: number; dayName: string; price: number; }

export interface CreateDateRangePriceDto { hotelId: string; roomTypeId: string; startDate: string; endDate: string; price: number; description?: string; }
export interface UpdateDateRangePriceDto { startDate: string; endDate: string; price: number; description?: string; }
export interface DateRangePriceDto { id: string; hotelId: string; roomTypeId: string; roomTypeName: string; startDate: string; endDate: string; price: number; description: string; isActive: boolean; }
export interface DateRangePriceQueryParams { hotelId?: string; roomTypeId?: string; startDate?: string; endDate?: string; page?: number; pageSize?: number; }

export interface CreateSurchargeRuleDto { hotelId: string; surchargeType: number; amount: number; isPercentage: boolean; }
export interface UpdateSurchargeRuleDto { amount: number; isPercentage: boolean; }
export interface SurchargeRuleDto { id: string; hotelId: string; surchargeType: number; surchargeTypeName: string; amount: number; isPercentage: boolean; displayAmount: string; }

export interface CreateDiscountRuleDto { hotelId: string; code: string; amount: number; isPercentage: boolean; validFrom?: string | null; validTo?: string | null; description?: string; }
export interface UpdateDiscountRuleDto { code: string; amount: number; isPercentage: boolean; validFrom?: string | null; validTo?: string | null; isActive: boolean; description?: string; }
export interface DiscountRuleDto { id: string; hotelId: string; code: string; amount: number; isPercentage: boolean; validFrom?: string | null; validTo?: string | null; isActive: boolean; description: string; displayAmount: string; isCurrentlyValid: boolean; }
export interface DiscountRuleQueryParams { hotelId?: string; code?: string; isActive?: boolean; onlyValid?: boolean; page?: number; pageSize?: number; }

export interface PricingOverviewDto { roomTypeId: string; roomTypeName: string; basePrice?: number | null; dayOfWeekPrices: DayOfWeekPriceDto[]; activeDateRangePrices: DateRangePriceDto[]; surchargeRules: SurchargeRuleDto[]; }

export interface PriceCalculationRequestDto { hotelId: string; roomTypeId: string; checkInDate: string; checkOutDate: string; guestCount?: number; discountCode?: string | null; earlyCheckIn?: boolean; lateCheckOut?: boolean; }
export interface PriceBreakdownDto { date: string; dayName: string; price: number; priceSource: string; }
export interface PriceCalculationResultDto { baseAmount: number; breakdown: PriceBreakdownDto[]; surchargeAmount: number; discountAmount: number; totalAmount: number; discountCode?: string | null; appliedSurcharges: string[]; }
```

## Relationships
- A `Hotel` has many `RoomType`.
- Pricing is configured per `Hotel` + `RoomType` pair using: BasePrice, DayOfWeekPrice, DateRangePrice.
- `SurchargeRule` belongs to a `Hotel` and applies to calculations (EarlyCheckIn, LateCheckOut, ExtraGuest).
- `DiscountRule` belongs to a `Hotel` and can be referenced by `discountCode` during price calculation.

## Error Responses
- 400 Bad Request: validation or business rule violation; `ApiResponse` with `message` and optional `errors`.
- 404 Not Found: entity not found; `ApiResponse` with `message`.
- 401 Unauthorized: missing/invalid auth.
- 500 Internal Server Error: unexpected server errors.