-- 1. Tạo bảng lưu trữ lịch sử chat
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    messages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Bật tính năng Row Level Security (RLS) để bảo mật dữ liệu
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- 3. Tạo các chính sách bảo mật (Policies)

-- Chỉ cho phép người dùng xem dữ liệu chat của chính họ
CREATE POLICY "Users can view their own chats" 
ON chats FOR SELECT 
USING (auth.uid() = user_id);

-- Chỉ cho phép người dùng tạo dữ liệu chat mới với user_id của chính họ
CREATE POLICY "Users can insert their own chats" 
ON chats FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Chỉ cho phép người dùng cập nhật dữ liệu chat của chính họ
CREATE POLICY "Users can update their own chats" 
ON chats FOR UPDATE 
USING (auth.uid() = user_id);

-- Chỉ cho phép người dùng xóa dữ liệu chat của chính họ
CREATE POLICY "Users can delete their own chats" 
ON chats FOR DELETE 
USING (auth.uid() = user_id);
