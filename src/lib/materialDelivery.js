import { base44 } from "@/api/base44Client";

/**
 * Marks a material order as delivered and, when it is linked to a material,
 * books the received quantity into stock and records a MaterialMovement.
 *
 * The writes are ordered so failures can be rolled back with update permissions
 * (MaterialMovement deletion is admin-only in this app).
 */
export async function markMaterialOrderDelivered(order) {
  if (!order?.id) {
    throw new Error("Ungültige Bestellung.");
  }

  if (order.status === "Geliefert") {
    return { stockBooked: false, alreadyDelivered: true };
  }

  const previousStatus = order.status || "Offen";
  const quantity = Number(order.quantity);

  let material = null;
  let previousStock = null;
  let stockUpdated = false;
  let orderUpdated = false;

  try {
    if (order.material_id) {
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error("Die Liefermenge muss größer als 0 sein.");
      }

      material = await base44.entities.Material.get(order.material_id);
      if (!material) {
        throw new Error("Das verknüpfte Material wurde nicht gefunden.");
      }

      previousStock = Number(material.stock) || 0;
      const newStock = previousStock + quantity;

      await base44.entities.Material.update(material.id, { stock: newStock });
      stockUpdated = true;
    }

    await base44.entities.Materialbestellung.update(order.id, { status: "Geliefert" });
    orderUpdated = true;

    if (material) {
      try {
        await base44.entities.MaterialMovement.create({
          material_id: material.id,
          type: "Zugang",
          quantity,
          date: new Date().toISOString().split("T")[0],
          notes: `Automatisch gebucht: Lieferung ${order.supplier ? "von " + order.supplier : ""}`.trim(),
        });
      } catch (movementError) {
        // Roll back using update operations available to authorized stock managers.
        await Promise.allSettled([
          base44.entities.Materialbestellung.update(order.id, { status: previousStatus }),
          base44.entities.Material.update(material.id, { stock: previousStock }),
        ]);
        throw movementError;
      }
    }

    return {
      stockBooked: Boolean(material),
      materialId: material?.id || null,
      newStock: material ? previousStock + quantity : null,
    };
  } catch (error) {
    if (stockUpdated && !orderUpdated && material) {
      await base44.entities.Material.update(material.id, { stock: previousStock }).catch(() => {});
    }
    throw error;
  }
}
