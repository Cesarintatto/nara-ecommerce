// /backend/src/services/admin.service.ts
import { prisma } from '../lib/prisma';

export class AdminService {
  static async getFinancialStats() {
    // 1. Obtener todas las órdenes aprobadas con sus items y costos
    const orders = await prisma.order.findMany({
      where: { status: 'APPROVED' },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    let totalGrossRevenue = 0;
    let totalProductionCosts = 0;
    let totalPaymentFees = 0;

    orders.forEach(order => {
      const revenue = Number(order.totalAmount);
      totalGrossRevenue += revenue;

      // Comisión Wompi (plan agregador): 2.65% + $700 COP, más IVA (19%)
      // sobre la comisión. Ajustar si Wompi cambia la tarifa del comercio.
      const commission = (revenue * 0.0265 + 700) * 1.19;
      totalPaymentFees += commission;

      // Sumar costos de producción/maquila de cada item
      order.items.forEach(item => {
        totalProductionCosts += Number(item.product.costPrice) * item.quantity;
      });
    });

    const netProfit = totalGrossRevenue - totalProductionCosts - totalPaymentFees;

    return {
      grossRevenue: totalGrossRevenue,
      productionCosts: totalProductionCosts,
      paymentFees: totalPaymentFees,
      netProfit: netProfit,
      marginPercentage: totalGrossRevenue > 0 ? (netProfit / totalGrossRevenue) * 100 : 0,
      totalSales: orders.length
    };
  }
}