export type Year = 1 | 2 | 3 | 4
export type Photo = { src: string; thumbnail?: string; alt: string; caption?: string }
export type Memory = {
  id: string
  year: Year | null
  slot: 0 | 1
  kind: 'photo' | 'note' | 'pending'
  title: string
  label?: string
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
  { id: 'y2-photo-a', year: 2, slot: 0, kind: 'photo', title: 'Ảnh thầy Hưng' },
  { id: 'y2-photo-b', year: 2, slot: 1, kind: 'photo', title: 'Ảnh cô Vân' },
  { id: 'y3-note-a', year: 3, slot: 0, kind: 'note', title: 'Note Kim Thành' },
  { id: 'y3-note-b', year: 3, slot: 1, kind: 'note', title: 'Note Trịnh Thành' },
  { id: 'y4-photo', year: 4, slot: 0, kind: 'photo', title: 'Ảnh Kim Tuấn' },
  { id: 'y4-reserved', year: 4, slot: 1, kind: 'note', title: 'Note bí mật' },
]
export const tribute: Memory = {
  id: 'tribute', year: null, slot: 0, kind: 'note', title: 'Thư gửi thầy cô',
  body: [
    'Nhân ngày 20/11, chúng em xin gửi lời cảm ơn tới thầy cô vì đã dành thời gian, sự kiên nhẫn và niềm tin cho chúng em.',
    'Kính chúc thầy cô luôn mạnh khỏe, bình an và có thật nhiều niềm vui bên những thế hệ học trò.',
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
