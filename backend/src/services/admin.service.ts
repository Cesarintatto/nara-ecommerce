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
    let totalMPCommissions = 0;

    orders.forEach(order => {
      const revenue = Number(order.totalAmount);
      totalGrossRevenue += revenue;

      // Cálculo de Comisión Mercado Pago (Ejemplo: 3.21% + 800 COP)
      const commission = (revenue * 0.0321) + 800;
      totalMPCommissions += commission;

      // Sumar costos de producción/maquila de cada item
      order.items.forEach(item => {
        totalProductionCosts += Number(item.product.costPrice) * item.quantity;
      });
    });

    const netProfit = totalGrossRevenue - totalProductionCosts - totalMPCommissions;

    return {
      grossRevenue: totalGrossRevenue,
      productionCosts: totalProductionCosts,
      mpCommissions: totalMPCommissions,
      netProfit: netProfit,
      marginPercentage: totalGrossRevenue > 0 ? (netProfit / totalGrossRevenue) * 100 : 0,
      totalSales: orders.length
    };
  }
}