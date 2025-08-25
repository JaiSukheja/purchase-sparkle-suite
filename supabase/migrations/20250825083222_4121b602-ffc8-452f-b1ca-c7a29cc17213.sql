-- Insert dummy organizations with proper UUIDs
INSERT INTO organizations (id, name, description, user_id) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Tech Solutions Inc', 'Leading technology solutions provider', '11111111-1111-1111-1111-111111111111'),
('550e8400-e29b-41d4-a716-446655440002', 'Marketing Pro LLC', 'Full-service marketing agency', '11111111-1111-1111-1111-111111111111'),
('550e8400-e29b-41d4-a716-446655440003', 'Creative Studio', 'Design and branding specialists', '22222222-2222-2222-2222-222222222222');

-- Insert dummy customers
INSERT INTO customers (id, name, email, phone, company, address, status, user_id, organization_id) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'John Smith', 'john.smith@acme.com', '+1-555-0101', 'Acme Corporation', '123 Business St, New York, NY 10001', 'active', '11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440012', 'Sarah Johnson', 'sarah@innovate.com', '+1-555-0102', 'Innovate LLC', '456 Tech Ave, San Francisco, CA 94102', 'active', '11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440013', 'Mike Chen', 'mike.chen@startup.io', '+1-555-0103', 'Startup Inc', '789 Venture Blvd, Austin, TX 78701', 'active', '11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440014', 'Emily Davis', 'emily@creative.com', '+1-555-0104', 'Creative Agency', '321 Design Rd, Los Angeles, CA 90210', 'inactive', '22222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440003');

-- Insert dummy purchases
INSERT INTO purchases (id, customer_id, product_name, quantity, unit_price, total_amount, purchase_date, notes, user_id, organization_id) VALUES
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 'Enterprise Software License', 1, 999.99, 999.99, '2024-08-20', 'Annual license for 50 users', '11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440011', 'Training Services', 2, 250.00, 500.00, '2024-08-21', 'On-site training for staff', '11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440012', 'Cloud Hosting Package', 12, 99.99, 1199.88, '2024-08-22', 'Annual cloud hosting', '11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440013', 'Marketing Campaign', 1, 2500.00, 2500.00, '2024-08-23', 'Digital marketing campaign Q4', '11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440002');

-- Insert dummy invoices
INSERT INTO invoices (id, customer_id, invoice_number, invoice_date, due_date, subtotal, tax_amount, total_amount, status, notes, user_id, organization_id) VALUES
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440011', 'INV-2024-001', '2024-08-20', '2024-09-19', 1499.99, 149.99, 1649.98, 'draft', 'Software license and training package', '11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440012', 'INV-2024-002', '2024-08-22', '2024-09-21', 1199.88, 119.99, 1319.87, 'sent', 'Annual hosting package', '11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440013', 'INV-2024-003', '2024-08-23', '2024-09-22', 2500.00, 250.00, 2750.00, 'paid', 'Q4 Marketing Campaign', '11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440002');

-- Insert dummy invoice items
INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, total_amount, purchase_id) VALUES
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440031', 'Enterprise Software License', 1, 999.99, 999.99, '550e8400-e29b-41d4-a716-446655440021'),
('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440031', 'Training Services', 2, 250.00, 500.00, '550e8400-e29b-41d4-a716-446655440022'),
('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440032', 'Cloud Hosting Package', 12, 99.99, 1199.88, '550e8400-e29b-41d4-a716-446655440023'),
('550e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440033', 'Marketing Campaign', 1, 2500.00, 2500.00, '550e8400-e29b-41d4-a716-446655440024');