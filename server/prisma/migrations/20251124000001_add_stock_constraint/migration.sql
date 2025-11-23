-- Add constraint to ensure stock quantity never goes negative
ALTER TABLE "Product" ADD CONSTRAINT "Product_stockQuantity_check" CHECK ("stockQuantity" >= 0);
