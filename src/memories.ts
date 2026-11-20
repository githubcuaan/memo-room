export type Year = 1 | 2 | 3 | 4
export type Photo = { src: string; thumbnail?: string; alt: string; caption?: string }
export type Memory = {
  id: string
  year: Year | null
  slot: 0 | 1 | 2
  kind: 'photo' | 'note' | 'pending'
  title: string
  label?: string
  noteTitle?: string
  recipient?: string
  previewText?: string
  body?: string[]
  photo?: Photo
}
export type Story = {
  id: string
  narratorId: string
  memoryId: string
  title: string
  paragraphs: string[]
  photos?: Photo[]
  sample?: boolean
}
export const chapters: { year: Year; title: string; icon: string }[] = [
  { year: 1, title: 'Mùa xuân', icon: 'sprout' },
  { year: 2, title: 'Mùa hạ', icon: 'image' },
  { year: 3, title: 'Mùa thu', icon: 'book' },
  { year: 4, title: 'Mùa đông', icon: 'star' },
]
export const memories: Memory[] = [
  {
    id: 'y1-photo', year: 1, slot: 0, kind: 'note',
    title: 'Người truyền lửa', label: 'Note thầy Lâm', recipient: 'Phạm Tiến Lâm',
    previewText: 'Xuất thân là một con dân miền núi, em hoàn toàn không có bất kì trải nghiệm nào với máy tính và công nghệ',
    body: [
      'Xuất thân là một con dân miền núi, em hoàn toàn không có bất kì trải nghiệm nào với máy tính và công nghệ cộng thêm kết quả kì thi tốt nghiệp năm ấy rất tệ, em cảm thấy lạc lối trên chính con đường mình đã chọn.',
      'Ở nơi tối đen ấy, có một ngọn lửa đã dẫn lối cho em để tiếp tục đi trên con đường này. Đó là những bài giảng đầu tiên và nhưng câu truyện, trải nghiệm của thầy.',
      'Cảm ơn thầy, nếu không có thầy thắp nó lên thì chắc chắn sẽ không có thằng Đình An cháy rực lửa ngành như ngày hôm nay.',
      'Em chúc thầy Lâm sức khoẻ, 8386 phát tài phát lộc, hỉ sự như ý, triệu sự như mơ !',
    ],
  },
  {
    id: 'y1-note', year: 1, slot: 1, kind: 'note',
    title: 'Người giữ lửa', label: 'Note cô Hạnh', recipient: 'Bùi Thị Hạnh',
    previewText: 'Với ngọn lửa ngành còn đang nhỏ nhoi, em vẫn cố gắng trên con đường này và Đại Số Tuyến Tính chính là kiếp nạn đầu tiên.',
    body: [
      'Với ngọn lửa ngành còn đang nhỏ nhoi, em vẫn cố gắng trên con đường này và Đại Số Tuyến Tính chính là kiếp nạn đầu tiên. Cô Hạnh là người đã giữ cho ngọn lửa nhỏ đó không tắt bằng những bài giảng siêu có tâm với môn Đại Số Tuyến Tính khô khan.',
      'Con điểm A+ của em môn này là nhờ có cô, đó chính là những que củi mà cô đưa vào ngọn lửa học hành của em.',
      'Em chúc Cô Hạnh sức khoẻ, công tác tốt. Em mong cô sẽ tiếp tục đưa những que củi cho lứa học sinh tiếp theo để giữ được những ngọn lửa đó',
    ],
  },
  {
    id: 'y2-photo-a', year: 2, slot: 0, kind: 'photo', title: 'Ổ quỷ 20/11', label: 'Ảnh thầy Hưng',
    noteTitle: 'Problem solver', recipient: 'Nguyễn Quốc Hưng',
    body: [
      'Đầu năm 2 chưa kịp vui mừng thì kiếp nạn tiếp theo đã tới, Em bị mất học bổng khuyến khích học tập do nộp học phí muộn. Người ở bên hỗ trợ cũng như động viên, mặc dù đã cố gắng hết sức nhưng vẫn không thể cứu chữa.',
      'Cho đến hiện tại, thầy vẫn luôn ở bên và cố gắng giải quyết mọi vấn đề cho học sinh, siêu tâm huyết với nghề.',
      '+1 Respect cho sếp Hưng !',
      'Chúc thầy sức khoẻ dồi dào để tiếp tục giúp đỡ, carry lũ quỷ công nghệ thông tin. Em xin cảm ơn thầy !',
    ],
    photo: {
      src: `${import.meta.env.BASE_URL}anh/thay-hung.webp`,
      thumbnail: `${import.meta.env.BASE_URL}anh/thay-hung-nho.webp`,
      alt: 'Thầy Hưng chụp cùng các bạn sinh viên.',
    },
  },
  {
    id: 'y2-photo-b', year: 2, slot: 1, kind: 'photo', title: 'Tập thể OOP', label: 'Ảnh cô Vân',
    noteTitle: 'Hope Maker', recipient: 'Nguyễn Thị Vân',
    body: [
      'Một trong những cột mốc quan trọng của em là OOP, nó là nền tảng quan trọng với nhiều môn học sau này của em. Cô Vân đã cook môn này siêu ngon với phong cách và cá tính riêng của cô.',
      '1 Fact rất thú vị là cô từng trao niềm tin cho mình lên đứng lớp để dạy thay cô 1 tiết, dù buổi đó có hơi run nhưng em vẫn đã cố gắng hoàn thành. Hơi tiếc chút, giờ mà cho em lên lại khéo nói nhem nhẻm hâha.',
      'Chúc cô Vân giữ vững được phong cách, cá tính riêng của mình và tiếp tục truyền dạy kiến thức bổ ích cho các lứa tiếp nối !',
    ],
    photo: {
      src: `${import.meta.env.BASE_URL}anh/co-van.webp`,
      thumbnail: `${import.meta.env.BASE_URL}anh/co-van-nho.webp`,
      alt: 'Cô Vân chụp cùng lớp trong phòng học.',
    },
  },
  {
    id: 'y3-note-a', year: 3, slot: 0, kind: 'note',
    title: 'Đồ Án killer', label: 'Note Kim Thành', recipient: 'Nguyễn Kim Thành',
    previewText: 'Em có cơ duyên với thầy nhờ mấy anh em mời làm đồ án cùng, làm cùng đê mê luôn, làm luôn đồ án liên ngành =))',
    body: [
      'Em có cơ duyên với thầy nhờ mấy anh em mời làm đồ án cùng, làm cùng đê mê luôn, làm luôn đồ án liên ngành =))',
      'Phong cách làm việc chuyên nghiệp nhưng rất sáng tạo, đổi mới. Siêu hợp mấy ae genz.',
      'Em còn đang nợ thầy 2 dự án ma\n- Nghiên cứu khoa học\n- Startup sinh viên =))',
      'không thể tiếp tục do các thành viên đã có công việc riêng và dần tan rã. Em vẫn RẤT còn muốn thực hiện 2 dự án ma này với thầy, nếu thầy có đọc được lá thư này và rảnh rỗi để bỏ thời gian cho em thì thầy cân nhắc nhaaaa.',
    ],
  },
  {
    id: 'y3-note-b', year: 3, slot: 1, kind: 'note',
    title: 'Chúa Data', label: 'Note Trịnh Thành', recipient: 'Trịnh Thành',
    previewText: 'Lần đầu tiên em quyết định thử làm researcher, người em apply là thầy.',
    body: [
      'Lần đầu tiên em quyết định thử làm researcher, người em apply là thầy. Em thích phong cách giảng dạy của thầy, và phong cách nói chuyện của thầy nứa =))',
      'Do bản thân còn thiếu sót nên không thể tiếp tục làm cùng thầy, dẫu vậy trong quá trình đó em vẫn học được rất nhiều thứ !',
      'Em để note của thầy là chúa data vì mấy ae nào mà xin recomment thầy cô mấy môn data là em réo tên thầy hết :)',
      'Chúc thầy công tác tốt, tiếp tục carry mấy ae researcher lên trình lên người !',
    ],
  },
  {
    id: 'y3-note-c', year: 3, slot: 2, kind: 'note',
    title: 'Chất', label: 'Note thầy Dũng', recipient: 'Phạm Trung Dũng',
    previewText: 'Nếu chỉ được dùng một từ cho thầy, em xin phép dùng từ "Chất".',
    body: [
      'Nếu chỉ được dùng một từ cho thầy, em xin phép dùng từ "Chất".',
      'Họ Phạm giống em là biết rồi, nhắc tới tên học sinh nào cũng phải dè chừng =)))',
      'Em học 2 lần DSA đều của thầy không phải vì trượt, mà môn này em không được A+ tối vắt tay lên trán suy nghĩ không ngủ được :)',
      'Thầy cũng là người dẫn đoàn cho mấy anh em đi thi olympic tin học năm ngoái, trong đó có em.',
      'note: có mấy bức ảnh năm ngoái mà em bị mất mất rùi huhuhu',
      'Chúc thầy sức khoẻ công tác tốt, giữ vững quan điểm giảng dạy và tiếp tục hỗ trợ nhiều học sinh !',
    ],
  },
  {
    id: 'y4-photo', year: 4, slot: 0, kind: 'photo',
    title: 'nhậuuuu', label: 'Ảnh kỉ niệm cùng thầy Tuấn',
    noteTitle: 'Trao Cơ Hội', recipient: 'Nguyễn Kim Tuấn',
    body: [
      'Người đã trao cho em cơ hội để ra thao trường trinh chiến năm ngoái. Em đã thất bại.',
      'Tiếp nối sau câu truyện đó, thầy vẫn trao cho em một cơ hội nữa để thể hiện bản thân ở Olympic tin học toàn quốc năm nay. Không có lời nào có thể diễn tả tâm trạng của em lúc này.',
      'Cảm ơn thầy đã trao niềm tin ở nơi em, em sẽ cố gắng hết sức để không phụ lòng thầy.',
      'Chúc thầy Kim Tuấn 20-11 sức khoẻ, nhiều niềm vui trong công việc, dẫn dắt mấy anh em bảo mật phát triển rực rỡ !',
    ],
    photo: {
      src: `${import.meta.env.BASE_URL}anh/nhau-nam-4.webp`,
      thumbnail: `${import.meta.env.BASE_URL}anh/nhau-nam-4-nho.webp`,
      alt: 'Thầy Tuấn và các bạn sinh viên cùng nâng ly bên bàn ăn.',
    },
  },
  {
    id: 'y4-reserved', year: 4, slot: 1, kind: 'note', title: 'Note bí mật',
    previewText: 'Nhất tự vi sư, bán tự vi sư.',
    body: [
      'Nhất tự vi sư, bán tự vi sư.',
      'Shout out cho anh Nguyễn Chí Công với học phần Giao Diện Người Máy.',
      'Mặc dù anh không trực tiếp giúp em ý tưởng này nhưng nhờ buổi thảo luận về threejs em mới có được ý tưởng này',
      'Chúc anh sức khoẻ công tác tốt 2286 mãi mãi phát lộc.',
    ],
  },
]
export const tribute: Memory = {
  id: 'tribute', year: null, slot: 0, kind: 'note', title: 'Thư gửi thầy cô',
  body: [
    'Hối tiếc lớn nhất của em khi làm sản phẩm này là không thể gửi lời chúc đến tất cả các thầy cô.',
    'Nhân dịp 20/11 này, em xin chúc toàn thể các thầy cô trường Phenikaa dù đã dạy em hay chưa, dù em đã gặp hay chưa, sẽ có một ngày thật tuyệt, sức khoẻ lúc nào cũng phải tốt để có thế tiếp tục dẫn lối chúng em trên con đường học tập.',
    'Nghề nhà giáo luôn là một trong những ngành nghề em tôn trọng nhất trên cuộc đời này.',
    'Peace,\nPhạm Lê Đình An',
  ],
}
export const narrators: Record<string, { name: string; avatar?: string }> = {
  demo: { name: 'Người kể mẫu' },
}
export const stories: Story[] = [
  {
    id: 'demo-short', narratorId: 'demo', memoryId: 'y2-photo-a', title: 'Bản xem thử ngắn',
    sample: true, paragraphs: ['Đây là nội dung mẫu để xem cách một câu chuyện hiển thị bên dưới tấm ảnh. Nội dung này không kể lại một kỷ niệm có thật.'],
  },
  {
    id: 'demo-long', narratorId: 'demo', memoryId: 'y2-photo-a', title: 'Bản xem thử dài',
    sample: true, paragraphs: [
      'Đây là văn bản mẫu, không phải kỷ niệm cá nhân. Mỗi câu chuyện có thể chia thành nhiều đoạn để đọc dễ hơn trên màn hình nhỏ.',
      'Người kể có thể gửi kèm ảnh và chú thích. Khi nhận nội dung, ảnh bổ sung sẽ hiển thị ngay trong câu chuyện và chỉ tải khi được mở.',
      'Một kỷ niệm có thể có nhiều người kể. Chọn tên câu chuyện khác để chuyển lời kể mà không phải đóng khung ảnh.',
      'Khi nội dung thật sẵn sàng, các bản xem thử sẽ được ẩn và vị trí trên bảng vẫn được giữ nguyên.',
    ],
  },
]
export const preview = import.meta.env.VITE_SHOW_SAMPLES !== 'false'
export function chapterMemories(year: Year) {
  return memories.filter((entry) => entry.year === year)
}
