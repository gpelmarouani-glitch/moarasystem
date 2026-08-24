import { Order, FinancialSummary } from '../types';

/**
 * Parse delivery fee value. If "مجاني" or "free" or empty or 0, returns 0.
 */
export function parseDeliveryFee(fee: number | string | undefined): number {
  if (fee === undefined || fee === null || fee === '') return 0;
  if (typeof fee === 'number') return isNaN(fee) ? 0 : Math.max(0, fee);
  const normalized = fee.trim().toLowerCase();
  if (normalized === 'مجاني' || normalized === 'free' || normalized === 'gratuit' || normalized === '0') {
    return 0;
  }
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}

/**
 * Calculates subtotal for an order (Quantity * Unit Price)
 */
export function calculateOrderSubtotal(quantity: number, unitPrice: number): number {
  const q = Number(quantity) || 0;
  const p = Number(unitPrice) || 0;
  return Math.max(0, q * p);
}

/**
 * Calculates Grand Total for an order (Subtotal + Delivery Fee)
 */
export function calculateOrderGrandTotal(order: Pick<Order, 'quantity' | 'unitPrice' | 'deliveryFee'>): number {
  const subtotal = calculateOrderSubtotal(order.quantity, order.unitPrice);
  const delivery = parseDeliveryFee(order.deliveryFee);
  return subtotal + delivery;
}

/**
 * Sales Value Rule:
 * ONLY considered sales if deliveryStatus === 'تم التوصيل'. Otherwise 0.
 */
export function calculateOrderSalesValue(order: Order): number {
  if (order.deliveryStatus !== 'تم التوصيل') {
    return 0;
  }
  return calculateOrderGrandTotal(order);
}

/**
 * Collected Amount Rule:
 * Based on collectionStatus === 'محصل' (or 'دفع مسبق').
 * If collectionStatus === 'غير محصل', returns 0 regardless of delivery status.
 */
export function calculateOrderCollectedAmount(order: Order): number {
  if (order.collectionStatus === 'محصل') {
    return calculateOrderGrandTotal(order);
  }
  if (order.collectionStatus === 'دفع مسبق') {
    return calculateOrderGrandTotal(order);
  }
  return 0;
}

/**
 * Returns Amount for an order
 */
export function calculateOrderReturnAmount(order: Order): number {
  if (order.returnStatus === 'تم الإرجاع' || order.returnStatus === 'تم التعويض') {
    if (typeof order.returnAmount === 'number' && order.returnAmount > 0) {
      return order.returnAmount;
    }
    return calculateOrderGrandTotal(order);
  }
  return 0;
}

/**
 * Calculates overall Financial Summary across a list of orders
 */
export function calculateFinancialSummary(orders: Order[]): FinancialSummary {
  let deliveredCount = 0;
  let inTransitCount = 0;
  let inPrepCount = 0;
  let shippedCount = 0;
  let failedCount = 0;
  let cancelledCount = 0;
  let returnsCount = 0;

  let grossSalesValue = 0;
  let totalCollected = 0;
  let totalUncollected = 0;
  let totalPrepaid = 0;
  let totalDeliveryFees = 0;
  let totalReturnAmount = 0;
  let totalEstimatedCost = 0;

  let preDeliveryTotal = 0;
  let preDeliveryInPrep = 0;
  let preDeliveryShipped = 0;
  let preDeliveryInTransit = 0;
  let preDeliveryFailed = 0;
  let preDeliveryCancelled = 0;

  orders.forEach((order) => {
    const total = calculateOrderGrandTotal(order);
    const fee = parseDeliveryFee(order.deliveryFee);
    const itemCost = (order.unitCost || 0) * (order.quantity || 1);

    totalDeliveryFees += fee;

    // Delivery Status Breakdown
    switch (order.deliveryStatus) {
      case 'تم التوصيل':
        deliveredCount++;
        grossSalesValue += total;
        totalEstimatedCost += itemCost;
        break;
      case 'قيد التوصيل':
        inTransitCount++;
        preDeliveryInTransit += total;
        preDeliveryTotal += total;
        break;
      case 'تم الإرسال':
        shippedCount++;
        preDeliveryShipped += total;
        preDeliveryTotal += total;
        break;
      case 'قيد التحضير':
        inPrepCount++;
        preDeliveryInPrep += total;
        preDeliveryTotal += total;
        break;
      case 'فشل التوصيل':
        failedCount++;
        preDeliveryFailed += total;
        preDeliveryTotal += total;
        break;
      case 'ملغى':
        cancelledCount++;
        preDeliveryCancelled += total;
        preDeliveryTotal += total;
        break;
    }

    // Returns Breakdown
    if (order.returnStatus === 'تم الإرجاع' || order.returnStatus === 'تم التعويض') {
      returnsCount++;
      const retAmt = calculateOrderReturnAmount(order);
      totalReturnAmount += retAmt;
    } else if (order.returnStatus === 'طلب إرجاع' || order.returnStatus === 'في طريق الإرجاع') {
      returnsCount++;
    }

    // Collections Breakdown
    if (order.collectionStatus === 'محصل') {
      totalCollected += total;
    } else if (order.collectionStatus === 'دفع مسبق') {
      totalPrepaid += total;
      totalCollected += total;
    } else if (order.collectionStatus === 'غير محصل') {
      if (order.deliveryStatus === 'تم التوصيل' || order.deliveryStatus === 'قيد التوصيل' || order.deliveryStatus === 'تم الإرسال') {
        totalUncollected += total;
      }
    }
  });

  // Net calculations
  const netValue = Math.max(0, grossSalesValue - totalReturnAmount);
  const netCollection = Math.max(0, totalCollected - totalReturnAmount);
  const grossProfit = Math.max(0, grossSalesValue - totalEstimatedCost);
  const successRate = orders.length > 0 ? Math.round((deliveredCount / orders.length) * 100) : 0;

  return {
    totalOrdersCount: orders.length,
    deliveredCount,
    inTransitCount,
    inPrepCount,
    shippedCount,
    failedCount,
    cancelledCount,
    returnsCount,
    successRate,

    grossSalesValue,
    totalCollected,
    totalUncollected,
    totalPrepaid,
    totalDeliveryFees,
    totalReturnAmount,
    netValue,
    netCollection,
    netCollected: netCollection,

    preDeliveryTotal,
    preDeliveryInPrep,
    preDeliveryShipped,
    preDeliveryInTransit,
    preDeliveryFailed,
    preDeliveryCancelled,

    totalEstimatedCost,
    grossProfit,
  };
}

