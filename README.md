# Phòng ký ức · 20/11

Trải nghiệm 3D toàn màn hình: mở phong bì, chạm tờ giấy để đọc lời mời từ Đại học Phenikaa và chọn **Yes** để vào bốn căn phòng của bốn năm. Mỗi phòng có bàn, bảng kỷ niệm và cửa sổ theo mùa xuân/hạ/thu/đông. Chuyển phòng bằng mũi tên hai bên hoặc chọn năm bên dưới; trên di động phòng được sắp lại để cả bảng và cửa sổ cùng xuất hiện.

Chọn bảng ký ức (hoặc nút **Xem gần bảng ký ức**) để phóng gần, rồi chọn phong bì trên bàn, ảnh hoặc note trên bảng để nhấc lên. Rê chuột lên các vật phẩm để xem hiệu ứng nổi sáng. Kéo hoặc dùng các phím mũi tên để xoay 360°; chạm lần nữa hoặc dùng nút bên dưới để mở và đọc nội dung. Nhấn `Esc` để đặt vật trở lại vị trí cũ hoặc thoát góc nhìn gần. Đường dẫn `?che-do=doc` mở bản đọc mà không tải Three.js.

## Chạy và phát hành

Yêu cầu Node.js 20.19+ hoặc 22.12+.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Để phát hành, đặt `VITE_SHOW_SAMPLES=false` và `VITE_SITE_URL` theo tên miền/thư mục thật (xem `.env.example`). Build lại rồi đưa thư mục `dist/` lên máy chủ tĩnh; không cần backend. Mở URL đã triển khai để kiểm tra WebGL, bản đọc và ảnh chia sẻ. Biến này ẩn story thử nghiệm; các vị trí ảnh/note chưa có nội dung thật vẫn hiển thị lời báo chờ bổ sung để giữ đúng bố cục, cần thay nội dung trước khi ra mắt.

## Thêm nội dung

- `src/memories.ts`: giữ nguyên ID kỷ niệm khi thêm note (`body`) hoặc ảnh (`photo`). `slot` là vị trí trái/phải trên bảng. Note thầy Lâm và cô Hạnh đã có nội dung; các note còn thiếu vẫn ghi rõ trạng thái đang chờ bổ sung, không tự viết thay người kể.
- Đặt ảnh được phép đăng trong `public/`, chẳng hạn `public/anh/`. Với đường dẫn tương đối, dùng `` `${import.meta.env.BASE_URL}anh/ten-anh.webp` `` để hoạt động khi triển khai trong thư mục con. Điền `alt` và `caption` cho ảnh; dùng `thumbnail` nhỏ riêng cho bảng 3D. Ảnh lớn chỉ tải khi người xem mở nội dung.
- Thêm người kể trong `narrators`, rồi thêm mục trong `stories` gồm `id`, `narratorId`, `memoryId`, `title`, `paragraphs` và `photos` nếu có. Thứ tự trong mảng là thứ tự hiển thị. Không đặt `sample: true` cho bài đã duyệt.
- Bản phác thảo và ZIP trong `docs/sketching/` không được đóng gói vào `dist/`. Ảnh trong ZIP chưa được xác nhận ảnh nào thuộc thầy Hưng/cô Vân/Kim Tuấn; cần xác nhận trước khi đăng.
