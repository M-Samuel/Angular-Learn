import { ProductBuyOrder } from "./product-buy-order";
import { ProductSellOrder } from "./product-sell-order";

export interface ProductTransaction {
    buyOrder?: ProductBuyOrder
    sellOrder?: ProductSellOrder
    transactionDate?: Date;
}