/**
 * Calculates per-account statistics
 */
export function calculateAccountStats(orders: Order[], accountName: string) {
  const accountOrders = orders.filter((o) => o.account === accountName);
  const totalOrders = accountOrders.length;
  let delivered = 0;
  let failed = 0;
  let returns = 0;
  let sales = 0;
  let collected = 0;
  let uncollected = 0;
  let prepaid = 0;
  let transferred = 0;

  accountOrders.forEach((o) => {
    const total = calculateOrderGrandTotal(o);
    if (o.deliveryStatus === 'تم التوصيل') {
      delivered++;
      sales += total;
    } else if (o.deliveryStatus === 'فشل التوصيل') {
      failed++;
    }

    if (o.returnStatus === 'تم الإرجاع' || o.returnStatus === 'تم التعويض') {
      returns++;
    }

    if (o.collectionStatus === 'محصل') {
      collected += total;
      // Rule 11: المبلغ المحول = مجموع الطلبات التي تحقق: الحساب = الحساب المحدد AND حالة التحصيل = محصل
      transferred += total;
    } else if (o.collectionStatus === 'دفع مسبق') {
      prepaid += total;
    } else if (o.collectionStatus === 'غير محصل') {
      uncollected += total;
    }
  });

  const successRate = totalOrders > 0 ? (delivered / totalOrders) * 100 : 0;

  return {
    accountName,
    totalOrders,
    delivered,
    failed,
    returns,
    sales,
    collected,
    uncollected,
    prepaid,
    transferred,
    successRate: Math.round(successRate * 10) / 10,
  };
}

/**
 * Calculates per-delivery-company statistics
 */
export function calculateDeliveryCompanyStats(orders: Order[], companyName: string) {
  const companyOrders = orders.filter((o) => o.deliveryCompany === companyName);
  const totalOrders = companyOrders.length;
  let delivered = 0;
  let failed = 0;
  let returns = 0;

  companyOrders.forEach((o) => {
    if (o.deliveryStatus === 'تم التوصيل') delivered++;
    if (o.deliveryStatus === 'فشل التوصيل') failed++;
    if (o.returnStatus === 'تم الإرجاع' || o.returnStatus === 'تم التعويض') returns++;
  });

  // Success rate formula: تم التوصيل ÷ إجمالي الطلبات × 100 with division by zero prevention
  const successRate = totalOrders > 0 ? (delivered / totalOrders) * 100 : 0;

  return {
    companyName,
    totalOrders,
    delivered,
    failed,
    returns,
    successRate: Math.round(successRate * 10) / 10,
  };
}

/**
 * Format Currency in Moroccan Dirham (MAD)
 */
export function formatMAD(amount: number | undefined | null): string {
  const val = Number(amount) || 0;
  return new Intl.NumberFormat('fr-MA', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val) + ' MAD';
}
