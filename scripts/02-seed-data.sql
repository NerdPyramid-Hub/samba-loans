-- Insert admin user (you'll need to create this user in Supabase Auth first)
-- Replace 'admin-user-uuid' with the actual UUID from auth.users
INSERT INTO public.users (id, email, full_name, role) VALUES
('00000000-0000-0000-0000-000000000000', 'admin@sambaloan.com', 'Admin User', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Insert sample loan applications for testing
INSERT INTO public.loan_applications (
  user_id, full_name, phone_number, email, loan_amount, due_date, 
  repayment_amount, repayment_destination, status, repayment_status, created_at
) VALUES
-- Pending applications
('11111111-1111-1111-1111-111111111111', 'Jane Doe', '0821234567', 'jane@example.com', 4500.00, '2024-02-20', 5850.00, 'FNB - 987654321 - Jane Doe', 'pending', 'unpaid', NOW() - INTERVAL '2 days'),
('22222222-2222-2222-2222-222222222222', 'Robert Smith', '0827654321', 'robert@example.com', 8000.00, '2024-02-25', 10400.00, 'Capitec - 456789123 - Robert Smith', 'pending', 'unpaid', NOW() - INTERVAL '1 day'),
('33333333-3333-3333-3333-333333333333', 'Lisa Johnson', '0823456789', 'lisa@example.com', 3200.00, '2024-02-18', 4160.00, 'ABSA - 789123456 - Lisa Johnson', 'pending', 'unpaid', NOW() - INTERVAL '3 hours'),

-- Approved applications
('44444444-4444-4444-4444-444444444444', 'Mike Johnson', '0829876543', 'mike@example.com', 6000.00, '2024-02-15', 7800.00, 'Standard Bank - 456789123 - Mike Johnson', 'approved', 'unpaid', NOW() - INTERVAL '5 days'),
('55555555-5555-5555-5555-555555555555', 'Emma Wilson', '0825432167', 'emma@example.com', 5500.00, '2024-02-12', 7150.00, 'Nedbank - 321654987 - Emma Wilson', 'approved', 'paid', NOW() - INTERVAL '7 days'),
('66666666-6666-6666-6666-666666666666', 'David Brown', '0828765432', 'david@example.com', 7200.00, '2024-01-30', 9360.00, 'FNB - 654321987 - David Brown', 'approved', 'overdue', NOW() - INTERVAL '15 days'),

-- Rejected applications
('77777777-7777-7777-7777-777777777777', 'Sarah Wilson', '0824567890', 'sarah@example.com', 2500.00, '2024-02-18', 3250.00, 'Capitec - 789123456 - Sarah Wilson', 'rejected', 'unpaid', NOW() - INTERVAL '4 days'),
('88888888-8888-8888-8888-888888888888', 'Tom Anderson', '0826789012', 'tom@example.com', 9500.00, '2024-02-22', 12350.00, 'Standard Bank - 147258369 - Tom Anderson', 'rejected', 'unpaid', NOW() - INTERVAL '6 days'),
('99999999-9999-9999-9999-999999999999', 'Maria Garcia', '0823210987', 'maria@example.com', 4800.00, '2024-02-16', 6240.00, 'ABSA - 963852741 - Maria Garcia', 'rejected', 'unpaid', NOW() - INTERVAL '8 days');

-- Update rejection reasons for rejected applications
UPDATE public.loan_applications 
SET rejection_reason = 'Credit score too low' 
WHERE email = 'sarah@example.com';

UPDATE public.loan_applications 
SET rejection_reason = 'Insufficient income verification' 
WHERE email = 'tom@example.com';

UPDATE public.loan_applications 
SET rejection_reason = 'Existing loan not settled' 
WHERE email = 'maria@example.com';

-- Update approved dates for approved applications
UPDATE public.loan_applications 
SET approved_date = created_at + INTERVAL '2 hours'
WHERE status = 'approved';
