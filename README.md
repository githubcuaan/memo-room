# Phòng ký ức · 20/11

Trải nghiệm 3D toàn màn hình: mở phong bì, chạm tờ giấy để đọc lời mời từ Đại học Phenikaa và chọn **Yes** để vào bốn căn phòng của bốn năm. Mỗi phòng có bàn, bảng kỷ niệm và cửa sổ theo mùa xuân/hạ/thu/đông. Chuyển phòng bằng mũi tên hai bên hoặc chọn năm bên dưới; trên di động phòng được sắp lại để cả bảng và cửa sổ cùng xuất hiện.

Chọn bảng ký ức (hoặc nút **Xem gần bảng ký ức**) để phóng gần, rồi chọn ảnh hoặc note trên bảng để nhấc lên. Phong bì thư tri ân chỉ xuất hiện trên bàn Năm 4, với hiệu ứng hiện dần khi bước vào phòng. Rê chuột lên các vật phẩm để xem hiệu ứng nổi sáng. Kéo hoặc dùng các phím mũi tên để xoay 360°; chạm lần nữa hoặc dùng nút bên dưới để đọc note (ảnh trên bảng không mở lại ở trang đọc). Nhấn `Esc` để đặt vật trở lại vị trí cũ hoặc thoát góc nhìn gần. Nếu thiết bị không mở được 3D, nội dung vẫn có thể xem như một phương án dự phòng.

## Chạy và phát hành

Yêu cầu Node.js 20.19+ hoặc 22.12+.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Để phát hành, đặt `VITE_SHOW_SAMPLES=false` và `VITE_SITE_URL` theo tên miền/thư mục thật (xem `.env.example`). Build lại rồi đưa thư mục `dist/` lên máy chủ tĩnh; không cần backend. Mở URL đã triển khai để kiểm tra WebGL, phương án dự phòng khi WebGL lỗi và ảnh chia sẻ. Ảnh ở Năm 2 và Năm 4 mở thành note thay vì xem ảnh lớn; các lời nhắn chưa có nội dung thật hiển thị thông báo chờ bổ sung, cần thay trước khi ra mắt.

## Thêm nội dung

- `src/memories.ts`: giữ nguyên ID kỷ niệm khi thêm note (`body`) hoặc ảnh (`photo`). `slot` là vị trí trên bảng; `title` của ảnh là chú thích dưới ảnh, `noteTitle` là tiêu đề khi mở note. Note Năm 1–3 và note bí mật Năm 4 đã có nội dung; các mục còn thiếu vẫn ghi rõ trạng thái đang chờ bổ sung, không tự viết thay người kể.
- Đặt ảnh được phép đăng trong `public/`, chẳng hạn `public/anh/`. Với đường dẫn tương đối, dùng `` `${import.meta.env.BASE_URL}anh/ten-anh.webp` `` để hoạt động khi triển khai trong thư mục con. Điền `alt` cho ảnh và dùng `thumbnail` nhỏ riêng cho bảng 3D. Điền `body` nếu muốn lời nhắn xuất hiện khi mở ảnh; ảnh lớn không tải lại trong trang note.
- Thêm người kể trong `narrators`, rồi thêm mục trong `stories` gồm `id`, `narratorId`, `memoryId`, `title`, `paragraphs` và `photos` nếu có. Thứ tự trong mảng là thứ tự hiển thị. Không đặt `sample: true` cho bài đã duyệt.
- Ảnh thầy Hưng, cô Vân và kỷ niệm Năm 4 dùng bản web trong `public/anh/` (đã bỏ metadata); ảnh gốc nằm trong `assets/`. Bản phác thảo trong `docs/sketching/` không được đóng gói vào `dist/`; ảnh khác chưa được gán người hoặc năm cần xác nhận trước khi đăng.
- Note thầy Lâm mở kèm chân dung trong `public/anh/thay-lam.webp` và hiệu ứng lửa CSS. Bảng Năm 3 có ba note; note thầy Dũng dùng `public/anh/thay-dung.webp` với mũ, hai bụi cây, đạo cụ và nhãn “TRINH SÁT” dạng lớp minh hoạ. Ảnh nguồn trong `assets/` không được chỉnh sửa; các hiệu ứng dừng khi thiết bị yêu cầu giảm chuyển động.
