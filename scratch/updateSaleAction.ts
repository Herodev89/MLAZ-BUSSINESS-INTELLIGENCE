export async function updateSaleAction(id: string, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const customerName = formData.get("customer")?.toString();
  const paymentMethod = formData.get("paymentMethod")?.toString();
  const status = formData.get("status")?.toString();
  const dateStr = formData.get("date")?.toString();

  try {
    const existing = await db.prepare('SELECT * FROM Sale WHERE id = ?').get(id) as any;
    if (!existing) return { error: "Sale not found" };

    const newCustomer = customerName || existing.customerName;
    const newPayment = paymentMethod || existing.paymentMethod;
    const newStatus = status || existing.status;
    const newDate = dateStr ? new Date(dateStr).toISOString() : existing.createdAt;

    await db.prepare('UPDATE Sale SET customerName = ?, paymentMethod = ?, status = ?, createdAt = ? WHERE id = ?')
      .run(newCustomer, newPayment, newStatus, newDate, id);
    
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: "Failed to update sale: " + error.message };
  }
}
